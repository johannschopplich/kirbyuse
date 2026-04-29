import type { VueConstructor } from "vue";
import type * as VueNamespace from "vue";

export type VueGlobal = VueConstructor & Omit<typeof VueNamespace, "default">;

declare global {
  interface Window {
    Vue: VueGlobal;
  }
}

export const globalVue: VueGlobal = window.Vue;
