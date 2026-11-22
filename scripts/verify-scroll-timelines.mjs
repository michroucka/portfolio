// Verifies that no `animation` shorthand in the built CSS (dist/) carries a scroll or view
// timeline. The CSS minifier folds `animation` + `animation-timeline` into one shorthand, which
// Chrome and Safari reject as a whole – the animation silently never runs (the collaboration
// timeline fill once stayed fully coloured in production while it worked in dev).
// Run after `npm run build`: `npm run verify:dist`.

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const DIST = "dist";
const ANIMATION_SHORTHAND = /(?<![\w-])animation\s*:\s*([^;}]*)/g;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
// A dashed ident (named timeline) or scroll()/view() – var(--…) is removed before the test.
const TIMELINE_IN_VALUE = /(^|[\s,])--[\w-]+|\b(?:scroll|view)\(/;

async function findFiles(dir, extension) {
	const entries = await readdir(dir, {
		withFileTypes: true,
		recursive: true,
	});
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(extension))
		.map((entry) => join(entry.parentPath, entry.name));
}

function findTimelineShorthands(css) {
	return [...css.matchAll(ANIMATION_SHORTHAND)]
		.map(([declaration, value]) => ({
			declaration,
			value: value.replace(/var\([^)]*\)/g, ""),
		}))
		.filter(({ value }) => TIMELINE_IN_VALUE.test(value))
		.map(({ declaration }) => declaration.trim());
}

const cssFiles = await findFiles(DIST, ".css");
const htmlFiles = await findFiles(DIST, ".html");
const failures = [];

for (const file of cssFiles) {
	for (const declaration of findTimelineShorthands(
		await readFile(file, "utf8"),
	)) {
		failures.push(`${file}: ${declaration}`);
	}
}

for (const file of htmlFiles) {
	const html = await readFile(file, "utf8");
	for (const [, css] of html.matchAll(STYLE_BLOCK)) {
		for (const declaration of findTimelineShorthands(css)) {
			failures.push(`${file} <style>: ${declaration}`);
		}
	}
}

if (cssFiles.length + htmlFiles.length === 0) {
	failures.push(
		`${DIST}/ neobsahuje žádné CSS ani HTML – spustil jsi build?`,
	);
}

if (failures.length > 0) {
	console.error(
		`Scroll timeline: ${failures.length} chyb – animation-timeline patří do samostatné vlastnosti, ne do zkratky animation (zapiš longhands)\n- ${failures.join("\n- ")}`,
	);
	process.exitCode = 1;
} else {
	console.log(
		`Scroll timeline: OK (${cssFiles.length} CSS souborů, ${htmlFiles.length} stránek)`,
	);
}
