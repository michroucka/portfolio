// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	integrations: [mdx(), sitemap()],

	site: "https://example.com",

	// One canonical URL form: every path ends with a slash.
	trailingSlash: "always",

	i18n: {
		defaultLocale: "cs",
		locales: ["cs", "en"],
		routing: {
			prefixDefaultLocale: false,
		},
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
