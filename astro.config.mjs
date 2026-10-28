// @ts-check
import process from "node:process";

import { defineConfig, envField } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

import { getSitemapLinks } from "./src/lib/sitemap.ts";

// Vercel injects its Toolbar into preview deployments only; the CSP must allow it there:
// https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
const isPreviewDeployment = process.env.VERCEL_ENV === "preview";

/** @param {string[]} sources */
function previewOnly(sources) {
	return isPreviewDeployment ? sources : [];
}

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

	// The site has no code blocks; turned off so the build does not warn that Shiki's
	// inline styles clash with the CSP.
	markdown: {
		syntaxHighlight: false,
	},

	// Astro hashes its own inline scripts and styles into a per-page <meta> CSP.
	// Turnstile sources: https://developers.cloudflare.com/turnstile/reference/content-security-policy/
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				`img-src ${["'self'", "data:", ...previewOnly(["https://vercel.live", "https://vercel.com", "blob:"])].join(" ")}`,
				`connect-src ${["'self'", ...previewOnly(["https://vercel.live", "wss://ws-us3.pusher.com"])].join(" ")}`,
				`frame-src ${["https://challenges.cloudflare.com", ...previewOnly(["https://vercel.live"])].join(" ")}`,
				`font-src ${["'self'", ...previewOnly(["https://vercel.live", "https://assets.vercel.com"])].join(" ")}`,
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			scriptDirective: {
				resources: [
					"'self'",
					"https://challenges.cloudflare.com",
					...previewOnly(["https://vercel.live"]),
				],
			},
			styleDirective: {
				resources: [
					"'self'",
					// Astro drops its style hashes when 'unsafe-inline' is present, so previews
					// enforce styles less strictly than production.
					...previewOnly(["https://vercel.live", "'unsafe-inline'"]),
					// Components pass computed values as inline style attributes (e.g. --dot).
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
