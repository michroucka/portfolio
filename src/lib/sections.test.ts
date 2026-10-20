import { describe, expect, it } from "vitest";
import { getSectionHref } from "./sections";

describe("getSectionHref", () => {
	it.each([
		{ section: "contact", locale: "cs", expected: "/#contact" },
		{ section: "projects", locale: "en", expected: "/en/#projects" },
	] as const)(
		"$section ($locale) -> $expected",
		({ section, locale, expected }) => {
			expect(getSectionHref(section, locale)).toBe(expected);
		},
	);
});
