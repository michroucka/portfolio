import type { Locale } from "./index";

export const pages = ["home", "project", "privacy"] as const;

export type Page = (typeof pages)[number];

export type RouteParams = {
	slug?: string;
};

const slugToken = "[slug]";

const routes: Record<Page, Record<Locale, string>> = {
	home: {
		cs: "/",
		en: "/en/",
	},
	project: {
		cs: `/projekty/${slugToken}/`,
		en: `/en/projects/${slugToken}/`,
	},
	privacy: {
		cs: "/ochrana-osobnich-udaju/",
		en: "/en/privacy/",
	},
};

export function getPath(
	page: Page,
	locale: Locale,
	params?: RouteParams,
): string {
	const route = routes[page][locale];

	if (!route.includes(slugToken)) {
		return route;
	}

	if (!params?.slug) {
		throw new Error(`Missing slug for page ${page} in locale ${locale}`);
	}

	return route.replace(slugToken, params.slug);
}

export function getAlternates(
	page: Page,
	params?: RouteParams,
): Record<Locale, string> {
	return {
		cs: getPath(page, "cs", params),
		en: getPath(page, "en", params),
	};
}
