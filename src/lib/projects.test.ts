import { describe, expect, it } from "vitest";
import {
	findMissingTranslations,
	getProjectsForLocale,
	parseProjectId,
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
