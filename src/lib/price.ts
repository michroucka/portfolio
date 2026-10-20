import type { Locale } from "../i18n";

export function formatPrice(amount: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "CZK",
		maximumFractionDigits: 0,
	}).format(amount);
}
