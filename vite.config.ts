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
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react/") ||
              id.includes("react-dom/") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
            if (id.includes("@octokit")) {
              return "octokit-vendor";
            }
          }
        },
      },
    },
  },
});
