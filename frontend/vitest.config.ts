import path from "node:path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"

// Minimal Vitest setup for component/unit tests. Kept separate from
// vite.config.ts (which drives the app build/dev server) so the test
// runner config doesn't need the dev-only Vite plugins registered there.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Only run unit tests colocated with source. The Playwright specs
    // under ./tests are end-to-end tests run separately via `npm test`.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
})
