/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), tailwindcss(), TanStackRouterVite()],
  server: {
    port: 5175,
    strictPort: false,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
