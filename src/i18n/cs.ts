// Source of truth for the dictionary shape – en.ts must match it key by key.
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
		title: "Michal Roučka – weby a aplikace pro malé firmy",
		description:
			"Navrhuji a stavím weby, rezervační systémy a aplikace na míru pro malé firmy z Plzně a okolí. Orientační ceny předem, první konzultace zdarma.",
	},
	hero: {
		title: "Weby a aplikace pro malé firmy",
		subtitle:
			"Od prezentačního webu po rezervační systém na míru. Osobně, srozumitelně a bez agenturních přirážek.",
		primaryCta: "Nezávazná konzultace",
		secondaryCta: "Ukázky práce",
	},
	services: {
		title: "Služby",
		priceFrom: "od",
		priceNote: "Přesnou cenu vám řeknu po nezávazné konzultaci.",
		somethingElse: "Potřebujete něco jiného?",
		somethingElseLink: "Pojďme se pobavit",
	},
	projects: {
		title: "Vybrané projekty",
		types: {
			web: "Web",
			"web-app": "Web s aplikací",
			app: "Aplikace",
		},
	},
	process: {
		title: "Jak spolupráce probíhá",
		steps: [
			{
				title: "Konzultace",
				description:
					"Probereme, co vaše firma potřebuje a co má web nebo aplikace vyřešit. Nezávazně a zdarma.",
			},
			{
				title: "Návrh",
				description:
					"Připravím návrh a pevnou cenu. Pracovat začnu, až s obojím budete souhlasit.",
			},
			{
				title: "Vývoj",
				description:
					"Průběžně vám ukazuji, jak práce postupuje, a vaše připomínky zapracuji hned.",
			},
			{
				title: "Spuštění",
				description:
					"Web nasadím, napojím doménu a ukážu vám, jak si obsah upravit.",
			},
			{
				title: "Podpora",
				description:
					"Po spuštění se nikam neztratím. Opravy, úpravy i další rozvoj řešíme spolu.",
			},
		],
	},
	about: {
		title: "O mně",
		text: [
			"Jsem Michal Roučka, vývojář z okolí Plzně. Malým firmám stavím weby a aplikace, které jim šetří čas a přivádějí zákazníky.",
			"Pracuji sám, takže mluvíte vždy přímo se mnou – s tím, kdo váš web navrhuje i programuje. Žádní prostředníci a žádné agenturní přirážky.",
		],
		photoAlt: "Portrét Michala Roučky",
	},
	contact: {
		title: "Kontakt",
		intro: "Napište mi nebo zavolejte. Ozvu se do dvou pracovních dnů a domluvíme si nezávaznou konzultaci.",
		emailLabel: "E-mail",
		phoneLabel: "Telefon",
	},
	languageSwitcher: {
		label: "Jazyk",
	},
	notFound: {
		title: "Stránka nenalezena",
		description: "Omlouvám se, ale stránka, kterou hledáte, neexistuje.",
		linkHome: "Vrátit se na domovskou stránku",
	},
};

export type Dictionary = typeof cs;
