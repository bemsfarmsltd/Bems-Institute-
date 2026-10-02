import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/__tests__/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Tests hit the real local/CI Postgres sequentially per file to avoid
    // two test files racing on the same rows (e.g. two files both
    // creating/cleaning up a Cohort).
    fileParallelism: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
