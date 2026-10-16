export type Theme = "light" | "dark";

export const themeKey = "theme";

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
