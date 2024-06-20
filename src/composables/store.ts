import { usePanel } from "./panel";

export function useStore() {
  return usePanel().app.$store;
}
