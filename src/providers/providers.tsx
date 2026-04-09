import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { type ReactNode } from "react";

import { GitHubDataProvider } from "@/providers/github-data-provider";

export interface ProvidersProps {
  children: ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <NextThemesProvider {...themeProps}>
      <GitHubDataProvider>{children}</GitHubDataProvider>
    </NextThemesProvider>
  );
}
