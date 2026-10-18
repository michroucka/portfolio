import { describe, expect, it } from "vitest";
import { isTheme, resolveTheme, toggleTheme } from "./theme";

const systems = ["light", "dark"] as const;

describe("resolveTheme", () => {
	describe("platná uložená volba přebije systém", () => {
		it.each([
			{ stored: "dark", system: "light" },
			{ stored: "light", system: "dark" },
		] as const)(
			"uloženo $stored, systém $system -> $stored",
			({ stored, system }) => {
				expect(resolveTheme({ stored, system })).toBe(stored);
			},
		);
	});

	describe("bez platné uložené volby rozhoduje systém", () => {
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
			"uloženo $label, systém $system -> $system",
			({ stored, system }) => {
				expect(resolveTheme({ stored, system })).toBe(system);
			},
		);
	});
});

describe("isTheme", () => {
	describe("vrátí true pokud je hodnota light nebo dark", () => {
		it.each(["light", "dark"] as const)("hodnota %j -> true", (value) => {
			expect(isTheme(value)).toBe(true);
		});
	});

	describe("vrátí false pokud hodnota není light nebo dark", () => {
		it.each([null, "", "invalid", "Dark", "Light"] as const)(
			"hodnota %j -> false",
			(value) => {
				expect(isTheme(value)).toBe(false);
			},
		);
	});
});

describe("toggleTheme", () => {
	describe("vrátí opačné téma k `current`", () => {
		it.each(["light", "dark"] as const)(
			"current téma %j -> opačné téma",
			(current) => {
				expect(toggleTheme(current)).toBe(
					current === "light" ? "dark" : "light",
				);
			},
		);
	});
});
