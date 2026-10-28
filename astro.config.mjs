// @ts-check
import { defineConfig, envField } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

import { getSitemapLinks } from "./src/lib/sitemap.ts";

// https://astro.build/config
export default defineConfig({
	integrations: [
		mdx(),
		sitemap({
			serialize: (item) => ({
				...item,
				links: getSitemapLinks(item.url),
			}),
		}),
	],

	// Pages stay prerendered; only the contact action runs as a Vercel Function.
	adapter: vercel({
		webAnalytics: { enabled: true },
	}),

	site: "https://michalroucka.cz",

	// One canonical URL form: every path ends with a slash.
	trailingSlash: "always",

	i18n: {
		defaultLocale: "cs",
		locales: ["cs", "en"],
		routing: {
			prefixDefaultLocale: false,
		},
	},

	env: {
		schema: {
			RESEND_API_KEY: envField.string({
				context: "server",
				access: "secret",
			}),
			TURNSTILE_SECRET_KEY: envField.string({
				context: "server",
				access: "secret",
			}),
			PUBLIC_TURNSTILE_SITE_KEY: envField.string({
				context: "client",
				access: "public",
			}),
			CONTACT_EMAIL_TO: envField.string({
				context: "server",
				access: "secret",
			}),
			CONTACT_EMAIL_FROM: envField.string({
				context: "server",
				access: "secret",
			}),
		},
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
