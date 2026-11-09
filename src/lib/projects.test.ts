import { describe, expect, expectTypeOf, it } from "vitest";
import {
	assertProjectTranslations,
	findMismatchedFields,
	findMissingTranslations,
	getProjectStaticPaths,
	getProjectsForLocale,
	localizedProjectFields,
	parseProjectId,
	type ProjectData,
	type SharedFieldsEntry,
	type SharedProjectField,
	sharedProjectFields,
} from "./projects";

describe("parseProjectId", () => {
	it('"cs/nohy-v-cajku" → locale cs, slug nohy-v-cajku', () => {
		expect(parseProjectId("cs/nohy-v-cajku")).toEqual({
			locale: "cs",
			slug: "nohy-v-cajku",
		});
	});

	describe("malformed id → throws", () => {
		it.each([
			{ id: "xy/nohy-v-cajku", error: /unknown locale/i },
			{ id: "/nohy-v-cajku", error: /missing locale/i },
			{ id: "cs", error: /missing slug/i },
			{ id: "cs/", error: /missing slug/i },
			{ id: "cs/blog/nohy-v-cajku", error: /too many segments/i },
		])('"$id" → throws $error', ({ id, error }) => {
			expect(() => parseProjectId(id)).toThrow(error);
		});
	});
});

describe("findMissingTranslations", () => {
	it("cs/x + en/x → nothing missing", () => {
		expect(findMissingTranslations(["cs/x", "en/x"])).toEqual({
			cs: [],
			en: [],
		});
	});

	describe("only one locale → reports the slug as missing in the other", () => {
		it.each([
			{ id: "cs/x", expected: { cs: [], en: ["x"] } },
			{ id: "en/x", expected: { cs: ["x"], en: [] } },
		])("only $id → x missing in the other locale", ({ id, expected }) => {
			expect(findMissingTranslations([id])).toEqual(expected);
		});
	});

	it("reports several missing slugs", () => {
		expect(findMissingTranslations(["cs/a", "cs/b"])).toEqual({
			cs: [],
			en: ["a", "b"],
		});
	});

	it("reports missing slugs in both locales", () => {
		expect(findMissingTranslations(["cs/b", "en/a"])).toEqual({
			cs: ["a"],
			en: ["b"],
		});
	});

	it("empty input → nothing missing", () => {
		expect(findMissingTranslations([])).toEqual({
			cs: [],
			en: [],
		});
	});
});

type SharedData = SharedFieldsEntry["data"];

const baseData: SharedData = {
	cover: { src: "/cover.png" },
	type: "web",
	year: 2026,
	scope: ["website", "booking"],
	tags: ["Astro", "TypeScript"],
	liveUrl: "https://example.com",
	repoUrl: "https://github.com/example/repo",
	status: "live",
	featured: true,
	order: 1,
};

// Fresh cover, scope and tags per entry, so equal values never share a reference.
function buildEntry(
	id: string,
	overrides: Partial<SharedData> = {},
): SharedFieldsEntry {
	return {
		id,
		data: {
			...baseData,
			cover: { ...baseData.cover },
			scope: [...baseData.scope],
			tags: [...baseData.tags],
			...overrides,
		},
	};
}

function getErrorMessage(action: () => void): string {
	try {
		action();
	} catch (error) {
		if (error instanceof Error) {
			return error.message;
		}
	}
	throw new Error("Expected the action to throw an Error");
}

describe("findMismatchedFields", () => {
	const differentValues: { [F in SharedProjectField]: SharedData[F] } = {
		cover: { src: "/other.png" },
		type: "app",
		year: 2025,
		scope: ["website"],
		tags: ["Astro"],
		liveUrl: "https://example.org",
		repoUrl: "https://github.com/example/other",
		status: "in-development",
		featured: false,
		order: 2,
	};

	it("identical pair → no mismatch", () => {
		expect(
			findMismatchedFields([buildEntry("cs/x"), buildEntry("en/x")]),
		).toEqual([]);
	});

	it.each(sharedProjectFields)(
		"only %s differs → reports just that field",
		(field) => {
			const overrides: Partial<SharedData> = {
				[field]: differentValues[field],
			};

			expect(
				findMismatchedFields([
					buildEntry("cs/x"),
					buildEntry("en/x", overrides),
				]),
			).toEqual([{ slug: "x", fields: [field] }]);
		},
	);

	it("several fields differ → reports all of them in sharedProjectFields order", () => {
		expect(
			findMismatchedFields([
				buildEntry("cs/x"),
				buildEntry("en/x", { order: 2, tags: ["Astro"] }),
			]),
		).toEqual([{ slug: "x", fields: ["tags", "order"] }]);
	});

	it("reports only the slug whose pair differs", () => {
		expect(
			findMismatchedFields([
				buildEntry("cs/a"),
				buildEntry("en/a"),
				buildEntry("cs/b"),
				buildEntry("en/b", { type: "app" }),
			]),
		).toEqual([{ slug: "b", fields: ["type"] }]);
	});

	it("same cover src in different objects → no mismatch", () => {
		expect(
			findMismatchedFields([
				buildEntry("cs/x", { cover: { src: "/same.png" } }),
				buildEntry("en/x", { cover: { src: "/same.png" } }),
			]),
		).toEqual([]);
	});

	it("tags in a different order → mismatch", () => {
		expect(
			findMismatchedFields([
				buildEntry("cs/x", { tags: ["Astro", "TypeScript"] }),
				buildEntry("en/x", { tags: ["TypeScript", "Astro"] }),
			]),
		).toEqual([{ slug: "x", fields: ["tags"] }]);
	});

	it("liveUrl only in one locale → mismatch", () => {
		const withoutLiveUrl = buildEntry("en/x");
		delete withoutLiveUrl.data.liveUrl;

		expect(
			findMismatchedFields([buildEntry("cs/x"), withoutLiveUrl]),
		).toEqual([{ slug: "x", fields: ["liveUrl"] }]);
	});

	it("slug missing in the other locale → not reported here", () => {
		expect(findMismatchedFields([buildEntry("cs/x")])).toEqual([]);
	});
});

