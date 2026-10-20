import { describe, expect, it } from "vitest";
import { splitLastWord } from "./text";

describe("splitLastWord", () => {
	it("splits a sentence before the last word", () => {
		expect(splitLastWord("Weby a aplikace pro malé firmy")).toEqual({
			lead: "Weby a aplikace pro malé",
			lastWord: "firmy",
		});
	});

	it("returns the whole text as the last word when there is no space", () => {
		expect(splitLastWord("firmy")).toEqual({ lead: "", lastWord: "firmy" });
	});

	it("ignores leading and trailing whitespace", () => {
		expect(splitLastWord("  malé firmy  ")).toEqual({
			lead: "malé",
			lastWord: "firmy",
		});
	});

	// A non-breaking space binds a one-letter preposition to the next word (Czech typography),
	// so the split must not treat it as a word boundary.
	it("does not split on a non-breaking space", () => {
		expect(splitLastWord("pro malé a firmy")).toEqual({
			lead: "pro malé",
			lastWord: "a firmy",
		});
	});
});
