import { useApp } from "./app";

/**
 * Returns the internal Fiber helpers.
 *
 * @see https://lab.getkirby.com/public/lab/internals/helpers/
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.app.$helper`.
 */
export function useHelpers() {
  return useApp().$helper;
}
