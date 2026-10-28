export function removeTitleAndAttributes(svg: string): string {
	return svg
		.replace(/<title[^>]*>[^<]*<\/title>/, "")
		.replace(/\s(?:width|height|role|aria-labelledby)="[^"]*"/g, "");
}

// The brand SVGs include a protective zone of one dot diameter (brand/source/build_final.py).
// Cropping it from the viewBox makes the logo edge the artwork edge, so it aligns with the layout
// at any width. The layout padding has to provide the protective zone instead.
export function cropProtectiveZone(svg: string): string {
	const viewBox = svg.match(/viewBox="([^"]+)"/);
	const dotRadius = svg.match(/<circle[^>]*\sr="([^"]+)"/);

	if (!viewBox?.[1] || !dotRadius?.[1]) {
		throw new Error("Logo SVG is missing viewBox or the dot circle");
	}

	const [x, y, width, height] = viewBox[1].split(/\s+/).map(Number);
	const padding = Number(dotRadius[1]) * 2;

	if (
		x === undefined ||
		y === undefined ||
		width === undefined ||
		height === undefined ||
		[x, y, width, height, padding].some(Number.isNaN)
	) {
		throw new Error(`Logo SVG has an invalid viewBox: ${viewBox[1]}`);
	}

	const cropped = [
		x + padding,
		y + padding,
		width - 2 * padding,
		height - 2 * padding,
	].join(" ");

	return svg.replace(viewBox[0], `viewBox="${cropped}"`);
}

// The symbol centres the mark in a square artboard: translate((size - w) / 2, size / 2 + h / 2),
// see brand/source/build_final.py. Its padding is not one dot diameter, so cropProtectiveZone would
// cut the "m"; the artwork bounds follow from the translation instead.
export function fitViewBoxToCenteredMark(svg: string): string {
	const viewBox = svg.match(/viewBox="0 0 ([\d.]+) \1"/);
	const translation = svg.match(
		/<g transform="translate\(([\d.]+) ([\d.]+)\)">/,
	);
	const size = Number(viewBox?.[1]);
	const [left, baseline] = [translation?.[1], translation?.[2]].map(Number);

	if (
		!viewBox ||
		left === undefined ||
		baseline === undefined ||
		[size, left, baseline].some(Number.isNaN)
	) {
		throw new Error(
			"Logo SVG is not a square artboard with a centred mark",
		);
	}

	const fitted = [left, size - baseline, size - 2 * left, 2 * baseline - size]
		.map((value) => Number(value.toFixed(2)))
		.join(" ");

	return svg.replace(viewBox[0], `viewBox="${fitted}"`);
}

type Dot = { tag: string; fill: string; cx: number; cy: number; r: number };

function findDot(svg: string): Dot {
	const circle = svg.match(/<circle\s[^>]*\/>/);
	const attr = (name: string): string | undefined =>
		circle?.[0].match(new RegExp(`\\s${name}="([^"]+)"`))?.[1];

	const fill = attr("fill");
	const [cx, cy, r] = [attr("cx"), attr("cy"), attr("r")].map(Number);

	if (
		!circle ||
		!fill ||
		cx === undefined ||
		cy === undefined ||
		r === undefined ||
		[cx, cy, r].some(Number.isNaN)
	) {
		throw new Error("Logo SVG is missing the dot circle");
	}

	return { tag: circle[0], fill, cx, cy, r };
}

// Replaces the circle with a <rect> whose corner radius equals the radius (looks identical).
// Unlike a circle, a <rect> can animate width/height/rx/y, so the dot can morph into the "_" cursor.
// --dot (diameter) and --baseline (bottom edge) are used by @keyframes dot-cursor.
export function dotToRect(svg: string): string {
	const { tag, fill, cx, cy, r } = findDot(svg);
	const d = 2 * r;
	const rect =
		`<rect fill="${fill}" x="${cx - r}" y="${cy - r}" width="${d}" height="${d}" rx="${r}"` +
		` style="--dot: ${d}px; --baseline: ${cy + r}px" />`;

	return svg.replace(tag, rect);
}

export const prepareLogoSvg = (svg: string): string =>
	dotToRect(cropProtectiveZone(removeTitleAndAttributes(svg)));
