import { type Repository } from "@octokit/graphql-schema";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";

interface ConfirmationModalProps {
  action: "archive" | "delete";
  isOpen: boolean;
  login: string;
  onClose: () => void;
  onConfirm?: () => void;
  repos: Repository[];
}

interface RepoActionConfirmationProps
  extends Pick<ConfirmationModalProps, "action" | "onClose" | "repos"> {
  count: number;
  handleConfirm: () => void;
  isCorrectUsername: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  username: string;
}

interface RepoActionProgressProps {
  action: "archive" | "delete";
  count: number;
  currentRepo: string;
  onStop: () => void;
  progress: number;
}

interface RepoActionResultProps {
  action: "archive" | "delete";
  count: number;
  errors?: { error: Error; repository?: Repository }[];
  onClose: () => void;
}

export default function ConfirmationModal({
  action,
  isOpen,
  login,
  onClose,
  onConfirm,
  repos,
}: ConfirmationModalProps) {
  const {
    handleConfirm,
    handleOnClose,
    handleSetUsername,
    handleStop,
    isDismissable,
    state,
  } = useConfirmationModal({ action, login, onClose, onConfirm, repos });

  // Use totalCount from state during progress/result (immune to SWR cache updates)
  const count = state.mode === "confirmation" ? repos.length : state.totalCount;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Block dismissal during progress mode
        if (!open && !isDismissable) return;
        if (!open) handleOnClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogOverlay className="z-[100] bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Popup
          data-testid="repo-confirmation-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="relative w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-xl bg-background border border-divider shadow-2xl"
            data-testid={`confirmation-modal-${state.mode}`}
          >
            {state.mode === "confirmation" && (
              <RepoActionConfirmation
                action={action}
                count={count}
                handleConfirm={handleConfirm}
                isCorrectUsername={state.isCorrectUsername}
                onClose={handleOnClose}
                repos={repos}
                setUsername={handleSetUsername}
                username={state.username}
              />
            )}

            {state.mode === "progress" && (
              <RepoActionProgress
                action={action}
                count={count}
                currentRepo={state.currentRepo}
                onStop={handleStop}
                progress={state.progress}
              />
            )}

            {state.mode === "result" && (
              <RepoActionResult
                action={action}
                count={state.progress}
                errors={state.errors}
                onClose={handleOnClose}
              />
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

function RepoActionConfirmation({
  action,
  count,
  handleConfirm,
  isCorrectUsername,
  onClose,
  repos,
  setUsername,
  username,
}: RepoActionConfirmationProps) {
  return (
    <>
      <div
        className="px-6 py-4 border-b border-divider"
        data-testid="confirmation-modal-header"
      >
        <h3 className="text-lg font-semibold text-foreground">
          Confirm {action === "archive" ? "Archival" : "Deletion"}
        </h3>
      </div>
      <div
        className="px-6 py-4 text-foreground"
        data-testid="confirmation-modal-body"
      >
        <p>
          Are you sure you want to <b>{action}</b> the following {count}{" "}
          repositor{count > 1 ? "ies" : "y"}?
        </p>
        <ul className="list-disc list-inside">
          {repos.map((repo, index) => (
            <li key={index}>{repo.name}</li>
          ))}
        </ul>
        <strong className="mt-4 block">
          Please type your GitHub username to confirm:
        </strong>
        <Input
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          className="mt-2 h-auto bg-content2 px-3 py-2 text-foreground placeholder:text-default-400 border-divider"
          data-testid="confirmation-modal-input"
          id="username"
          name="username"
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub Username"
          type="text"
          value={username}
        />
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t border-divider">
        <Button
          variant="outline"
          data-testid="confirmation-modal-cancel"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant={action === "archive" ? "warning" : "destructive"}
          data-testid="confirmation-modal-confirm"
          disabled={!isCorrectUsername}
          name="confirm"
          onClick={() => {
            void handleConfirm();
          }}
        >
          I understand the consequences, {action} the repositor
          {count > 1 ? "ies" : "y"}
        </Button>
      </div>
    </>
  );
}

function RepoActionProgress({
  action,
  count,
  currentRepo,
  onStop,
  progress,
}: RepoActionProgressProps) {
  const percentage = count > 0 ? Math.round((progress / count) * 100) : 0;
  const actionVerb = action === "archive" ? "Archiving" : "Deleting";

  return (
    <>
      <div
        className="px-6 py-4 border-b border-divider"
        data-testid="progress-modal-header"
      >
        <h3 className="text-lg font-semibold text-foreground">
          {actionVerb} Repositories
        </h3>
      </div>
      <div className="px-6 py-6 text-foreground space-y-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-default-500">
            {actionVerb}{" "}
            <span className="font-medium text-foreground">{currentRepo}</span>
          </span>
          <span className="font-medium tabular-nums">
            {progress} / {count}
          </span>
        </div>

        <div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-default-200">
            <div
              className="h-full rounded-full bg-[var(--brand-blue)] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-default-400 text-right">
            {percentage}%
          </p>
        </div>
      </div>
      <div className="flex justify-end px-6 py-4 border-t border-divider">
        <Button variant="outline" onClick={onStop}>
          Stop
        </Button>
      </div>
    </>
  );
}

function RepoActionResult({
  action,
  count,
  errors,
  onClose,
}: RepoActionResultProps) {
  const errorCount = errors ? errors.length : 0;

  return (
    <>
      <div
        className="px-6 py-4 border-b border-divider"
        data-testid="result-modal-header"
      >
        <h3 className="text-lg font-semibold text-foreground">
          {action === "archive" ? "Archival" : "Deletion"} Complete
        </h3>
      </div>
      <div className="px-6 py-4 text-foreground">
        <p>
          {count - errorCount} out of {count} repos{" "}
          {action === "archive" ? "archived" : "deleted"} successfully.
        </p>

        {/* Report Errors */}
        {errorCount > 0 && (
          <>
            <p className="mt-4">
              {errorCount} error{errorCount > 1 ? "s" : ""} occurred while{" "}
              {action === "archive" ? "archiving" : "deleting"} the following{" "}
              repositor{errorCount > 1 ? "ies" : "y"}:
            </p>
            <ul className="list-disc list-inside">
              {errors?.map(({ error, repository }, index) => (
                <li key={index}>
                  {repository ? repository.name : "Unknown Repository"}:{" "}
                  {error.message}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t border-divider">
        <Button
          variant="outline"
          data-testid="repo-action-result-close"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </>
  );
}
