import { render, screen, waitFor } from "@/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { server } from "@/mocks/server";

import GitHubTokenForm from "./github-token-form";

describe("GitHubTokenForm", () => {
  const mockOnValueChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();

  // Helper function to render the form and get input and submit button
  const setupForm = (props = {}) => {
    const defaultProps = {
      onSubmit: mockOnSubmit,
      onValueChange: mockOnValueChange,
      value: "",
    };

    render(<GitHubTokenForm {...defaultProps} {...props} />);
    const input = screen.getByLabelText(/Personal Access Token/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    return { input, submitButton };
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  test("renders input field and submit button", () => {
    const { input, submitButton } = setupForm();

    expect(input).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test("calls onValueChange when input changes", async () => {
    const { input } = setupForm();

    await user.type(input, "t");
    expect(mockOnValueChange).toHaveBeenCalledWith("t");
  });

  test("calls onValueChange with empty string when cleared", async () => {
    setupForm({ value: "test-token" });

    // Find and click the clear button
    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    expect(mockOnValueChange).toHaveBeenCalledWith("");
  });

  test("shows error for invalid token format", () => {
    setupForm({ value: "invalid-token" });

    expect(
      screen.getByText(/Invalid GitHub token format/i),
    ).toBeInTheDocument();
  });

  test("calls onSubmit with token and remember=true by default", async () => {
    const { submitButton } = setupForm({
      value: "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
    });

    // Wait for API validation to complete and button to become enabled
    await waitFor(() => expect(submitButton).not.toBeDisabled(), {
      timeout: 2000,
    });

    // Submit the form
    await user.click(submitButton);

    // onSubmit should be called with the token and remember=true
    expect(mockOnSubmit).toHaveBeenCalledWith(
      "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
      true,
    );
  });

  test("remember me checkbox is checked by default", () => {
    setupForm();

    const checkbox = screen.getByTestId("github-token-remember");
    expect(checkbox).toBeChecked();
  });

  test("remember me checkbox can be toggled", async () => {
    setupForm();

    const checkbox = screen.getByTestId("github-token-remember");
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test("calls onSubmit with remember=false when checkbox is unchecked", async () => {
    const { submitButton } = setupForm({
      value: "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
    });

    // Uncheck remember me
    const checkbox = screen.getByTestId("github-token-remember");
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Wait for API validation to complete and button to become enabled
    await waitFor(() => expect(submitButton).not.toBeDisabled(), {
      timeout: 2000,
    });

    // Submit the form
    await user.click(submitButton);

    // onSubmit should be called with remember=false
    expect(mockOnSubmit).toHaveBeenCalledWith(
      "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
      false,
    );
  });

  test("renders token input as password type by default", () => {
    const { input } = setupForm({ value: "ghp_test" });

    expect(input).toHaveAttribute("type", "password");
  });

  test("toggles token visibility when eye button is clicked", async () => {
    const { input } = setupForm({ value: "ghp_test" });

    // Default: password (masked)
    expect(input).toHaveAttribute("type", "password");

    // Click the show token button
    const toggleButton = screen.getByRole("button", { name: /show token/i });
    await user.click(toggleButton);

    // Now: text (visible)
    expect(input).toHaveAttribute("type", "text");

    // Click again to hide
    const hideButton = screen.getByRole("button", { name: /hide token/i });
    await user.click(hideButton);

    // Back to password
    expect(input).toHaveAttribute("type", "password");
  });

  test("shows scope warnings when token is missing scopes", async () => {
    // Override rate_limit to return empty scopes (classic PAT with no scopes)
    server.use(
      http.get("https://api.github.com/rate_limit", () => {
        return HttpResponse.json(
          {
            rate: {
              limit: 5000,
              remaining: 4999,
              reset: Math.floor(Date.now() / 1000) + 3600,
              used: 1,
            },
            resources: {},
          },
          { headers: { "X-OAuth-Scopes": "" } },
        );
      }),
    );

    setupForm({ value: "ghp_abcdefghijklmnopqrstuvwxyz1234567890" });

    // Wait for validation + scope check to complete
    await waitFor(
      () => {
        expect(screen.getByTestId("scope-warnings")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(
      screen.getByText(/private repositories won't be visible/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you won't be able to delete repositories/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/organization repositories won't be visible/i),
    ).toBeInTheDocument();
  });

  test("no scope warnings when all scopes are present", async () => {
    // Default MSW handlers return all scopes
    setupForm({ value: "ghp_abcdefghijklmnopqrstuvwxyz1234567890" });

    // Wait for validation to complete
    await waitFor(
      () => {
        expect(screen.getByText(/Token is valid/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Should NOT show scope warnings
    expect(screen.queryByTestId("scope-warnings")).not.toBeInTheDocument();
  });

  test("doesn't call onSubmit when token is invalid", async () => {
    const { submitButton } = setupForm({
      value: "invalid-token",
    });

    // Button should be disabled
    expect(submitButton).toBeDisabled();

    // Try to submit the form
    await user.click(submitButton);

    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
