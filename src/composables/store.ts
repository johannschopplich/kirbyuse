import { globalVue } from "../vue";

export function useStore() {
  return (globalVue.getCurrentInstance()?.proxy as any).$store;
}
