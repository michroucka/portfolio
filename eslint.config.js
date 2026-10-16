import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
	globalIgnores(["dist/", ".astro/", ".claude/", ".agents/", "brand/"]),
	js.configs.recommended,
	tseslint.configs.recommended,
	astro.configs["flat/recommended"],
	{
		rules: {
			"prefer-const": "error",
		},
	},
	// Musí být poslední – vypíná pravidla, která by kolidovala s Prettierem.
	eslintConfigPrettier,
]);
