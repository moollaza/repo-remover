import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@e2e": resolve(__dirname, "./e2e"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    manifest: true,
    target: "es2020",
    rollupOptions: {
      output: {
        // Only split react-vendor. Letting Rollup auto-split the rest keeps
        // Octokit inside the dashboard/form lazy chunks (and any shared-dep
        // chunk Rollup extracts), instead of leaking it into the entry via
        // shared dependencies like @babel/runtime.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react/") ||
              id.includes("react-dom/") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
          }
        },
      },
    },
  },
});
