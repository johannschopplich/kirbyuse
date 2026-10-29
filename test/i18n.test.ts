import { describe, expect, it } from "vitest";
import { toIntlLocale } from "../src/composables/i18n";

describe("toIntlLocale", () => {
  it.each([
    ["pt_BR", "pt-BR"],
    ["sr@latin", "sr-Latn"],
    ["de", "de"],
  ])("converts %s to the Intl locale %s", (translationCode, locale) => {
    expect(toIntlLocale(translationCode)).toBe(locale);
  });
});
