import { isLocale, type Locale, locales } from "../i18n";

// The minimal shape the helpers need – real collection entries satisfy it,
// and tests can build plain objects without Astro.
export type ProjectEntry = {
	id: string;
	data: {
		order: number;
		featured: boolean;
	};
};

export type ProjectId = {
	locale: Locale;
	slug: string;
};

export function parseProjectId(id: string): ProjectId {
	const tokens = id.split("/");
	const [locale, slug] = tokens;
	if (!locale) {
		throw new Error(`Missing locale in project id: ${id}`);
	}
	if (!slug) {
		throw new Error(`Missing slug in project id: ${id}`);
	}
	if (tokens.length > 2) {
		throw new Error(`Too many segments in project id: ${id}`);
	}
	if (!isLocale(locale)) {
		throw new Error(`Unknown locale in project id: ${id}`);
	}
	return { locale, slug };
}

export function getProjectsForLocale<T extends ProjectEntry>(
	entries: T[],
	locale: Locale,
	options?: { featuredOnly?: boolean },
): T[] {
	const entriesOfLocale = entries.filter(
		(entry) => parseProjectId(entry.id).locale === locale,
	);
	const selectedEntries = options?.featuredOnly
		? entriesOfLocale.filter((entry) => entry.data.featured)
		: entriesOfLocale;
	return selectedEntries.toSorted((a, b) => a.data.order - b.data.order);
}

export function findMissingTranslations(
	ids: string[],
): Record<Locale, string[]> {
	const projectIds = ids.map((id) => parseProjectId(id));
	const allSlugs = new Set(projectIds.map(({ slug }) => slug));

	const missingPerLocale = locales.map((locale) => {
		const slugsInLocale = new Set(
			projectIds
				.filter((projectId) => projectId.locale === locale)
				.map(({ slug }) => slug),
		);
		const missingSlugs = [...allSlugs].filter(
			(slug) => !slugsInLocale.has(slug),
		);
		return [locale, missingSlugs];
	});

	// Object.fromEntries loses the key type; the keys come straight from `locales`.
	return Object.fromEntries(missingPerLocale) as Record<Locale, string[]>;
}
