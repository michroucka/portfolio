import type { APIRoute } from "astro";

// An endpoint rather than public/robots.txt, so the sitemap URL follows `site` once the domain is set (#14).
export const GET: APIRoute = ({ site }) => {
	if (!site) {
		throw new Error(
			"Astro.site is not defined, set it in astro.config.mjs",
		);
	}
	const sitemapUrl = new URL("sitemap-index.xml", site).href;

	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
};
