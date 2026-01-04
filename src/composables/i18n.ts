import { usePanel } from "./panel";

/**
 * Returns translation utility functions.
 *
 * @remarks
 * In most cases, use `window.panel.t` for Kirby's built-in translation function. This composable is useful for custom translation objects, such as those returned by a section's `label` property.
 *
 * @example
 * ```ts
 * const { t } = useI18n()
 *
 * // Simple string
 * t("Hello") // -> "Hello"
 *
 * // Translation object
 * t({ en: "Hello", de: "Hallo" }) // -> Returns value based on current Panel language
 * ```
 */
export function useI18n() {
  const panel = usePanel();

  function t(value?: string | Record<string, string>) {
    if (!value || typeof value === "string") return value;
    return value[panel.translation.code!] ?? Object.values(value)[0];
  }

  return {
    t,
  };
}
