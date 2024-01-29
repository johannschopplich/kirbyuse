import { usePanel } from "./panel";

export function useApp() {
  return usePanel().app;
}
