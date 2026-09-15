import type { Panel } from "kirby-types";

declare global {
  interface Window {
    panel: Panel;
  }
}

export * from "./composables";
export * from "./utils";
