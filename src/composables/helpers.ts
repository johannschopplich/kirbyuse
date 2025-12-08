import { useApp } from "./app";

/**
 * Returns the internal Fiber helpers.
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.app.$helpers`.
 */
export function useHelpers() {
  return useApp().$helpers;
}
