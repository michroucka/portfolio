export function removeTitleAndAttributes(svg: string): string {
	return svg
		.replace(/<title[^>]*>[^<]*<\/title>/, "")
		.replace(/\s(?:width|height|role|aria-labelledby)="[^"]*"/g, "");
}

type ViewBox = { x: number; y: number; width: number; height: number };

function parseViewBox(svg: string): ViewBox {
	const value = svg.match(/viewBox="([^"]+)"/)?.[1];
	const [x, y, width, height, ...rest] = (value ?? "")
		.trim()
		.split(/\s+/)
		.map(Number);

	if (
		x === undefined ||
		y === undefined ||
		width === undefined ||
		height === undefined ||
		rest.length > 0 ||
		[x, y, width, height].some(Number.isNaN)
	) {
		throw new Error(`Logo SVG has a missing or invalid viewBox: ${value}`);
	}

	return { x, y, width, height };
}

function setViewBox(svg: string, { x, y, width, height }: ViewBox): string {
	const value = [x, y, width, height]
		.map((number) => Number(number.toFixed(2)))
		.join(" ");

	return svg.replace(/viewBox="[^"]+"/, `viewBox="${value}"`);
}

// The brand SVGs include a protective zone of one dot diameter (brand/source/build_final.py).
// Cropping it from the viewBox makes the logo edge the artwork edge, so it aligns with the layout
// at any width. The layout padding has to provide the protective zone instead.
export function cropProtectiveZone(svg: string): string {
	const { x, y, width, height } = parseViewBox(svg);
	const padding = 2 * findDot(svg).r;

	return setViewBox(svg, {
		x: x + padding,
		y: y + padding,
		width: width - 2 * padding,
		height: height - 2 * padding,
	});
}

// The symbol centres the mark in a square artboard: translate((size - w) / 2, size / 2 + h / 2),
// see brand/source/build_final.py. Its padding is not one dot diameter, so cropProtectiveZone would
// cut the "m"; the artwork bounds follow from the translation instead.
export function fitViewBoxToCenteredMark(svg: string): string {
	const { x, y, width: size, height } = parseViewBox(svg);
	const translation = svg.match(
		/<g transform="translate\(([\d.]+) ([\d.]+)\)">/,
	);
	const [left, baseline] = [translation?.[1], translation?.[2]].map(Number);

	if (x !== 0 || y !== 0 || size !== height) {
		throw new Error("Logo SVG is not a square artboard");
	}

	if (
		left === undefined ||
		baseline === undefined ||
		[left, baseline].some(Number.isNaN)
	) {
		throw new Error(
			"Logo SVG is missing the translation of its centred mark",
		);
	}

	return setViewBox(svg, {
		x: left,
		y: size - baseline,
		width: size - 2 * left,
		height: 2 * baseline - size,
	});
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
