import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "html"],
      all: true, // include files that weren't touched by tests
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts", // barrel file
        "src/**/types", // pure type files
        "src/constants.ts", // constants
        "src/rpc/abi.ts", // generated file
        "dist",
        "**/*.test.ts",
      ],
    },
  },
});
