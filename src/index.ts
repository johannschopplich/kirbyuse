import type { Panel as PanelType } from "kirby-types";

declare global {
  interface Window {
    panel: PanelType;
  }
}

export * from "./composables";
export * from "./utils";
// Re-export Vue Composition API functions
export * from "./vue";
