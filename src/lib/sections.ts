import type { Dictionary } from "../i18n/cs";

export const sections = [
	"services",
	"projects",
	"collaboration",
	"about",
	"contact",
] as const satisfies readonly (keyof Dictionary["nav"])[];

export type Section = (typeof sections)[number];
