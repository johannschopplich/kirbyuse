import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/composables", "src/props"],
  clean: true,
  declaration: true,
});
