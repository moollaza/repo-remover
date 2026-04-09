import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@e2e": path.resolve(__dirname, "./e2e"),
    },
  },
  test: {
    environment: "jsdom",
    exclude: ["**/e2e/**", "**/node_modules/**", "**/.claude/worktrees/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
