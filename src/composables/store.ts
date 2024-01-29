import { globalVue } from "../vue";

export function useStore() {
  const proxy = globalVue.getCurrentInstance()?.proxy as Record<string, any>;
  return proxy.$store;
}
