import { useApp } from "./app";

/**
 * Returns the internal Kirby Panel libraries (dayjs, colors and autosize).
 *
 * @see https://lab.getkirby.com/public/lab/internals/library.colors
 * @see https://lab.getkirby.com/public/lab/internals/library.dayjs
 */
export function useLibrary() {
  return useApp().config.globalProperties.$library;
}
