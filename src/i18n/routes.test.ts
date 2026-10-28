import { describe, expect, it } from "vitest";
import { locales } from "./index";
import { getAlternates, getPath, matchPath, pages } from "./routes";

const slug = "nohy-v-cajku";

describe("getPath", () => {
	it.each([
		{ page: "home", locale: "cs", params: undefined, expected: "/" },
		{ page: "home", locale: "en", params: undefined, expected: "/en/" },
		{
			page: "project",
			locale: "cs",
			params: { slug },
			expected: "/projekty/nohy-v-cajku/",
		},
		{
			page: "project",
			locale: "en",
			params: { slug },
			expected: "/en/projects/nohy-v-cajku/",
		},
		{
			page: "privacy",
			locale: "cs",
			params: undefined,
			expected: "/ochrana-osobnich-udaju/",
		},
		{
			page: "privacy",
			locale: "en",
			params: undefined,
			expected: "/en/privacy/",
		},
	] as const)(
		"$page ($locale) -> $expected",
		({ page, locale, params, expected }) => {
			expect(getPath(page, locale, params)).toBe(expected);
		},
	);

	describe("project bez platného slugu vyhodí chybu", () => {
		// An empty slug must fail too, otherwise the path would be /projekty//.
		const missingSlug = [undefined, {}, { slug: "" }];
		// label: JSON.stringify tells {} apart from { slug: "" } and undefined in the output.
		const cases = missingSlug.flatMap((params) =>
			locales.map((locale) => ({
				locale,
				params,
				label: JSON.stringify(params) ?? "undefined",
			})),
		);

		it.each(cases)(
			"$locale, params $label -> chyba",
			({ locale, params }) => {
				// Matching the message ensures the error is about the slug, not something else.
				expect(() => getPath("project", locale, params)).toThrow(
					/slug/,
				);
			},
		);
	});

	describe("každá cesta končí lomítkem (trailingSlash: always)", () => {
		// Combinations come from `pages` × `locales`, so a new page is tested automatically.
		// The slug is always passed – pages without parameters must ignore it.
		const cases = pages.flatMap((page) =>
			locales.map((locale) => ({ page, locale })),
		);

		it.each(cases)("$page ($locale)", ({ page, locale }) => {
			expect(getPath(page, locale, { slug })).toMatch(/\/$/);
		});
	});
});

describe("getAlternates", () => {
	it("project vrátí cestu pro každý jazyk se stejným slugem", () => {
		expect(getAlternates("project", { slug })).toEqual({
			cs: "/projekty/nohy-v-cajku/",
			en: "/en/projects/nohy-v-cajku/",
		});
	});

	it("stránka bez parametrů vrátí cestu pro každý jazyk", () => {
		expect(getAlternates("home")).toEqual({ cs: "/", en: "/en/" });
	});
});

describe("matchPath", () => {
	describe("vrátí stránku, ze které getPath cestu složil", () => {
		const cases = pages.flatMap((page) =>
			locales.map((locale) => {
				const params = page === "project" ? { slug } : undefined;
				return {
					page,
					locale,
					params,
					path: getPath(page, locale, params),
				};
			}),
		);

		it.each(cases)("$path -> $page ($locale)", ({ path, ...expected }) => {
			expect(matchPath(path)).toEqual(expected);
		});
	});

	it.each([
		"/404/",
		"/en",
		"/projekty/",
		"/projekty/a/b/",
		"/en/projekty/nohy-v-cajku/",
		"/ochrana-osobnich-udajuX/",
	])("%s -> undefined", (path) => {
		expect(matchPath(path)).toBeUndefined();
	});
});
