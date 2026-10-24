import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
// GeoTIFF's worker detection expects a main process; fork workers also allow
// testing the real binary decoder rather than mocking its implementation.
export default defineConfig({ resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } }, test: { include: ["tests/**/*.test.ts"], pool: "forks", maxWorkers: 1 } });
