import type { CollectionEntry } from "astro:content";
import { isLocale, type Locale, locales } from "../i18n";

export type ProjectData = CollectionEntry<"projects">["data"];

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

function slugOf(entry: ProjectEntry): string {
	return parseProjectId(entry.id).slug;
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

	return selectedEntries.toSorted(
		(a, b) =>
			a.data.order - b.data.order ||
			slugOf(a).localeCompare(slugOf(b), "en"),
	);
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

export const sharedProjectFields = [
	"cover",
	"type",
	"year",
	"scope",
	"tags",
	"liveUrl",
	"repoUrl",
	"status",
	"featured",
	"order",
] as const;

export type SharedProjectField = (typeof sharedProjectFields)[number];

export const localizedProjectFields = [
	"title",
	"summary",
	"testimonial",
] as const;

// Typed from the schema, so a changed field type breaks the check at compile time.
// Only the cover's src is compared, and tests can build it without ImageMetadata.
export type SharedFieldsEntry = {
	id: string;
	data: Omit<Pick<ProjectData, SharedProjectField>, "cover"> & {
		cover: { src: string };
	};
};

export type FieldMismatch = {
	slug: string;
	fields: SharedProjectField[];
};

// Objects and arrays are never `===` to a copy, so they become strings first.
// JSON keeps the order of tags and scope, which is shown on the page, and survives values containing commas.
function toComparableValue(
	field: SharedProjectField,
	data: SharedFieldsEntry["data"],
): unknown {
	if (field === "cover") {
		return data.cover.src;
	}
	if (field === "tags" || field === "scope") {
		return JSON.stringify(data[field]);
	}
	return data[field];
}

export function findMismatchedFields(
	entries: SharedFieldsEntry[],
): FieldMismatch[] {
	const bySlug = Map.groupBy(entries, (entry) => slugOf(entry));
	const mismatches: FieldMismatch[] = [];

	for (const [slug, [reference, ...others]] of bySlug) {
		// A slug present in one locale only is reported by findMissingTranslations.
		if (!reference || others.length === 0) {
			continue;
		}
		const fields = sharedProjectFields.filter((field) =>
			others.some(
				(entry) =>
					toComparableValue(field, entry.data) !==
					toComparableValue(field, reference.data),
			),
		);
		if (fields.length > 0) {
			mismatches.push({ slug, fields });
		}
	}

	return mismatches;
}

export function assertProjectTranslations(entries: SharedFieldsEntry[]): void {
	const entryIds = entries.map((entry) => entry.id);
	const missingTranslations = findMissingTranslations(entryIds);
	const mismatchedFields = findMismatchedFields(entries);

	const problems: string[] = [];
	for (const [locale, slugs] of Object.entries(missingTranslations)) {
		if (slugs.length > 0) {
			problems.push(
				`missing in src/content/projects/${locale}/: ${slugs.join(", ")}`,
			);
		}
	}
	for (const { slug, fields } of mismatchedFields) {
		problems.push(
			`${slug}: fields differ between locales: ${fields.join(", ")}`,
		);
	}

	if (problems.length > 0) {
		throw new Error(
			`Project translations are not complete:\n${problems.join("\n")}`,
		);
	}
}

export function getProjectStaticPaths<T extends SharedFieldsEntry>(
	entries: T[],
	locale: Locale,
) {
	assertProjectTranslations(entries);
	return getProjectsForLocale(entries, locale).map((project) => ({
		params: { slug: slugOf(project) },
		props: { project },
	}));
}
