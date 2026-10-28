import { describe, expect, it } from "vitest";
import { getSitemapLinks } from "./sitemap";

const site = "https://example.com";

describe("getSitemapLinks", () => {
	it("přeložená cesta dostane obě jazykové verze a x-default", () => {
		expect(getSitemapLinks(`${site}/en/privacy/`)).toEqual([
			{ lang: "cs", url: `${site}/ochrana-osobnich-udaju/` },
			{ lang: "en", url: `${site}/en/privacy/` },
			{ lang: "x-default", url: `${site}/ochrana-osobnich-udaju/` },
		]);
	});

	it("case study zachová slug v obou jazycích", () => {
		expect(getSitemapLinks(`${site}/projekty/nohy-v-cajku/`)).toEqual([
			{ lang: "cs", url: `${site}/projekty/nohy-v-cajku/` },
			{ lang: "en", url: `${site}/en/projects/nohy-v-cajku/` },
			{ lang: "x-default", url: `${site}/projekty/nohy-v-cajku/` },
		]);
	});

	it("stránka mimo mapu cest nemá alternativy", () => {
		expect(getSitemapLinks(`${site}/neznama/`)).toEqual([]);
	});
});
