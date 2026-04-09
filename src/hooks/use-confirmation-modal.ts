import { type Repository } from "@octokit/graphql-schema";
import { RequestError } from "@octokit/request-error";
import { useCallback, useMemo, useReducer, useRef } from "react";

import { useGitHubData } from "@/hooks/use-github-data";
import { analytics } from "@/utils/analytics";
import { debug } from "@/utils/debug";
import { createThrottledOctokit } from "@/github/client";
import { processRepo } from "@/github/mutations";

// --- Types ---

export type ModalMode = "confirmation" | "progress" | "result";

export type ModalAction =
  | { payload: { error: Error; repository?: Repository }; type: "ADD_ERROR" }
  | { payload: { increment: number; repo: string }; type: "UPDATE_PROGRESS" }
  | { payload: { login: string; username: string }; type: "SET_USERNAME" }
  | { type: "COMPLETE_PROCESSING" }
  | { type: "RESET" }
  | { payload: { totalCount: number }; type: "START_PROCESSING" };

export interface ModalState {
  confirming: boolean;
  currentRepo: string;
  errors: { error: Error; repository?: Repository }[];
  isCorrectUsername: boolean;
  mode: ModalMode;
  progress: number;
  totalCount: number;
  username: string;
}

export interface UseConfirmationModalProps {
  action: "archive" | "delete";
  login: string;
  onClose: () => void;
  onConfirm?: () => void;
  repos: Repository[];
}

export interface UseConfirmationModalReturn {
  handleConfirm: () => void;
  handleOnClose: () => void;
  handleSetUsername: (value: React.SetStateAction<string>) => void;
  handleStop: () => void;
  isDismissable: boolean;
  state: ModalState;
}

// --- Reducer ---

export const initialState: ModalState = {
  confirming: false,
  currentRepo: "",
  errors: [],
  isCorrectUsername: false,
  mode: "confirmation",
  progress: 0,
  totalCount: 0,
  username: "",
};

export function modalReducer(
  state: ModalState,
  action: ModalAction,
): ModalState {
  switch (action.type) {
    case "ADD_ERROR":
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };
    case "COMPLETE_PROCESSING":
      return {
        ...state,
        confirming: false,
        mode: "result",
      };
    case "RESET":
      return initialState;
    case "SET_USERNAME":
      return {
        ...state,
        isCorrectUsername: action.payload.username === action.payload.login,
        username: action.payload.username,
      };
    case "START_PROCESSING":
      return {
        ...state,
        confirming: true,
        errors: [],
        mode: "progress",
        progress: 0,
        totalCount: action.payload.totalCount,
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        currentRepo: action.payload.repo,
        progress: state.progress + action.payload.increment,
      };
    default:
      return state;
  }
}

// --- Hook ---

/**
 * Custom hook for managing the confirmation modal state machine.
 *
 * Handles:
 * - State transitions (confirmation -> progress -> result)
 * - Username validation
 * - Batch repo processing with abort support
 * - Analytics tracking
 * - Error collection
 */
export function useConfirmationModal({
  action,
  login,
  onClose,
  onConfirm,
  repos,
}: UseConfirmationModalProps): UseConfirmationModalReturn {
  const { mutate, pat } = useGitHubData();

  const octokit = useMemo(
    () => (pat ? createThrottledOctokit(pat) : null),
    [pat],
  );

  const [state, dispatch] = useReducer(modalReducer, initialState);
  const abortRef = useRef(false);

  const handleConfirmAsync = useCallback(async () => {
    debug.log("handleConfirm called");

    if (!octokit || state.confirming) return;

    abortRef.current = false;
    dispatch({
      payload: { totalCount: repos.length },
      type: "START_PROCESSING",
    });

    if (action === "archive") {
      analytics.trackArchiveActionSubmitted(repos.length);
    } else {
      analytics.trackDeleteActionSubmitted(repos.length);
    }

    for (const repo of repos) {
      if (abortRef.current) break;

      try {
        await processRepo(octokit, repo, action);

        // Optimistically remove this repo from table immediately
        void mutate(
          (current) => {
            if (!current?.repos) return current;
            return {
              ...current,
              repos: current.repos.filter((r) => r.id !== repo.id),
            };
          },
          { revalidate: false },
        );
      } catch (thrown) {
        const error =
          thrown instanceof Error ? thrown : new Error(String(thrown));
        debug.error(`Failed to ${action} the repo:`, error);
        dispatch({
          payload: { error, repository: repo },
          type: "ADD_ERROR",
        });

        if (thrown instanceof RequestError && thrown.status === 401) {
          debug.error(
            "Authentication failed — stopping batch early. Token may have expired.",
          );
          break;
        }
      } finally {
        dispatch({
          payload: { increment: 1, repo: repo.name },
          type: "UPDATE_PROGRESS",
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    dispatch({ type: "COMPLETE_PROCESSING" });
    setTimeout(() => {
      onConfirm?.();
    }, 100);
  }, [action, mutate, octokit, onConfirm, repos, state.confirming]);

  const handleConfirm = useCallback(
    () => void handleConfirmAsync(),
    [handleConfirmAsync],
  );

  const handleStop = useCallback(() => {
    abortRef.current = true;
  }, []);

  const handleOnClose = useCallback(() => {
    // Trigger background revalidation to sync with server state
    // (optimistic update already removed successful repos from cache)
    if (state.mode === "result") {
      void mutate();
    }
    onClose();
    dispatch({ type: "RESET" });
  }, [mutate, onClose, state.mode]);

  const handleSetUsername = useCallback(
    (value: React.SetStateAction<string>) => {
      if (typeof value === "function") {
        const updater = value as (prevState: string) => string;
        const newValue = updater(state.username);
        dispatch({
          payload: { login, username: newValue },
          type: "SET_USERNAME",
        });
      } else {
        dispatch({ payload: { login, username: value }, type: "SET_USERNAME" });
      }
    },
    [login, state.username],
  );

  const isDismissable = state.mode === "confirmation";

  return {
    handleConfirm,
    handleOnClose,
    handleSetUsername,
    handleStop,
    isDismissable,
    state,
  };
}
