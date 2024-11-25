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
}

/** @deprecated The Vuex store is removed in Kirby 5 */
export function useStore() {
  // @ts-expect-error: Removed in Kirby 5
  const store = usePanel().app.$store as Readonly<PanelAppStore>;

  if (!store) {
    throw new Error(
      "Vuex store is not available. Are you using Kirby 5? Use the `useContent` composable instead.",
    );
  }

  return store;
}
