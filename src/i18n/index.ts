import { cs, type Dictionary } from "./cs";
import { en } from "./en";

export const locales = ["cs", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "cs";

const dictionaries: Record<Locale, Dictionary> = {
	cs,
	en,
};

export function isLocale(value: string | undefined): value is Locale {
	return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
	return dictionaries[locale];
}
