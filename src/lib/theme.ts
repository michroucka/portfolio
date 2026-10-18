export type Theme = "light" | "dark";

export const themeKey = "theme";

// Browser UI colour (<meta name="theme-color">) = theme background.
// Must match --theme-background in global.css (the inline script runs before CSS, so it cannot read it).
export const themeColors: Record<Theme, string> = {
	dark: "#0E0F11",
	light: "#F5F3EE",
};

export const themeColorSelector = 'meta[name="theme-color"]';

// Without a system preference this is false → dark is the default.
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
