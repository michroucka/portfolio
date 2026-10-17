import { cs, type Dictionary } from "./cs";
import { en } from "./en";

export const locales = ["cs", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "cs";

export const languageNames: Record<Locale, string> = {
	cs: "Čeština",
	en: "English",
};

const dictionaries: Record<Locale, Dictionary> = {
	cs,
	en,
};

const ogLocales: Record<Locale, string> = {
	cs: "cs_CZ",
	en: "en_US",
};

export function isLocale(value: string | undefined): value is Locale {
	return locales.includes(value as Locale);
}

export function resolveOgLocale(locale: Locale): string {
	return ogLocales[locale];
}

export function getDictionary(locale: Locale): Dictionary {
	return dictionaries[locale];
}
