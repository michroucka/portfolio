import { describe, expect, it } from "vitest";
import { buildProfessionalService, serializeJsonLd } from "./structured-data";

const site = new URL("https://example.com");

describe("buildProfessionalService", () => {
	it.each([
		{ locale: "cs", url: "https://example.com/", region: "Plzeňský kraj" },
		{
			locale: "en",
			url: "https://example.com/en/",
			region: "Pilsen Region",
		},
	] as const)(
		"$locale: URL a oblast v jazyce stránky",
		({ locale, url, region }) => {
			const data = buildProfessionalService(locale, site);

			expect(data.url).toBe(url);
			expect(data.areaServed).toContainEqual({
				"@type": "AdministrativeArea",
				name: region,
			});
		},
	);

	it("obrázek je absolutní URL", () => {
		expect(buildProfessionalService("cs", site).image).toBe(
			"https://example.com/og-default.png",
		);
	});
});

describe("serializeJsonLd", () => {
	it("nedovolí ukončit <script> uvnitř hodnoty", () => {
		const json = serializeJsonLd({ name: "</script><script>alert(1)" });

		expect(json).not.toContain("<");
		expect(JSON.parse(json)).toEqual({
			name: "</script><script>alert(1)",
		});
	});
});
