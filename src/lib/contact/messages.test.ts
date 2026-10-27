import { describe, expect, it } from "vitest";
import { cs } from "../../i18n/cs";
import { contactFormMessages, toInlineJson } from "./messages";

const form = cs.contact.form;
const email = "michal@example.cz";

describe("contactFormMessages", () => {
	const messages = contactFormMessages(form, email);

	it("takes the errors and the status texts from the dictionary", () => {
		expect(messages).toMatchObject({
			errors: form.errors,
			success: form.success,
			sending: form.sending,
			submit: form.submit,
			verificationUnavailable: form.verificationUnavailable,
		});
	});

	it("adds the email address", () => {
		expect(messages.email).toBe(email);
	});

	it("leaves out texts the script does not use", () => {
		expect(Object.keys(messages).toSorted()).toEqual([
			"email",
			"errors",
			"sending",
			"submit",
			"success",
			"verificationUnavailable",
		]);
	});
});

describe("toInlineJson", () => {
	const injection = "</script><script>alert(1)</script>";

	it("round-trips through JSON.parse", () => {
		const value = { text: injection, nested: { list: [1, "a<b"] } };
		expect(JSON.parse(toInlineJson(value))).toEqual(value);
	});

	it("never contains a closing script tag", () => {
		const json = toInlineJson({ text: injection });
		expect(json).not.toContain("</script");
		expect(json).not.toContain("<");
	});

	it("keeps Czech characters readable", () => {
		expect(toInlineJson({ text: "Děkuji, zpráva odešla." })).toContain(
			"Děkuji, zpráva odešla.",
		);
	});
});
