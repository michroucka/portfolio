import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { locales } from "./i18n";

// z.record with enum keys is exhaustive in Zod 4, so a new locale makes every missing translation a build error.
const localized = <T extends z.ZodType>(value: T) =>
	z.record(z.enum(locales), value);

const httpUrl = z.url({ protocol: /^https?$/ });

const services = defineCollection({
	loader: file("src/content/services.yaml"),
	schema: z.object({
		title: localized(z.string()),
		description: localized(z.string()),
		priceFrom: z.number().int().positive(),
		features: localized(z.array(z.string())),
		order: z.number().int(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			cover: image(),
			type: z.enum(["web", "web-app", "app"]),
			tags: z.array(z.string()),
			liveUrl: httpUrl.optional(),
			repoUrl: httpUrl.optional(),
			featured: z.boolean().default(false),
			order: z.number().int(),
			testimonial: z
				.object({
					quote: z.string(),
					author: z.string(),
				})
				.optional(),
		}),
});

export const collections = { services, projects };
