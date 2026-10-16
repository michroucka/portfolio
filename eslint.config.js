import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import globals from "globals";

export default defineConfig([
	globalIgnores(["dist/", ".astro/", ".claude/", ".agents/", "brand/"]),
	js.configs.recommended,
	tseslint.configs.recommended,
	astro.configs["flat/recommended"],
	{
		// Pomocné skripty běží v Node, ne v prohlížeči.
		files: ["scripts/**"],
		languageOptions: { globals: globals.node },
	},
	{
		rules: {
			"prefer-const": "error",
		},
	},
	// Musí být poslední – vypíná pravidla, která by kolidovala s Prettierem.
	eslintConfigPrettier,
]);
