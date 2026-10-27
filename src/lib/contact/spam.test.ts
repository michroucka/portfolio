import { describe, expect, it } from "vitest";
import { isSpam, MIN_FILL_TIME_MS } from "./spam";

const humanSignals = { honeypot: "", elapsedMs: "10000" };

describe("isSpam", () => {
	it("is not spam with an empty honeypot after 10 s", () => {
		expect(isSpam(humanSignals)).toBe(false);
	});

	it("is not spam when the honeypot is missing", () => {
		expect(isSpam({ ...humanSignals, honeypot: undefined })).toBe(false);
	});

	it.each([{ honeypot: "https://spam.example" }, { honeypot: " " }])(
		"is spam when the honeypot is filled in ('$honeypot')",
		({ honeypot }) => {
			expect(isSpam({ ...humanSignals, honeypot })).toBe(true);
		},
	);

	it("is spam when submitted sooner than the minimum fill time", () => {
		const elapsedMs = String(MIN_FILL_TIME_MS - 1);
		expect(isSpam({ ...humanSignals, elapsedMs })).toBe(true);
	});

	it("is not spam when submitted exactly at the minimum fill time", () => {
		const elapsedMs = String(MIN_FILL_TIME_MS);
		expect(isSpam({ ...humanSignals, elapsedMs })).toBe(false);
	});

	it.each([
		{ elapsedMs: undefined },
		{ elapsedMs: "" },
		{ elapsedMs: "abc" },
		{ elapsedMs: "12abc" },
		{ elapsedMs: "Infinity" },
		{ elapsedMs: "-10000" },
	])(
		"is spam when the elapsed time is missing or invalid ('$elapsedMs')",
		({ elapsedMs }) => {
			expect(isSpam({ ...humanSignals, elapsedMs })).toBe(true);
		},
	);
});
