import type { Panel } from "kirby-types";

/**
 * Returns the reactive Kirby Panel object.
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel`.
 */
export function usePanel(): Panel {
  return window.panel;
}
