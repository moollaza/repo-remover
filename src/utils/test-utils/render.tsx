import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

import { GitHubDataProvider } from "@/providers/github-data-provider";

/**
 * Custom render function that wraps components with BrowserRouter + GitHubDataProvider.
 * Use this instead of RTL's render for components that need GitHub context or routing.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <GitHubDataProvider>{children}</GitHubDataProvider>
    </BrowserRouter>
  );
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Export renderWithProviders as the default render
export { renderWithProviders as render };
