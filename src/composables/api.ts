import { usePanel } from "./panel";

/**
 * Returns Kirby's Panel API for making HTTP requests to the backend.
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.api`.
 */
export function useApi() {
  return usePanel().api;
}
