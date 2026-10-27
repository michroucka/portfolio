export const TURNSTILE_VERIFY_URL =
	"https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Well below the Vercel Function limit, so a hanging Turnstile still leaves time
// to answer the visitor with the email fallback.
export const TURNSTILE_TIMEOUT_MS = 5000;

// "unavailable" is kept apart from "rejected": an outage must lead to the generic
// error with the email fallback, never to a silent success or a "you are a bot" message.
export type TurnstileResult = "verified" | "rejected" | "unavailable";

export interface TurnstileVerification {
	token: unknown;
	secret: string;
	fetchFn?: typeof fetch;
}

// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
export async function verifyTurnstileToken({
	token,
	secret,
	fetchFn = fetch,
}: TurnstileVerification): Promise<TurnstileResult> {
	if (typeof token !== "string" || token === "") {
		return "rejected";
	}

	const body = new FormData();
	body.append("secret", secret);
	body.append("response", token);

	try {
		const response = await fetchFn(TURNSTILE_VERIFY_URL, {
			method: "POST",
			body,
			signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
		});
		if (!response.ok) {
			return "unavailable";
		}
		const outcome: unknown = await response.json();
		return isSuccessfulOutcome(outcome) ? "verified" : "rejected";
	} catch {
		return "unavailable";
	}
}

function isSuccessfulOutcome(outcome: unknown): boolean {
	return (
		typeof outcome === "object" &&
		outcome !== null &&
		"success" in outcome &&
		outcome.success === true
	);
}
