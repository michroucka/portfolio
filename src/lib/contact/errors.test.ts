import { describe, expect, it } from "vitest";
import type { z } from "astro/zod";
import { fieldErrorKeys, formErrorKey } from "./errors";
import { contactSchema, MESSAGE_MAX_LENGTH } from "./schema";

const validInput = {
	name: "Jiří Šťastný",
	email: "jiri@example.cz",
	phone: "",
	service: "presentation-website",
	message: "Dobrý den, mám zájem o web.",
};

function issuesFor(input: unknown): z.core.$ZodIssue[] {
	return contactSchema.safeParse(input).error?.issues ?? [];
}

// Only the fields the mapping reads; real issues carry more.
function issue(path: string, code: string): z.core.$ZodIssue {
	return { path: [path], code, message: "" } as unknown as z.core.$ZodIssue;
}

describe("fieldErrorKeys", () => {
	it("returns no keys for a valid input", () => {
		expect(fieldErrorKeys(issuesFor(validInput))).toEqual({});
	});

	it.each([
		{ field: "name", value: "" },
		{ field: "name", value: "   " },
		{ field: "message", value: "" },
		{ field: "message", value: "   " },
	])("maps a blank $field ('$value') to required", ({ field, value }) => {
		const issues = issuesFor({ ...validInput, [field]: value });
		expect(fieldErrorKeys(issues)).toEqual({ [field]: "required" });
	});

	it.each([
		{ field: "name", value: "a".repeat(101) },
		{ field: "message", value: "a".repeat(MESSAGE_MAX_LENGTH + 1) },
	])("maps a $field over the limit to tooLong", ({ field, value }) => {
		const issues = issuesFor({ ...validInput, [field]: value });
		expect(fieldErrorKeys(issues)).toEqual({ [field]: "tooLong" });
	});

	it.each([{ email: "" }, { email: "jiri.example.cz" }])(
		"maps an empty or malformed email ('$email') to invalidEmail",
		({ email }) => {
			const issues = issuesFor({ ...validInput, email });
			expect(fieldErrorKeys(issues)).toEqual({ email: "invalidEmail" });
		},
	);

	it.each([{ phone: "abc" }, { phone: "12345" }])(
		"maps an invalid phone ('$phone') to invalidPhone",
		({ phone }) => {
			const issues = issuesFor({ ...validInput, phone });
			expect(fieldErrorKeys(issues)).toEqual({ phone: "invalidPhone" });
		},
	);

	it.each([{ service: "" }, { service: "unknown" }])(
		"maps an unselected or unknown service ('$service') to invalidService",
		({ service }) => {
			const issues = issuesFor({ ...validInput, service });
			expect(fieldErrorKeys(issues)).toEqual({
				service: "invalidService",
			});
		},
	);

	it("maps every invalid field at once", () => {
		const issues = issuesFor({ ...validInput, name: "", email: "x" });
		expect(fieldErrorKeys(issues)).toEqual({
			name: "required",
			email: "invalidEmail",
		});
	});

	it("keeps only the first error of a field", () => {
		const issues = [
			issue("message", "too_small"),
			issue("message", "too_big"),
		];
		expect(fieldErrorKeys(issues)).toEqual({ message: "required" });
	});

	it.each([
		{ path: "note" },
		{ path: "elapsedMs" },
		{ path: "cf-turnstile-response" },
	])("ignores the hidden field $path", ({ path }) => {
		expect(fieldErrorKeys([issue(path, "invalid_type")])).toEqual({});
	});
});

describe("formErrorKey", () => {
	it("maps FORBIDDEN to verificationFailed", () => {
		expect(formErrorKey("FORBIDDEN")).toBe("verificationFailed");
	});

	it.each([
		{ code: "SERVICE_UNAVAILABLE" },
		{ code: "INTERNAL_SERVER_ERROR" },
		{ code: "TOO_MANY_REQUESTS" },
	] as const)("maps $code to unavailable", ({ code }) => {
		expect(formErrorKey(code)).toBe("unavailable");
	});
});
