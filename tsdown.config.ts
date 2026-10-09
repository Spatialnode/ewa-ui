import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/recharts.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: false,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
  publint: true,
});