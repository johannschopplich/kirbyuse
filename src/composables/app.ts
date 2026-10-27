import { usePanel } from "./panel";

/**
 * Returns the main Panel Vue instance.
 */
export function useApp() {
  return usePanel().app;
}
