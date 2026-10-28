import { getDictionary, type Locale } from "../i18n";
import { getPath } from "../i18n/routes";
import { getDefaultOgImage, siteDetails } from "./site";

// https://schema.org/ProfessionalService – no address until the registered office is real (#17).
export function buildProfessionalService(locale: Locale, site: URL) {
	const dictionary = getDictionary(locale);

	return {
		"@context": "https://schema.org",
		"@type": "ProfessionalService",
		name: siteDetails.name,
		description: dictionary.home.description,
		url: new URL(getPath("home", locale), site).href,
		image: new URL(getDefaultOgImage(locale), site).href,
		email: siteDetails.email,
		telephone: siteDetails.phone,
		areaServed: [
			{ "@type": "City", name: "Plzeň" },
			{ "@type": "AdministrativeArea", name: dictionary.footer.region },
		],
		sameAs: siteDetails.profiles.map((profile) => profile.url),
	};
}

// Inside <script>, "</script>" in a string value would end the element early; "<" is
// the same character for the JSON parser.
export function serializeJsonLd(data: object): string {
	return JSON.stringify(data).replaceAll("<", "\\u003c");
}
