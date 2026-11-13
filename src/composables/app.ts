import { usePanel } from "./panel";

/**
 * Returns the Panel's Vue application.
 */
export function useApp() {
  return usePanel().app;
}
