import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { type ReactNode } from "react";

export interface ProvidersProps {
  children: ReactNode;
  themeProps?: ThemeProviderProps;
}

/**
 * App-root providers. Intentionally theme-only so the home route can ship
 * without Octokit / GitHub auth code. `GitHubDataProvider` is mounted inside
 * the dashboard route subtree.
 */
export function Providers({ children, themeProps }: ProvidersProps) {
  return <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>;
}
