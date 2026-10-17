import { describe, expect, it } from "vitest";
import { locales } from "./index";
import { getAlternates, getPath, pages } from "./routes";

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
		// Prázdný slug musí taky selhat, jinak by vznikla cesta /projekty//.
		const missingSlug = [undefined, {}, { slug: "" }];
		// label: JSON.stringify odliší ve výpisu {} od { slug: "" } i od undefined.
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
				// Regex na zprávu ověří, že chyba vznikla kvůli slugu, ne kvůli něčemu jinému.
				expect(() => getPath("project", locale, params)).toThrow(
					/slug/,
				);
			},
		);
	});

	describe("každá cesta končí lomítkem (trailingSlash: always)", () => {
		// Kombinace se generují z `pages` × `locales`, takže nová stránka se otestuje sama.
		// Slug se předává vždy – stránky bez parametrů ho mají ignorovat.
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
