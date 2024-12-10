import { usePanel } from "./panel";

/**
 * Returns Kirby's Panel API.
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.api`.
 */
export function useApi() {
  return usePanel().api;
}
