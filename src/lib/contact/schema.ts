import { z } from "astro/zod";

export const contactServices = [
	"presentation-website",
	"website-with-system",
	"custom-application",
	"other",
] as const;

export type ContactService = (typeof contactServices)[number];

const OTHER_SERVICE = "other";

// The <select> lists the services collection, the schema validates against contactServices.
// Returns the ids that are in one list but not the other, so the build can fail on a mismatch.
export function findServiceMismatch(
	collectionIds: readonly string[],
): string[] {
	const schemaIds = contactServices.filter((id) => id !== OTHER_SERVICE);
	const missingInSchema = collectionIds.filter(
		(id) => !(schemaIds as readonly string[]).includes(id),
	);
	const missingInCollection = schemaIds.filter(
		(id) => !collectionIds.includes(id),
	);
	return [...missingInSchema, ...missingInCollection];
}

export const MESSAGE_MAX_LENGTH = 5000;

const PHONE_ALLOWED_CHARACTERS = /^\+?[0-9 ]+$/;
// 9 digits is a Czech number without the prefix, 15 is the E.164 maximum.
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 15;

function hasValidDigitCount(phone: string): boolean {
	const digitCount = phone.replace(/\D/g, "").length;
	return digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS;
}

const phoneNumberSchema = z
	.string()
	.regex(PHONE_ALLOWED_CHARACTERS)
	.refine(hasValidDigitCount);

// Trimmed first, so a field left with only spaces counts as empty, not as an invalid number.
const phoneSchema = z.string().trim().pipe(z.literal("").or(phoneNumberSchema));

export const contactSchema = z.object({
	name: z.string().trim().min(1).max(100),
	email: z.string().trim().pipe(z.email()),
	phone: phoneSchema.optional(),
	service: z.enum(contactServices),
	message: z.string().trim().min(1).max(MESSAGE_MAX_LENGTH),
});

export type ContactInput = z.infer<typeof contactSchema>;
