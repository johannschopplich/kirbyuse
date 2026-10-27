import { useApp } from "./app";

/**
 * Returns the internal Panel helpers.
 *
 * @see https://lab.getkirby.com/public/lab/internals/helpers/
 */
export function useHelpers() {
  return useApp().config.globalProperties.$helper;
}
