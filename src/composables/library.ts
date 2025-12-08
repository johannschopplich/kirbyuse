import { useApp } from "./app";

/**
 * Returns the internal Fiber $library object (dayjs, colors and autosize).
 *
 * @remarks
 * This composable is a simple shortcut to `window.panel.app.$library`.
 */
export function useLibrary() {
  return useApp().$library;
}
