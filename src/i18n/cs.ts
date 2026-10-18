// Zdroj pravdy pro tvar slovníku – en.ts se musí shodovat klíč po klíči.
export const cs = {
	nav: {
		services: "Služby",
		projects: "Projekty",
		collaboration: "Spolupráce",
		about: "O mně",
		contact: "Kontakt",
	},
	header: {
		menuOpen: "Otevřít menu",
		menuClose: "Zavřít menu",
		navigation: "Hlavní navigace",
		menu: "Menu",
	},
	footer: {
		lightThemeToggle: "Světlé téma",
		privacy: "Ochrana osobních údajů",
		companyId: "IČO",
	},
	layout: {
		skipToMain: "Přeskočit na obsah",
	},
	home: {
		title: "Domovská stránka",
		description: "Vítejte na mém webu",
	},
	languageSwitcher: {
		label: "Jazyk",
	},
};

export type Dictionary = typeof cs;
