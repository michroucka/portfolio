import { z } from "astro/zod";

export const contactServices = [
	"presentation-website",
	"website-with-system",
	"custom-application",
	"other",
] as const;

export type ContactService = (typeof contactServices)[number];

export const MESSAGE_MAX_LENGTH = 5000;

const PHONE_ALLOWED_CHARACTERS = /^\+?[0-9 ]+$/;
// 9 digits is a Czech number without the prefix, 15 is the E.164 maximum.
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 15;

function hasValidDigitCount(phone: string): boolean {
	const digitCount = phone.replace(/\D/g, "").length;
	return digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS;
}

const phoneSchema = z
	.string()
	.trim()
	.regex(PHONE_ALLOWED_CHARACTERS)
	.refine(hasValidDigitCount);

export const contactSchema = z.object({
	name: z.string().trim().min(1).max(100),
	email: z.string().trim().pipe(z.email()),
	phone: z.literal("").or(phoneSchema).optional(),
	service: z.enum(contactServices),
	message: z.string().trim().min(1).max(MESSAGE_MAX_LENGTH),
});

export type ContactInput = z.infer<typeof contactSchema>;
