// Source of truth for the dictionary shape – en.ts must match it key by key.
export const cs = {
	nav: {
		services: "Služby",
		projects: "Projekty",
		about: "O mně",
		collaboration: "Spolupráce",
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
			"Od prezentačního webu po rezervační systém na míru. Osobně, srozumitelně a bez agenturních přirážek. Plzeň a okolí.",
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
		moreProjects: "Další projekty najdete",
		moreProjectsLink: "na mém GitHubu",
		types: {
			web: "Web",
			"web-app": "Web s aplikací",
			app: "Aplikace",
		},
		scope: {
			branding: "Logo a vizuální identita",
			website: "Web",
			booking: "Rezervační systém",
			admin: "Administrace",
			"local-seo": "Profil na Googlu a Firmy.cz",
		},
	},
	projectPage: {
		factsLabel: "O projektu",
		yearLabel: "Rok",
		scopeLabel: "Co vzniklo",
		tagsLabel: "Použité technologie",
		linksLabel: "Odkazy",
		liveLink: "Živý web",
		repoLink: "Zdrojový kód",
		ctaTitle: "Chcete něco podobného?",
		ctaText:
			"Napište mi, co vaše firma potřebuje. První konzultace je nezávazná a zdarma.",
		ctaLink: "Nezávazná konzultace",
	},
	gallery: {
		label: "Zvětšený obrázek",
		close: "Zavřít",
		previous: "Předchozí obrázek",
		next: "Další obrázek",
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
			"Jmenuji se Michal Roučka a pocházím z okolí Plzně. K programování jsem se dostal až na vysoké škole: na Fakultě aplikovaných věd ZČU jsem v roce 2026 dokončil bakaláře v oboru softwarové inženýrství a nyní tam pokračuji v navazujícím studiu.",
			"Weby a aplikace pro malé firmy dělám vedle studia. Naplňuje mě, když po mně zůstane něco, co lidem opravdu pomáhá, a chci mít za sebou skutečné projekty pro skutečné zákazníky, ne jen školní zadání. Každý web proto dělám tak, jako by byl mojí vizitkou – protože jí je.",
			"Pracuji sám, takže mluvíte vždy přímo se mnou – s tím, kdo váš web navrhuje i programuje.",
		],
		valuesTitle: "Na čem si zakládám",
		values: [
			{
				title: "Rychlá komunikace",
				description:
					"Na odpověď na e-mail nebudete čekat týdny. Ozvu se vždy, jak nejdřív to půjde.",
			},
			{
				title: "Spolehlivost",
				description:
					"Domluvené termíny dodržuji. Na schůzku přijdu včas a hotovou práci odevzdám, kdy jsme si řekli. Kdyby se přece jen něco zdrželo, dám vám včas vědět a domluvíme se, jak dál.",
			},
			{
				title: "Rychlý a kvalitní web",
				description:
					"Načte se hned, funguje na telefonu i na počítači a je postavený tak, aby se dal snadno udržovat a rozšiřovat.",
			},
			{
				title: "Vaše spokojenost",
				description:
					"Hotovo je, až když jste spokojení vy. Ne ve chvíli, kdy si úkol odškrtnu já.",
			},
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
