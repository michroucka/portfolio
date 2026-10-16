import { describe, expect, it } from "vitest";

// Ověřuje jen, že Vitest běží přes konfiguraci Astra. Smazat, až přibude první skutečný test.
describe("test runner", () => {
	it("runs", () => {
		expect(1 + 1).toBe(2);
	});
});
