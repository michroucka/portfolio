import { describe, expect, it, vi } from "vitest";
import {
	TURNSTILE_TIMEOUT_MS,
	TURNSTILE_VERIFY_URL,
	verifyTurnstileToken,
} from "./turnstile";

const secret = "test-secret";
const token = "test-token";

function fetchReturning(body: unknown, status = 200) {
	return vi.fn<typeof fetch>(async () => Response.json(body, { status }));
}

describe("verifyTurnstileToken", () => {
	it("is verified when Turnstile answers success: true", async () => {
		const fetchFn = fetchReturning({ success: true });
		await expect(
			verifyTurnstileToken({ token, secret, fetchFn }),
		).resolves.toBe("verified");
	});

	it("is rejected when Turnstile answers success: false", async () => {
		const fetchFn = fetchReturning({
			success: false,
			"error-codes": ["invalid-input-response"],
		});
		await expect(
			verifyTurnstileToken({ token, secret, fetchFn }),
		).resolves.toBe("rejected");
	});

	it("sends the secret and the token to the siteverify endpoint", async () => {
		const fetchFn = fetchReturning({ success: true });
		await verifyTurnstileToken({ token, secret, fetchFn });

		const [url, init] = fetchFn.mock.calls[0];
		expect(url).toBe(TURNSTILE_VERIFY_URL);
		expect(init?.method).toBe("POST");
		const body = init?.body as FormData;
		expect(body.get("secret")).toBe(secret);
		expect(body.get("response")).toBe(token);
	});

	it.each([{ token: undefined }, { token: "" }])(
		"is rejected without a network call when the token is missing ('$token')",
		async ({ token }) => {
			const fetchFn = fetchReturning({ success: true });
			await expect(
				verifyTurnstileToken({ token, secret, fetchFn }),
			).resolves.toBe("rejected");
			expect(fetchFn).not.toHaveBeenCalled();
		},
	);

	it("is unavailable when the network request fails", async () => {
		const fetchFn = vi.fn<typeof fetch>(async () => {
			throw new TypeError("fetch failed");
		});
		await expect(
			verifyTurnstileToken({ token, secret, fetchFn }),
		).resolves.toBe("unavailable");
	});

	it("is unavailable when Turnstile answers with a server error", async () => {
		const fetchFn = fetchReturning({ success: false }, 500);
		await expect(
			verifyTurnstileToken({ token, secret, fetchFn }),
		).resolves.toBe("unavailable");
	});

	it("is unavailable when the response is not JSON", async () => {
		const fetchFn = vi.fn<typeof fetch>(
			async () => new Response("<html>Bad gateway</html>"),
		);
		await expect(
			verifyTurnstileToken({ token, secret, fetchFn }),
		).resolves.toBe("unavailable");
	});

	it("is unavailable when Turnstile does not answer in time", async () => {
		const fetchFn = vi.fn<typeof fetch>(async () => {
			throw new DOMException("The operation timed out.", "TimeoutError");
		});
		await expect(
			verifyTurnstileToken({ token, secret, fetchFn }),
		).resolves.toBe("unavailable");
	});

	it("gives the request a timeout signal", async () => {
		const timeout = vi.spyOn(AbortSignal, "timeout");
		const fetchFn = fetchReturning({ success: true });
		await verifyTurnstileToken({ token, secret, fetchFn });

		expect(timeout).toHaveBeenCalledWith(TURNSTILE_TIMEOUT_MS);
		expect(fetchFn.mock.calls[0][1]?.signal).toBe(
			timeout.mock.results[0].value,
		);
		timeout.mockRestore();
	});
});
