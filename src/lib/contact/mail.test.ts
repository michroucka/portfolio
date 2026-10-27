import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildContactEmail,
	EMAIL_TIMEOUT_MS,
	sendContactEmail,
	type EmailClient,
} from "./mail";
import type { ContactInput } from "./schema";

const inquiry: ContactInput = {
	name: "Jiří Šťastný",
	email: "jiri@example.cz",
	phone: "+420 777 123 456",
	service: "presentation-website",
	message: "Dobrý den,\nmám zájem o web.",
};

const addresses = { from: "web@example.cz", to: "michal@example.cz" };

describe("buildContactEmail", () => {
	const email = buildContactEmail(inquiry, "Prezentační web", addresses);

	it("goes from the site sender to the target address", () => {
		expect(email.from).toBe(addresses.from);
		expect(email.to).toBe(addresses.to);
	});

	it("replies to the customer", () => {
		expect(email.replyTo).toBe(inquiry.email);
	});

	it("names the customer and the service in the subject", () => {
		expect(email.subject).toContain("Jiří Šťastný");
		expect(email.subject).toContain("Prezentační web");
	});

	it("contains the contact details and the message unchanged", () => {
		expect(email.text).toContain("jiri@example.cz");
		expect(email.text).toContain("+420 777 123 456");
		expect(email.text).toContain("Dobrý den,\nmám zájem o web.");
	});

	it.each([{ phone: "" }, { phone: undefined }])(
		"leaves out the phone line without a phone ('$phone')",
		({ phone }) => {
			const withoutPhone = buildContactEmail(
				{ ...inquiry, phone },
				"Prezentační web",
				addresses,
			);
			expect(withoutPhone.text).not.toContain("Telefon");
		},
	);
});

describe("sendContactEmail", () => {
	const email = buildContactEmail(inquiry, "Prezentační web", addresses);
	const errorDetail = "API key is invalid: re_secret";

	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function clientAnswering(
		send: EmailClient["send"],
	): EmailClient & { send: ReturnType<typeof vi.fn> } {
		return { send: vi.fn(send) };
	}

	it("sends the built email and succeeds", async () => {
		const client = clientAnswering(async () => ({ error: null }));

		await expect(sendContactEmail(client, email)).resolves.toEqual({
			ok: true,
		});
		expect(client.send).toHaveBeenCalledWith(email, expect.anything());
	});

	it("gives the request a timeout signal", async () => {
		const timeout = vi.spyOn(AbortSignal, "timeout");
		const client = clientAnswering(async () => ({ error: null }));

		await sendContactEmail(client, email);

		expect(timeout).toHaveBeenCalledWith(EMAIL_TIMEOUT_MS);
		expect(client.send.mock.calls[0][1]).toEqual({
			signal: timeout.mock.results[0].value,
		});
	});

	it("fails without the error detail when Resend does not answer in time", async () => {
		const client = clientAnswering(async () => {
			throw new DOMException("The operation timed out.", "TimeoutError");
		});

		await expect(sendContactEmail(client, email)).resolves.toEqual({
			ok: false,
		});
	});

	it("fails without the error detail when Resend returns an error", async () => {
		const client = clientAnswering(async () => ({
			error: { name: "validation_error", message: errorDetail },
		}));

		const result = await sendContactEmail(client, email);

		expect(result).toEqual({ ok: false });
		expect(JSON.stringify(result)).not.toContain(errorDetail);
	});

	it("fails without the error detail when the request throws", async () => {
		const client = clientAnswering(async () => {
			throw new Error(errorDetail);
		});

		const result = await sendContactEmail(client, email);

		expect(result).toEqual({ ok: false });
		expect(JSON.stringify(result)).not.toContain(errorDetail);
	});

	it("logs the error for the server", async () => {
		const client = clientAnswering(async () => {
			throw new Error(errorDetail);
		});

		await sendContactEmail(client, email);

		expect(console.error).toHaveBeenCalled();
	});
});
