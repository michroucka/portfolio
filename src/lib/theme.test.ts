import { describe, expect, it } from "vitest";
import { isTheme, resolveTheme, toggleTheme } from "./theme";

const systems = ["light", "dark"] as const;

describe("resolveTheme", () => {
	describe("a valid stored choice overrides the system", () => {
		it.each([
			{ stored: "dark", system: "light" },
			{ stored: "light", system: "dark" },
		] as const)(
			"stored $stored, system $system -> $stored",
			({ stored, system }) => {
				expect(resolveTheme({ stored, system })).toBe(stored);
			},
		);
	});

	describe("without a valid stored choice the system decides", () => {
		// Each invalid value is tried with both systems, so an implementation that returns
		// a hard-coded theme for invalid values cannot pass.
		const invalidStored = [null, "", "invalid", "Dark"];
		// label: JSON.stringify tells "" apart from null in the output ("" would vanish otherwise).
		const cases = invalidStored.flatMap((stored) =>
			systems.map((system) => ({
				stored,
				system,
				label: JSON.stringify(stored),
			})),
		);

		it.each(cases)(
			"stored $label, system $system -> $system",
			({ stored, system }) => {
				expect(resolveTheme({ stored, system })).toBe(system);
			},
		);
	});
});

describe("isTheme", () => {
	describe("returns true for light or dark", () => {
		it.each(["light", "dark"] as const)("value %j -> true", (value) => {
			expect(isTheme(value)).toBe(true);
		});
	});

	describe("returns false for anything else", () => {
		it.each([null, "", "invalid", "Dark", "Light"] as const)(
			"value %j -> false",
			(value) => {
				expect(isTheme(value)).toBe(false);
			},
		);
	});
});

describe("toggleTheme", () => {
	describe("returns the opposite of `current`", () => {
		it.each(["light", "dark"] as const)(
			"current %j -> the other theme",
			(current) => {
				expect(toggleTheme(current)).toBe(
					current === "light" ? "dark" : "light",
				);
			},
		);
	});
});
