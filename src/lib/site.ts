import type { Locale } from "../i18n";

export type ProfileKind = "github" | "linkedin";

interface Profile {
	kind: ProfileKind;
	label: string;
	url: string;
}

interface LegalDetails {
	ico: string;
	registeredOffice: string;
	isVatPayer: boolean;
}

export const siteDetails = {
	name: "Michal Roučka",
	email: "michal@michalroucka.cz",
	phone: "+420 774 739 180",
	profiles: [
		{
			kind: "github",
			label: "GitHub",
			url: "https://github.com/michroucka",
		},
		{
			kind: "linkedin",
			label: "LinkedIn",
			url: "https://www.linkedin.com/in/michroucka",
		},
	] as Profile[],
	// Identification a sole trader must show on the website (§ 435 of the Civil Code).
	// Placeholder values until the business is registered (issue #17) – do not launch with them.
	legal: {
		ico: "12345678",
		registeredOffice: "Náměstí 1, 330 00 Město",
		isVatPayer: false,
	} as LegalDetails | undefined,
	launchYear: 2026,
};

// Preview for pages without their own image; 1200 × 630, generated from brand/og/.
export function getDefaultOgImage(locale: Locale): string {
	return `/og-default-${locale}.png`;
}

// tel: links need the number without spaces (RFC 3966).
export function telHref(phone: string): string {
	return `tel:${phone.replaceAll(" ", "")}`;
}

// Content column shared by the header, mobile menu, main and footer, so everything starts
// and ends on the same vertical line; max-w-7xl stops lines and cards stretching on wide screens.
export const pageContainer = "mx-auto w-full max-w-7xl px-6";
