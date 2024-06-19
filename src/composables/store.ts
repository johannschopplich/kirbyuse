import { globalVue } from "../vue";

interface Store<S> {
  readonly state: S;
  readonly getters: any;
}

export function useStore() {
  const proxy = globalVue.getCurrentInstance()?.proxy as Record<string, any>;
  return proxy.$store as Store<any>;
}
