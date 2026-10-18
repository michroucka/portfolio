export type Theme = "light" | "dark";

export const themeKey = "theme";

// Barva lišty prohlížeče (<meta name="theme-color">) = pozadí tématu.
// Musí odpovídat --theme-background v global.css (CSS proměnné nejdou v inline skriptu před CSS přečíst).
export const themeColors: Record<Theme, string> = {
	dark: "#0E0F11",
	light: "#F5F3EE",
};

export const themeColorSelector = 'meta[name="theme-color"]';

// Dotaz na světlé téma: bez systémové preference vychází false → výchozí tmavé téma.
export const systemLightQuery = "(prefers-color-scheme: light)";

export function resolveTheme({
	stored,
	system,
}: {
	stored: string | null;
	system: Theme;
}): Theme {
	if (isTheme(stored)) {
		return stored;
	}
	return system;
}

export function isTheme(value: string | null): value is Theme {
	return value === "light" || value === "dark";
}

export function toggleTheme(current: Theme): Theme {
	return current === "light" ? "dark" : "light";
}
