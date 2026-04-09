import * as Sentry from "@sentry/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./error-boundary";

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

// Suppress React error boundary console output in tests
function renderWithErrorBoundary(ui: React.ReactElement) {
  const spy = vi.spyOn(console, "error").mockImplementation(vi.fn());
  const result = render(<ErrorBoundary>{ui}</ErrorBoundary>);
  spy.mockRestore();
  return result;
}

// Component that throws on render
function ThrowingComponent({ error }: { error: Error }) {
  throw error;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders default fallback with role='alert' when error occurs", () => {
    renderWithErrorBoundary(
      <ThrowingComponent error={new Error("test error")} />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent error={new Error("test error")} />
      </ErrorBoundary>,
    );
    spy.mockRestore();

    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls Sentry.captureException with the caught error", () => {
    const error = new Error("sentry test error");
    renderWithErrorBoundary(<ThrowingComponent error={error} />);

    expect(Sentry.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        contexts: expect.objectContaining({
          react: expect.objectContaining({
            componentStack: expect.any(String),
          }),
        }),
      }),
    );
  });

  it("resets error state when Try Again is clicked", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function MaybeThrow() {
      if (shouldThrow) {
        throw new Error("test error");
      }
      return <p>Recovered</p>;
    }

    const spy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    );
    spy.mockRestore();

    expect(screen.getByRole("alert")).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Try Again" }));

    expect(screen.getByText("Recovered")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
