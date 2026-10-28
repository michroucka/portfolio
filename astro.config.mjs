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

	site: "https://www.michalroucka.cz",

	// One canonical URL form: every path ends with a slash.
	trailingSlash: "always",

	i18n: {
		defaultLocale: "cs",
		locales: ["cs", "en"],
		routing: {
			prefixDefaultLocale: false,
		},
	},

	// Shiki colours code with inline styles, which the CSP below would block; the site has no code blocks.
	markdown: {
		syntaxHighlight: false,
	},

	// Astro hashes its own inline scripts and styles into a per-page <meta> CSP.
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self' data:",
				// Turnstile renders its challenge in an iframe from this origin.
				"frame-src https://challenges.cloudflare.com",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			scriptDirective: {
				resources: ["'self'", "https://challenges.cloudflare.com"],
			},
			styleDirective: {
				// Components pass computed values as inline style attributes (e.g. --dot).
				resources: [
					"'self'",
					{ resource: "'unsafe-inline'", kind: "attribute" },
				],
			},
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
