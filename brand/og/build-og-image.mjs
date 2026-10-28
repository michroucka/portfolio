// Composes the default Open Graph image from the horizontal negative logo:
// brand/og/og-default.svg (source) → public/og-default.png (1200 × 630).
// Run from the repo root: node brand/og/build-og-image.mjs
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const width = 1200;
const height = 630;
const ink = "#0E0F11";
// The logo viewBox already includes its protective zone, so centring it keeps the margins.
const logoWidth = 760;

const logo = await readFile("brand/logo/mr-horizontal-negative.svg", "utf8");
const [, viewBoxWidth, viewBoxHeight] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/
	.exec(logo)
	.map(Number);
const logoHeight = (logoWidth * viewBoxHeight) / viewBoxWidth;
const logoContent = logo.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${ink}"/>
<svg x="${(width - logoWidth) / 2}" y="${(height - logoHeight) / 2}" width="${logoWidth}" height="${logoHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">${logoContent}</svg>
</svg>
`;

await writeFile("brand/og/og-default.svg", svg);
await sharp(Buffer.from(svg))
	.png({ compressionLevel: 9, palette: true })
	.toFile("public/og-default.png");
