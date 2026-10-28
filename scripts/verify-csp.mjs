// Verifies that every inline script and <style> in the built pages (dist/) is allowed by that
// page's CSP <meta>. Astro hashes only what it processes; an inline block it misses would be
// blocked in production without any build error.
// Run after `npm run build`: `npm run verify:dist`.

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const DIST = "dist";
const CSP_META =
	/<meta\b[^>]*\bhttp-equiv="content-security-policy"[^>]*\bcontent="([^"]*)"/i;
const INLINE_BLOCK = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/g;
// JSON data blocks are never executed, so the CSP does not apply to them.
const EXECUTABLE_SCRIPT_TYPES = new Set(["", "module", "text/javascript"]);

async function findHtmlFiles(dir) {
	const entries = await readdir(dir, {
		withFileTypes: true,
		recursive: true,
	});
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
		.map((entry) => join(entry.parentPath, entry.name));
}

function decodeAttribute(value) {
	return value
		.replaceAll("&#39;", "'")
		.replaceAll("&quot;", '"')
		.replaceAll("&amp;", "&");
}

// Returns the sources of the directive that governs inline blocks of the given kind:
// the -elem variant when present, otherwise the base directive.
function sourcesFor(policy, kind) {
	const directives = new Map(
		policy
			.split(";")
			.map((directive) => directive.trim().split(/\s+/))
			.filter(([name]) => name)
			.map(([name, ...sources]) => [name, sources]),
	);
	return (
		directives.get(`${kind}-src-elem`) ??
		directives.get(`${kind}-src`) ??
		[]
	);
}

function scriptType(attributes) {
	return (/\btype="([^"]*)"/.exec(attributes)?.[1] ?? "").toLowerCase();
}

function isCheckedBlock(tag, attributes) {
	if (tag === "style") return true;
	return (
		!/\bsrc=/.test(attributes) &&
		EXECUTABLE_SCRIPT_TYPES.has(scriptType(attributes))
	);
}

function sha256(content) {
	return `'sha256-${createHash("sha256").update(content).digest("base64")}'`;
}

// Browsers ignore 'unsafe-inline' once a directive lists any hash (preview builds rely on it
// for styles, see astro.config.mjs).
function isAllowed(sources, content) {
	const hasHashes = sources.some((source) => source.startsWith("'sha"));
	if (!hasHashes) return sources.includes("'unsafe-inline'");
	return sources.includes(sha256(content));
}

const files = await findHtmlFiles(DIST);
const failures = [];
let checkedBlocks = 0;

for (const file of files) {
	const html = await readFile(file, "utf8");
	const meta = CSP_META.exec(html);
	if (!meta) {
		failures.push(`${file}: chybí CSP <meta>`);
		continue;
	}
	const policy = decodeAttribute(meta[1]);

	for (const [, tag, attributes, content] of html.matchAll(INLINE_BLOCK)) {
		if (!isCheckedBlock(tag, attributes)) continue;
		checkedBlocks++;
		const sources = sourcesFor(
			policy,
			tag === "script" ? "script" : "style",
		);
		if (!isAllowed(sources, content)) {
			failures.push(
				`${file}: inline <${tag}${attributes}> nemá hash v CSP (${content.trim().slice(0, 60)}…)`,
			);
		}
	}
}

if (files.length === 0) {
	failures.push(`${DIST}/ neobsahuje žádné HTML – spustil jsi build?`);
}

if (failures.length > 0) {
	console.error(`CSP: ${failures.length} chyb\n- ${failures.join("\n- ")}`);
	process.exitCode = 1;
} else {
	console.log(
		`CSP: OK (${files.length} stránek, ${checkedBlocks} inline bloků)`,
	);
}
