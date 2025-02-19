import { isKirby5 } from "./compatibility";
import { usePanel } from "./panel";

type PanelAppStoreState = Record<string, any>;
interface PanelAppStoreGetters {
  "content/exists": (arg1?: any, arg2?: any) => any;
  "content/hasChanges": (arg1?: any) => any;
  "content/isCurrent": () => any;
  "content/id": (arg1?: any) => any;
  "content/model": (arg1?: any) => any;
  "content/originals": (arg1?: any) => any;
  "content/values": (arg1?: any) => any;
  "content/changes": (arg1?: any) => any;
}

interface PanelAppStore {
  state: PanelAppStoreState;
  getters: PanelAppStoreGetters;
  commit: (arg1: any, arg2: any, arg3: any) => any;
  dispatch: (arg1: any, arg2: any) => any;
}

/**
 * Returns the Vuex store of the Panel app.
 *
 * @deprecated The Vuex store is removed in Kirby 5. Use the `useContent` composable instead.
 */
export function useStore() {
  if (isKirby5()) {
    return new Proxy({} as Readonly<PanelAppStore>, {
      get() {
        throw new Error(
          "Vuex store is not available. Are you using Kirby 5? Use the `useContent` composable instead.",
        );
      },
    });
  }

  // @ts-expect-error: `window.panel.app.$store` is not available in Kirby 5
  const store = usePanel().app.$store as Readonly<PanelAppStore>;

  return store;
}
