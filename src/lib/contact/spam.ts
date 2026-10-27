export const MIN_FILL_TIME_MS = 3000;

export interface SpamSignals {
	honeypot: unknown;
	// Measured by the client from page load to submit, so the server never compares
	// the visitor's clock with its own.
	elapsedMs: unknown;
}

function isHoneypotFilled(honeypot: unknown): boolean {
	return honeypot !== undefined && honeypot !== "";
}

// Number() instead of parseInt(): "12abc" must be rejected, not read as 12.
function parseElapsedMs(elapsedMs: unknown): number | undefined {
	if (typeof elapsedMs !== "string" || elapsedMs.trim() === "") {
		return undefined;
	}
	const parsed = Number(elapsedMs);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export function isSpam(signals: SpamSignals): boolean {
	const elapsedMs = parseElapsedMs(signals.elapsedMs);
	return (
		isHoneypotFilled(signals.honeypot) ||
		elapsedMs === undefined ||
		elapsedMs < MIN_FILL_TIME_MS
	);
}
