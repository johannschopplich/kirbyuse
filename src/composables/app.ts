import { usePanel } from "./panel";

/**
 * Returns the main Panel Vue instance.
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.app`.
 */
export function useApp() {
  return usePanel().app;
}
