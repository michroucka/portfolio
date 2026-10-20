import { describe, expect, it } from "vitest";
import { formatPrice } from "./price";

describe("formatPrice", () => {
	describe("formats the price in Czech", () => {
		it.each([
			{ amount: 15000, locale: "cs", expected: "15\u00a0000\u00a0Kč" },
			{ amount: 100, locale: "cs", expected: "100\u00a0Kč" },
			{ amount: 1, locale: "cs", expected: "1\u00a0Kč" },
		] as const)(
			"$amount (locale: $locale) -> $expected",
			({ amount, locale, expected }) => {
				expect(formatPrice(amount, locale)).toBe(expected);
			},
		);
	});

	describe("formats the price in English with the currency code", () => {
		it.each([
			{ amount: 15000, locale: "en", expected: "CZK\u00a015,000" },
			{ amount: 100, locale: "en", expected: "CZK\u00a0100" },
			{ amount: 1, locale: "en", expected: "CZK\u00a01" },
		] as const)(
			"$amount (locale: $locale) -> $expected",
			({ amount, locale, expected }) => {
				expect(formatPrice(amount, locale)).toBe(expected);
			},
		);
	});

	describe("shows no decimal places", () => {
		it.each([
			{ amount: 9900, locale: "cs", expected: "9\u00a0900\u00a0Kč" },
			{ amount: 9900.4, locale: "cs", expected: "9\u00a0900\u00a0Kč" },
			{ amount: 9900, locale: "en", expected: "CZK\u00a09,900" },
			{ amount: 9900.4, locale: "en", expected: "CZK\u00a09,900" },
		] as const)(
			"$amount (locale: $locale) -> $expected",
			({ amount, locale, expected }) => {
				expect(formatPrice(amount, locale)).toBe(expected);
			},
		);
	});
});
