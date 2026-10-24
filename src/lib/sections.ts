import type { Locale } from "../i18n";
import type { Dictionary } from "../i18n/cs";
import { getPath } from "../i18n/routes";

export const sections = [
	"services",
	"projects",
	"about",
	"collaboration",
	"contact",
] as const satisfies readonly (keyof Dictionary["nav"])[];

export type Section = (typeof sections)[number];

export function getSectionHref(section: Section, locale: Locale): string {
	return `${getPath("home", locale)}#${section}`;
}
