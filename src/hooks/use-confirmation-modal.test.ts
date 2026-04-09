import { describe, expect, it } from "vitest";

import { initialState, modalReducer } from "./use-confirmation-modal";

describe("modalReducer", () => {
  it("should return initial state for unknown action", () => {
    const result = modalReducer(initialState, { type: "UNKNOWN" as never });
    expect(result).toEqual(initialState);
  });

  it("should handle START_PROCESSING", () => {
    const result = modalReducer(initialState, {
      payload: { totalCount: 5 },
      type: "START_PROCESSING",
    });
    expect(result.confirming).toBe(true);
    expect(result.mode).toBe("progress");
    expect(result.progress).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it("should handle UPDATE_PROGRESS", () => {
    const state = {
      ...initialState,
      confirming: true,
      mode: "progress" as const,
    };
    const result = modalReducer(state, {
      payload: { increment: 1, repo: "my-repo" },
      type: "UPDATE_PROGRESS",
    });
    expect(result.progress).toBe(1);
    expect(result.currentRepo).toBe("my-repo");
  });

  it("should accumulate progress increments", () => {
    let state = {
      ...initialState,
      confirming: true,
      mode: "progress" as const,
    };
    state = modalReducer(state, {
      payload: { increment: 1, repo: "repo-1" },
      type: "UPDATE_PROGRESS",
    });
    state = modalReducer(state, {
      payload: { increment: 1, repo: "repo-2" },
      type: "UPDATE_PROGRESS",
    });
    expect(state.progress).toBe(2);
    expect(state.currentRepo).toBe("repo-2");
  });

  it("should handle ADD_ERROR", () => {
    const state = {
      ...initialState,
      confirming: true,
      mode: "progress" as const,
    };
    const error = new Error("Failed to archive");
    const result = modalReducer(state, {
      payload: { error },
      type: "ADD_ERROR",
    });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error.message).toBe("Failed to archive");
  });

  it("should handle ADD_ERROR with repository", () => {
    const state = {
      ...initialState,
      confirming: true,
      mode: "progress" as const,
    };
    const error = new Error("403 Forbidden");
    const repository = { name: "locked-repo" } as never;
    const result = modalReducer(state, {
      payload: { error, repository },
      type: "ADD_ERROR",
    });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].repository).toEqual(repository);
  });

  it("should accumulate multiple errors", () => {
    let state = {
      ...initialState,
      confirming: true,
      mode: "progress" as const,
    };
    state = modalReducer(state, {
      payload: { error: new Error("Error 1") },
      type: "ADD_ERROR",
    });
    state = modalReducer(state, {
      payload: { error: new Error("Error 2") },
      type: "ADD_ERROR",
    });
    expect(state.errors).toHaveLength(2);
  });

  it("should handle COMPLETE_PROCESSING", () => {
    const state = {
      ...initialState,
      confirming: true,
      mode: "progress" as const,
      progress: 3,
    };
    const result = modalReducer(state, { type: "COMPLETE_PROCESSING" });
    expect(result.confirming).toBe(false);
    expect(result.mode).toBe("result");
    expect(result.progress).toBe(3);
  });

  it("should handle SET_USERNAME with matching login", () => {
    const result = modalReducer(initialState, {
      payload: { login: "testuser", username: "testuser" },
      type: "SET_USERNAME",
    });
    expect(result.username).toBe("testuser");
    expect(result.isCorrectUsername).toBe(true);
  });

  it("should handle SET_USERNAME with non-matching login", () => {
    const result = modalReducer(initialState, {
      payload: { login: "testuser", username: "wronguser" },
      type: "SET_USERNAME",
    });
    expect(result.username).toBe("wronguser");
    expect(result.isCorrectUsername).toBe(false);
  });

  it("should handle SET_USERNAME case-sensitively", () => {
    const result = modalReducer(initialState, {
      payload: { login: "testuser", username: "TestUser" },
      type: "SET_USERNAME",
    });
    expect(result.isCorrectUsername).toBe(false);
  });

  it("should handle RESET", () => {
    const dirtyState = {
      confirming: true,
      currentRepo: "some-repo",
      errors: [{ error: new Error("fail") }],
      isCorrectUsername: true,
      mode: "result" as const,
      progress: 5,
      username: "testuser",
    };
    const result = modalReducer(dirtyState, { type: "RESET" });
    expect(result).toEqual(initialState);
  });

  it("should clear errors on START_PROCESSING", () => {
    const state = {
      ...initialState,
      errors: [{ error: new Error("old error") }],
    };
    const result = modalReducer(state, {
      payload: { totalCount: 5 },
      type: "START_PROCESSING",
    });
    expect(result.errors).toEqual([]);
  });

  it("should follow full lifecycle: confirmation -> progress -> result -> reset", () => {
    let state = initialState;

    state = modalReducer(state, {
      payload: { login: "user", username: "user" },
      type: "SET_USERNAME",
    });
    expect(state.mode).toBe("confirmation");
    expect(state.isCorrectUsername).toBe(true);

    state = modalReducer(state, {
      payload: { totalCount: 5 },
      type: "START_PROCESSING",
    });
    expect(state.mode).toBe("progress");
    expect(state.confirming).toBe(true);

    state = modalReducer(state, {
      payload: { increment: 1, repo: "repo-1" },
      type: "UPDATE_PROGRESS",
    });
    expect(state.progress).toBe(1);

    state = modalReducer(state, {
      payload: { error: new Error("failed") },
      type: "ADD_ERROR",
    });
    expect(state.errors).toHaveLength(1);

    state = modalReducer(state, { type: "COMPLETE_PROCESSING" });
    expect(state.mode).toBe("result");
    expect(state.confirming).toBe(false);

    state = modalReducer(state, { type: "RESET" });
    expect(state).toEqual(initialState);
  });
});
