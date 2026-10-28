import { defaultLocale } from "../i18n";
import { getAlternates, matchPath } from "../i18n/routes";

export type SitemapLink = {
	lang: string;
	url: string;
};

// @astrojs/sitemap pairs languages only by the locale prefix (/x/ ↔ /en/x/), which misses
// translated paths like /ochrana-osobnich-udaju/ ↔ /en/privacy/. The route map knows both,
// so the links match the hreflang tags in Seo.astro.
export function getSitemapLinks(url: string): SitemapLink[] {
	const { origin, pathname } = new URL(url);
	const match = matchPath(pathname);
	if (!match) {
		return [];
	}

	const alternates = getAlternates(match.page, match.params);
	const toAbsolute = (path: string) => new URL(path, origin).href;

	return [
		...Object.entries(alternates).map(([lang, path]) => ({
			lang,
			url: toAbsolute(path),
		})),
		{ lang: "x-default", url: toAbsolute(alternates[defaultLocale]) },
	];
}
