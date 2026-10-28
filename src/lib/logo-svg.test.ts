import { describe, expect, it } from "vitest";
import {
	cropProtectiveZone,
	dotToRect,
	fitViewBoxToCenteredMark,
	prepareLogoSvg,
	removeTitleAndAttributes,
} from "./logo-svg";

const logo =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="t">' +
	'<title id="t">Logo</title><path fill="#F5F3EE" d="M0 0Z"/>' +
	'<circle fill="#FF6A3D" cx="182" cy="-17.85" r="17.85"/></svg>';

describe("removeTitleAndAttributes", () => {
	it("removes the title, size and accessibility attributes", () => {
		const svg = removeTitleAndAttributes(logo);

		expect(svg).not.toMatch(/<title|width=|height=|role=|aria-labelledby=/);
		expect(svg).toContain('viewBox="0 0 256 256"');
	});
});

describe("cropProtectiveZone", () => {
	it("crops one dot diameter from every side of the viewBox", () => {
		expect(cropProtectiveZone(logo)).toContain(
			'viewBox="35.7 35.7 184.6 184.6"',
		);
	});

	it("throws when the dot is missing", () => {
		expect(() =>
			cropProtectiveZone('<svg viewBox="0 0 10 10"></svg>'),
		).toThrow(/dot circle/);
	});
});

describe("fitViewBoxToCenteredMark", () => {
	it("fits the viewBox to a mark centred in a square artboard", () => {
		const symbol =
			'<svg viewBox="0 0 256 256"><g transform="translate(28.07 168.46)"><path d="M0 0Z"/></g></svg>';

		expect(fitViewBoxToCenteredMark(symbol)).toContain(
			'viewBox="28.07 87.54 199.86 80.92"',
		);
	});

	it("throws when the artboard is not square", () => {
		expect(() =>
			fitViewBoxToCenteredMark(
				logo.replace("0 0 256 256", "0 0 300 256"),
			),
		).toThrow(/square artboard/);
	});
});

describe("dotToRect", () => {
	it("replaces the circle with an identical rounded rect", () => {
		const svg = dotToRect(logo);

		expect(svg).not.toContain("<circle");
		expect(svg).toContain(
			'<rect fill="#FF6A3D" x="164.15" y="-35.7" width="35.7" height="35.7" rx="17.85"',
		);
	});

	it("sets the dot diameter and baseline for the dot-cursor animation", () => {
		expect(dotToRect(logo)).toContain(
			'style="--dot: 35.7px; --baseline: 0px"',
		);
	});
});

describe("prepareLogoSvg", () => {
	it("applies all steps", () => {
		const svg = prepareLogoSvg(logo);

		expect(svg).not.toMatch(/<title|<circle|width="256"/);
		expect(svg).toContain('viewBox="35.7 35.7 184.6 184.6"');
	});
});
