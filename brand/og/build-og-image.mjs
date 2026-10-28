// Composes the default Open Graph images from the horizontal negative logo and the hero title
// as a muted subtitle: brand/og/og-default-<locale>.svg (source) → public/og-default-<locale>.png.
// Text is outlined like the logo, so the PNG does not depend on fonts installed on the machine.
// Needs brand/source/fonts/Archivo.ttf (see brand/source/README.md). From the repo root:
// node brand/og/build-og-image.mjs
import { readFile, writeFile } from "node:fs/promises";
import { openSync } from "fontkit";
import sharp from "sharp";
import { cs } from "../../src/i18n/cs.ts";
import { en } from "../../src/i18n/en.ts";

const width = 1200;
const height = 630;
const ink = "#0E0F11";
const ash = "#A09F99";
// The logo viewBox already includes its protective zone (one dot diameter on every side).
const logoWidth = 760;
const subtitleSize = 36;
const subtitleGap = 24;
// Body text axes from the brand guidelines (§ 3): headings wdth 125, text wdth 100.
const subtitleFont = openSync("brand/source/fonts/Archivo.ttf").getVariation({
	wdth: 100,
	wght: 450,
});

const subtitles = { cs: cs.hero.title, en: en.hero.title };

function outlineText(text, size) {
	const scale = size / subtitleFont.unitsPerEm;
	const run = subtitleFont.layout(text);
	let x = 0;
	let d = "";
	run.glyphs.forEach((glyph, index) => {
		d += glyph.path.translate(x, 0).toSVG();
		x += run.positions[index].xAdvance;
	});
	return { d, width: x * scale, scale };
}

const logo = await readFile("brand/logo/mr-horizontal-negative.svg", "utf8");
const [, viewBoxWidth, viewBoxHeight] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/
	.exec(logo)
	.map(Number);
const logoHeight = (logoWidth * viewBoxHeight) / viewBoxWidth;
const logoContent = logo
	.replace(/^<svg[^>]*>/, "")
	.replace(/<\/svg>\s*$/, "")
	.replace(/<title[^>]*>.*?<\/title>/, "");

for (const [locale, text] of Object.entries(subtitles)) {
	const subtitle = outlineText(text, subtitleSize);
	const blockHeight = logoHeight + subtitleGap + subtitleSize;
	const logoY = (height - blockHeight) / 2;
	const baselineY = logoY + logoHeight + subtitleGap + subtitleSize * 0.75;
	const subtitleX = (width - subtitle.width) / 2;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${ink}"/>
<svg x="${(width - logoWidth) / 2}" y="${logoY.toFixed(2)}" width="${logoWidth}" height="${logoHeight.toFixed(2)}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">${logoContent}</svg>
<path fill="${ash}" transform="translate(${subtitleX.toFixed(2)} ${baselineY.toFixed(2)}) scale(${subtitle.scale} ${-subtitle.scale})" d="${subtitle.d}"/>
</svg>
`;

	await writeFile(`brand/og/og-default-${locale}.svg`, svg);
	await sharp(Buffer.from(svg))
		.png({ compressionLevel: 9, palette: true })
		.toFile(`public/og-default-${locale}.png`);
}
