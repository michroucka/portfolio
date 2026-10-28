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

export type RouteMatch = {
	page: Page;
	locale: Locale;
	params?: RouteParams;
};

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function routeToRegExp(route: string): RegExp {
	const [before, after] = route.split(slugToken).map(escapeRegExp);
	return after === undefined
		? new RegExp(`^${before}$`)
		: new RegExp(`^${before}([^/]+)${after}$`);
}

// The reverse of getPath, for places that only know the URL (the sitemap serializer).
export function matchPath(pathname: string): RouteMatch | undefined {
	for (const page of pages) {
		for (const [locale, route] of Object.entries(routes[page])) {
			const match = routeToRegExp(route).exec(pathname);
			if (match) {
				const slug = match[1];
				return {
					page,
					locale: locale as Locale,
					...(slug && { params: { slug } }),
				};
			}
		}
	}
	return undefined;
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
