import type * as Vue from "vue";

declare global {
  interface Window {
    Vue: typeof Vue;
    panel: Record<string, any>;
  }
}
