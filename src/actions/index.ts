import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { contactSchema, type ContactInput } from "../lib/contact/schema";
import { getEntry } from "astro:content";
import {
	RESEND_API_KEY,
	TURNSTILE_SECRET_KEY,
	CONTACT_EMAIL_TO,
	CONTACT_EMAIL_FROM,
} from "astro:env/server";
import { isSpam } from "../lib/contact/spam";
import { verifyTurnstileToken } from "../lib/contact/turnstile";
import { buildContactEmail, sendContactEmail } from "../lib/contact/mail";
import { Resend } from "resend";

const contactFormSchema = contactSchema.extend({
	note: z.string().optional(), // honeypot
	elapsedMs: z.string().optional(),
	"cf-turnstile-response": z.string().optional(),
});

async function serviceLabelFor(
	service: ContactInput["service"],
): Promise<string> {
	if (service === "other") return "Jiné";
	const entry = await getEntry("services", service);
	return entry?.data.title.cs ?? service;
}

export const server = {
	contact: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (input) => {
			// act like request succeeded on spam detection to avoid alerting the bot
			if (isSpam({ honeypot: input.note, elapsedMs: input.elapsedMs })) {
				return { success: true };
			}
			const turnstileStatus = await verifyTurnstileToken({
				token: input["cf-turnstile-response"],
				secret: TURNSTILE_SECRET_KEY,
			});
			if (turnstileStatus === "rejected") {
				throw new ActionError({ code: "FORBIDDEN" });
			}
			if (turnstileStatus === "unavailable") {
				throw new ActionError({ code: "SERVICE_UNAVAILABLE" });
			}

			const serviceLabel = await serviceLabelFor(input.service);
			const email = buildContactEmail(input, serviceLabel, {
				from: CONTACT_EMAIL_FROM,
				to: CONTACT_EMAIL_TO,
			});
			const result = await sendContactEmail(
				new Resend(RESEND_API_KEY).emails,
				email,
			);

			if (!result.ok) {
				throw new ActionError({ code: "INTERNAL_SERVER_ERROR" });
			}
			return { success: true };
		},
	}),
};
