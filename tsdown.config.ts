import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    props: "src/props/index.ts",
  },
  deps: {
    neverBundle: ["vue"],
  },
  dts: true,
  platform: "neutral",
});
