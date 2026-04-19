import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      curly: "error",
      "typescript/no-explicit-any": ["error", { fixToUnknown: true }],
      "typescript/no-unsafe-type-assertion": "error",
    },
  },
});
