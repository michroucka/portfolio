import type { ActionErrorCode } from "astro:actions";
import type { z } from "astro/zod";
import type { Dictionary } from "../../i18n/cs";
import type { ContactInput } from "./schema";

export type ContactErrorKey = keyof Dictionary["contact"]["form"]["errors"];

export type ContactField = keyof ContactInput;

export type FieldErrorKeys = Partial<Record<ContactField, ContactErrorKey>>;

function lengthErrorKey(code: string): ContactErrorKey {
	return code === "too_big" ? "tooLong" : "required";
}

// Zod reports an empty email or service with the same code as an invalid one,
// so those fields get a single message that covers both.
const errorKeyByField: Record<ContactField, (code: string) => ContactErrorKey> =
	{
		name: lengthErrorKey,
		email: () => "invalidEmail",
		phone: () => "invalidPhone",
		service: () => "invalidService",
		message: lengthErrorKey,
	};

function isContactField(field: PropertyKey | undefined): field is ContactField {
	return typeof field === "string" && Object.hasOwn(errorKeyByField, field);
}

// One message per field: the first issue of a field wins. Hidden fields
// (honeypot, elapsed time, Turnstile token) are not shown, so they are skipped.
export function fieldErrorKeys(
	issues: readonly z.core.$ZodIssue[],
): FieldErrorKeys {
	const keys: FieldErrorKeys = {};

	for (const issue of issues) {
		const field = issue.path[0];
		if (isContactField(field) && !keys[field]) {
			keys[field] = errorKeyByField[field](issue.code);
		}
	}

	return keys;
}

export function formErrorKey(code: ActionErrorCode): ContactErrorKey {
	return code === "FORBIDDEN" ? "verificationFailed" : "unavailable";
}