describe("assertProjectTranslations", () => {
	it("complete, matching pairs → does not throw", () => {
		expect(() =>
			assertProjectTranslations([
				buildEntry("cs/alpha"),
				buildEntry("en/alpha"),
			]),
		).not.toThrow();
	});

	it("missing translations → throws listing every missing slug", () => {
		const message = getErrorMessage(() =>
			assertProjectTranslations([
				buildEntry("cs/alpha"),
				buildEntry("cs/beta"),
				buildEntry("en/gamma"),
			]),
		);

		expect(message).toContain("alpha");
		expect(message).toContain("beta");
		expect(message).toContain("gamma");
	});

	it("mismatched fields → throws listing slug and fields", () => {
		const message = getErrorMessage(() =>
			assertProjectTranslations([
				buildEntry("cs/alpha"),
				buildEntry("en/alpha", { order: 2, featured: false }),
			]),
		);

		expect(message).toContain("alpha");
		expect(message).toContain("order");
		expect(message).toContain("featured");
	});

	it("missing and mismatched at once → lists both", () => {
		const message = getErrorMessage(() =>
			assertProjectTranslations([
				buildEntry("cs/alpha"),
				buildEntry("en/alpha", { type: "app" }),
				buildEntry("cs/beta"),
			]),
		);

		expect(message).toContain("alpha");
		expect(message).toContain("type");
		expect(message).toContain("beta");
	});
});

describe("getProjectsForLocale", () => {
	it("returns only entries of the given locale", () => {
		expect(
			getProjectsForLocale(
				[
					{ id: "en/a", data: { order: 1, featured: false } },
					{ id: "cs/a", data: { order: 1, featured: true } },
					{ id: "cs/b", data: { order: 2, featured: false } },
				],
				"cs",
			),
		).toEqual([
			{ id: "cs/a", data: { order: 1, featured: true } },
			{ id: "cs/b", data: { order: 2, featured: false } },
		]);
	});

	it("sorts by order ascending", () => {
		expect(
			getProjectsForLocale(
				[
					{ id: "cs/a", data: { order: 2, featured: true } },
					{ id: "cs/b", data: { order: 1, featured: false } },
				],
				"cs",
			),
		).toEqual([
			{ id: "cs/b", data: { order: 1, featured: false } },
			{ id: "cs/a", data: { order: 2, featured: true } },
		]);
	});

	it("sorts two records with the same order by slug regardless of input position", () => {
		expect(
			getProjectsForLocale(
				[
					{ id: "cs/b", data: { order: 1, featured: true } },
					{ id: "cs/a", data: { order: 1, featured: false } },
				],
				"cs",
			),
		).toEqual([
			{ id: "cs/a", data: { order: 1, featured: false } },
			{ id: "cs/b", data: { order: 1, featured: true } },
		]);
	});

	it("does not mutate the input array", () => {
		const entries = [
			{ id: "cs/a", data: { order: 2, featured: false } },
			{ id: "cs/b", data: { order: 1, featured: false } },
		];
		const snapshot = structuredClone(entries);

		getProjectsForLocale(entries, "cs");

		expect(entries).toEqual(snapshot);
	});

	it("featuredOnly returns only featured entries", () => {
		expect(
			getProjectsForLocale(
				[
					{ id: "en/a", data: { order: 1, featured: true } },
					{ id: "cs/a", data: { order: 2, featured: true } },
					{ id: "cs/b", data: { order: 1, featured: false } },
				],
				"cs",
				{ featuredOnly: true },
			),
		).toEqual([{ id: "cs/a", data: { order: 2, featured: true } }]);
	});
});

describe("project fields", () => {
	// Checked by astro check: a new schema field fails the typecheck until it is listed
	// as shared (compared between locales) or localized.
	it("every schema field is either shared or localized", () => {
		expectTypeOf<
			Exclude<
				keyof ProjectData,
				SharedProjectField | (typeof localizedProjectFields)[number]
			>
		>().toEqualTypeOf<never>();
	});
});

describe("getProjectStaticPaths", () => {
	it("returns the locale's projects with their slug as the route param", () => {
		const paths = getProjectStaticPaths(
			[
				buildEntry("cs/b", { order: 2 }),
				buildEntry("en/b", { order: 2 }),
				buildEntry("cs/a"),
				buildEntry("en/a"),
			],
			"en",
		);

		expect(
			paths.map(({ params, props }) => [params.slug, props.project.id]),
		).toEqual([
			["a", "en/a"],
			["b", "en/b"],
		]);
	});

	it("missing translation → throws before generating any path", () => {
		expect(() => getProjectStaticPaths([buildEntry("cs/a")], "cs")).toThrow(
			"missing in src/content/projects/en/: a",
		);
	});
});
