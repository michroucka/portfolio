import { describe, expect, it } from "vitest";
import { contactSchema, MESSAGE_MAX_LENGTH } from "./schema";

const validInput = {
	name: "Jiří Šťastný",
	email: "jan.novak@example.cz",
	phone: "123456789",
	service: "presentation-website",
	message: "Dobrý den, mám zájem o web.",
};

function invalidFields(input: unknown): string[] {
	const parsed = contactSchema.safeParse(input);

	if (parsed.success) {
		return [];
	}
	const issues = parsed.error.issues.map((issue) => String(issue.path[0]));
	return Array.from(new Set(issues));
}

describe("contactSchema", () => {
	it("accepts a valid input", () => {
		expect(invalidFields(validInput)).toEqual([]);
	});

	it.each([{ phone: "" }, { phone: undefined }])(
		"accepts a missing phone ('$phone')",
		({ phone }) => {
			expect(invalidFields({ ...validInput, phone })).toEqual([]);
		},
	);

	it.each([
		{ phone: "777123456" },
		{ phone: "777 123 456" },
		{ phone: "+420 777 123 456" },
		{ phone: "+420777123456" },
	])("accepts a phone in a common format ($phone)", ({ phone }) => {
		expect(invalidFields({ ...validInput, phone })).toEqual([]);
	});

	it.each([
		{ phone: "abc" },
		{ phone: "777-abc-456" },
		{ phone: "12345" },
		{ phone: "+420 777 123 456 789 012" },
		{ phone: "777 + 123 456" },
	])("rejects an invalid phone ($phone) on the phone field", ({ phone }) => {
		expect(invalidFields({ ...validInput, phone })).toEqual(["phone"]);
	});

	it.each([
		{ field: "name", value: "" },
		{ field: "name", value: "   " },
		{ field: "email", value: "" },
		{ field: "service", value: "" },
		{ field: "message", value: "" },
		{ field: "message", value: "   " },
	])(
		"rejects a blank $field ('$value') on that field",
		({ field, value }) => {
			expect(invalidFields({ ...validInput, [field]: value })).toEqual([
				field,
			]);
		},
	);

	it("rejects an invalid email on the email field", () => {
		expect(invalidFields({ ...validInput, email: "invalid" })).toEqual([
			"email",
		]);
	});

	it("trims spaces around the email", () => {
		const result = contactSchema.safeParse({
			...validInput,
			email: "  Jana@Example.CZ ",
		});
		expect(result.success).toBe(true);
		expect(result.data?.email).toBe("Jana@Example.CZ");
	});

	it("rejects a service outside the allowed values", () => {
		expect(invalidFields({ ...validInput, service: "invalid" })).toEqual([
			"service",
		]);
	});

	it("rejects a message longer than the limit", () => {
		expect(
			invalidFields({
				...validInput,
				message: "a".repeat(MESSAGE_MAX_LENGTH + 1),
			}),
		).toEqual(["message"]);
	});

	it("accepts a message exactly as long as the limit", () => {
		expect(
			invalidFields({
				...validInput,
				message: "a".repeat(MESSAGE_MAX_LENGTH),
			}),
		).toEqual([]);
	});
});
