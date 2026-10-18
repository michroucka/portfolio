// Ověří inline skript z ThemeScript.astro v hotovém buildu (dist/).
// Skript vzniká z isTheme/resolveTheme přes toString(), takže jeho správnost závisí na tom,
// co vyprodukoval bundler. Testy v src/lib/theme.test.ts tohle nepokrývají.
// Spouštět po `npm run build`: `npm run verify:dist`.

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const DIST = "dist";
// Skript tématu se pozná podle atributu data-theme-script (viz ThemeScript.astro),
// ne podle obsahu – ten se může objevit i v jiných skriptech.
const THEME_SCRIPT =
	/<script\b[^>]*\bdata-theme-script\b[^>]*>([\s\S]*?)<\/script>/g;

const scenarios = [
	{
		name: "nic uloženého, světlý systém",
		stored: null,
		light: true,
		expected: "light",
	},
	{
		name: "nic uloženého, bez preference",
		stored: null,
		light: false,
		expected: "dark",
	},
	{
		name: "uloženo dark, světlý systém",
		stored: "dark",
		light: true,
		expected: "dark",
	},
	{
		name: "uloženo light, tmavý systém",
		stored: "light",
		light: false,
		expected: "light",
	},
	{
		name: "neplatná hodnota, světlý systém",
		stored: "blue",
		light: true,
		expected: "light",
	},
	{
		name: "localStorage vyhodí výjimku",
		stored: null,
		light: true,
		throws: true,
		expected: "light",
	},
];

async function findHtmlFiles(dir) {
	const entries = await readdir(dir, {
		withFileTypes: true,
		recursive: true,
	});
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
		.map((entry) => join(entry.parentPath, entry.name));
}

// Barvy lišty prohlížeče – musí odpovídat themeColors v src/lib/theme.ts.
const THEME_COLORS = { dark: "#0E0F11", light: "#F5F3EE" };

function runScenario(code, { stored, light, throws }) {
	const meta = {
		content: undefined,
		setAttribute(name, value) {
			if (name === "content") this.content = value;
		},
	};
	const document = {
		documentElement: { dataset: {} },
		querySelector: (selector) =>
			selector === 'meta[name="theme-color"]' ? meta : null,
	};
	const localStorage = {
		getItem() {
			if (throws) throw new Error("blocked");
			return stored;
		},
	};
	const window = { matchMedia: () => ({ matches: light }) };
	new Function("document", "localStorage", "window", code)(
		document,
		localStorage,
		window,
	);
	return {
		theme: document.documentElement.dataset.theme,
		color: meta.content,
	};
}

const files = await findHtmlFiles(DIST);
const failures = [];
let pagesWithScript = 0;

for (const file of files) {
	const html = await readFile(file, "utf8");
	const scripts = [...html.matchAll(THEME_SCRIPT)].map((match) => match[1]);

	// Stránka bez skriptu tématu je v pořádku (např. přesměrování) – kontroluje se jen to, co tam je.
	if (scripts.length === 0) continue;
	if (scripts.length > 1) {
		failures.push(
			`${file}: skript tématu je na stránce ${scripts.length}× (čekán nejvýš 1)`,
		);
		continue;
	}

	for (const scenario of scenarios) {
		try {
			const { theme, color } = runScenario(scripts[0], scenario);
			if (theme !== scenario.expected) {
				failures.push(
					`${file} – ${scenario.name}: čekáno ${scenario.expected}, dostali jsme ${theme}`,
				);
			}
			if (color !== THEME_COLORS[scenario.expected]) {
				failures.push(
					`${file} – ${scenario.name}: theme-color ${color}, čekáno ${THEME_COLORS[scenario.expected]}`,
				);
			}
		} catch (error) {
			failures.push(
				`${file} – ${scenario.name}: skript spadl (${error.message})`,
			);
		}
	}
	pagesWithScript++;
}

if (files.length === 0) {
	failures.push(`${DIST}/ neobsahuje žádné HTML – spustil jsi build?`);
} else if (pagesWithScript === 0) {
	failures.push(
		"žádná stránka neobsahuje skript tématu (chybí atribut data-theme-script?)",
	);
}

if (failures.length > 0) {
	console.error(
		`Skript tématu: ${failures.length} chyb\n- ${failures.join("\n- ")}`,
	);
	process.exitCode = 1;
} else {
	console.log(
		`Skript tématu: OK (${pagesWithScript} stránek × ${scenarios.length} scénářů)`,
	);
}
