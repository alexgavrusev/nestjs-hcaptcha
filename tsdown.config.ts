import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "node",
  format: "commonjs",
  exports: true,
  dts: true,
  sourcemap: true,
});
