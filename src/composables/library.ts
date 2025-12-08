import { useApp } from "./app";

/**
 * Returns the internal Kirby Panel libraries (dayjs, colors and autosize).
 *
 * @see https://lab.getkirby.com/public/lab/internals/library.colors
 * @see https://lab.getkirby.com/public/lab/internals/library.dayjs
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.app.$library`.
 */
export function useLibrary() {
  return useApp().$library;
}
