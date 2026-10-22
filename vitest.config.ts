import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/app/api/**/*.ts"],
      // Browser-only beacon and env parsing are exercised by the build and e2e smoke checks.
      exclude: ["src/**/*.test.ts", "src/lib/analytics/track.ts", "src/lib/env.ts"],
      thresholds: { statements: 90, branches: 80, functions: 90, lines: 90 },
    },
  },
});
