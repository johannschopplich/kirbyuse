import { usePanel } from "./panel";

/**
 * Returns translation utility functions.
 *
 * @remarks
 * In most cases, use `usePanel().t` for Kirby's built-in translation function. This composable is useful for custom translation objects keyed by language code.
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
    return value[panel.translation.code] ?? Object.values(value)[0];
  }

  return {
    t,
  };
}

/**
 * Converts a Kirby translation code like `pt_BR` or `sr@latin`, which `Intl` rejects, to a BCP 47 locale.
 *
 * @example
 * ```ts
 * const locale = toIntlLocale(usePanel().translation.code)
 * new Intl.DateTimeFormat(locale).format(date)
 * ```
 */
export function toIntlLocale(translationCode: string): string {
  return translationCode.replace("_", "-").replace("@latin", "-Latn");
}
