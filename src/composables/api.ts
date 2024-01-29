import { usePanel } from "./panel";

export function useApi() {
  return usePanel().api;
}
