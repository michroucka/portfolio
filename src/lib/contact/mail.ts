import type { ContactInput } from "./schema";

export interface ContactEmail {
	from: string;
	to: string;
	replyTo: string;
	subject: string;
	text: string;
}

// Structurally matches `resend.emails`, so tests can pass a fake without the SDK.
export interface EmailClient {
	send(email: ContactEmail): Promise<{ error: unknown }>;
}

export interface ContactEmailAddresses {
	from: string;
	to: string;
}

export type SendResult = { ok: true } | { ok: false };

// Plain text only: the visitor's input never ends up in HTML markup.
export function buildContactEmail(
	inquiry: ContactInput,
	serviceLabel: string,
	addresses: ContactEmailAddresses,
): ContactEmail {
	const details = [
		`Jméno: ${inquiry.name}`,
		`E-mail: ${inquiry.email}`,
		inquiry.phone && `Telefon: ${inquiry.phone}`,
		`Služba: ${serviceLabel}`,
	].filter(Boolean);

	return {
		...addresses,
		replyTo: inquiry.email,
		subject: `Poptávka z webu: ${inquiry.name} – ${serviceLabel}`,
		text: `${details.join("\n")}\n\n${inquiry.message}`,
	};
}

// The error is logged for the server only; the caller gets no detail it could
// leak into the page (review point 5).
export async function sendContactEmail(
	client: EmailClient,
	email: ContactEmail,
): Promise<SendResult> {
	try {
		const { error } = await client.send(email);
		if (error) {
			console.error("Resend rejected the contact email", error);
			return { ok: false };
		}
		return { ok: true };
	} catch (error) {
		console.error("Sending the contact email failed", error);
		return { ok: false };
	}
}
