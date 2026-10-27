import type { Dictionary } from "../../i18n/cs";

type FormDictionary = Dictionary["contact"]["form"];

// What the client script needs from the dictionary: it runs in the browser and
// cannot import the dictionaries without shipping both languages.
export interface ContactFormMessages {
	errors: FormDictionary["errors"];
	success: string;
	sending: string;
	submit: string;
	verificationUnavailable: string;
	email: string;
}

export function contactFormMessages(
	form: FormDictionary,
	email: string,
): ContactFormMessages {
	return {
		errors: form.errors,
		success: form.success,
		sending: form.sending,
		submit: form.submit,
		verificationUnavailable: form.verificationUnavailable,
		email,
	};
}

// Replaces "<" with "\u003c" to prevent </script> from ending the script tag.
export function toInlineJson(value: unknown): string {
	return JSON.stringify(value).replaceAll("<", "\\u003c");
}
