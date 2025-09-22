import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/composables.ts", "src/props.ts"],
  dts: true,
  unbundle: true,
});
