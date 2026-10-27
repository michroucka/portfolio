import type { Dictionary } from "./cs";

export const en: Dictionary = {
	nav: {
		services: "Services",
		projects: "Projects",
		about: "About me",
		collaboration: "Collaboration",
		contact: "Contact",
	},
	header: {
		menuOpen: "Open menu",
		menuClose: "Close menu",
		navigation: "Main navigation",
		menu: "Menu",
	},
	footer: {
		tagline:
			"Websites and applications for sole traders and small businesses in the Pilsen Region.",
		contactHeading: "Contact",
		region: "Pilsen Region",
		writeMessage: "Send a message",
		profilesHeading: "Profiles",
		lightThemeToggle: "Light theme",
		privacy: "Privacy policy",
		companyId: "Company ID",
		registeredOffice: "Registered office",
		tradeRegister: "Sole trader registered in the Czech Trade Register",
		notVatPayer: "Not a VAT payer",
		vatPayer: "VAT payer",
	},
	layout: {
		skipToMain: "Skip to content",
	},
	home: {
		title: "Michal Roučka – websites and applications for small businesses",
		description:
			"I design and build websites, booking systems and custom applications for small businesses in Pilsen and across the Pilsen Region. Clear prices up front, first consultation free.",
	},
	hero: {
		title: "Websites and applications for small businesses",
		subtitle:
			"From showcase websites to tailor-made booking systems. Personal, straightforward, and agency markup-free. Pilsen Region.",
		primaryCta: "Free consultation",
		secondaryCta: "Selected projects",
	},
	services: {
		title: "Services",
		priceFrom: "from",
		priceNote: "I will give you an exact price after a free consultation.",
		somethingElse: "Need something else?",
		somethingElseLink: "Let’s talk",
	},
	projects: {
		title: "Selected projects",
		types: {
			web: "Website",
			"web-app": "Website and app",
			app: "Application",
		},
		scope: {
			branding: "Logo and visual identity",
			website: "Website",
			booking: "Booking system",
			admin: "Admin app",
			"local-seo": "Google and Firmy.cz listings",
		},
	},
	projectPage: {
		factsLabel: "About the project",
		yearLabel: "Year",
		scopeLabel: "What was built",
		tagsLabel: "Technologies used",
		linksLabel: "Links",
		liveLink: "Live website",
		repoLink: "Source code",
		ctaTitle: "Want something similar?",
		ctaText:
			"Tell me what your business needs. The first consultation is free and non-binding.",
		ctaLink: "Free consultation",
	},
	gallery: {
		label: "Enlarged image",
		close: "Close",
		previous: "Previous image",
		next: "Next image",
	},
	process: {
		title: "How we work together",
		steps: [
			{
				title: "Consultation",
				description:
					"We talk about what your business needs and what the website or app should solve. Free and with no obligation.",
			},
			{
				title: "Proposal",
				description:
					"I prepare a proposal and a fixed price. I only start once you agree with both.",
			},
			{
				title: "Materials",
				description:
					"Texts, photos and a logo. Don’t have them? No problem. I write the texts from a short conversation or questionnaire, take or pick the photos, and can design a logo for you.",
			},
			{
				title: "Development",
				description:
					"I show you how the work is going along the way and take your feedback on board right away.",
			},
			{
				title: "Launch",
				description:
					"I help you choose a domain and hosting and set everything up. Both are in your name and you pay the providers directly. Then I launch the website and show you how to edit the content yourself.",
			},
			{
				title: "Support",
				description:
					"I don’t disappear after launch. Fixes, changes and new features – we handle them together.",
			},
		],
	},
	about: {
		title: "About me",
		text: [
			"My name is Michal Roučka and I’m from the Pilsen area. In 2026 I finished my bachelor’s degree in software engineering at the Faculty of Applied Sciences, University of West Bohemia, and I’m continuing there with a master’s.",
			"I build websites and applications for sole traders and small businesses in the Pilsen Region. I find it fulfilling to leave behind something that genuinely helps people. That’s why I build every website as if it were my business card – because it is.",
			"Besides programming, I take photos and do some graphic design. So I can not only build your website but also design it to look good and fit your brand, and if you like, I can prepare the photos or the logo too.",
			"I work on my own, so you always talk directly to me – the person who designs and codes your website.",
		],
		cta: "Want to talk about your project?",
		ctaLink: "Get in touch",
		valuesTitle: "What I stand for",
		values: [
			{
				title: "Fast communication",
				description:
					"I reply quickly and clearly. I explain what I do and why, so the decisions stay yours.",
			},
			{
				title: "Reliability",
				description:
					"Agreed deadlines hold, and you always know where things stand. If anything changes, you hear it from me straight away, not on the day of delivery.",
			},
			{
				title: "A fast, well-built website",
				description:
					"It loads instantly, works on phones and computers, and is built to be easy to maintain and extend.",
			},
			{
				title: "Your satisfaction",
				description:
					"The job is done when you’re happy with it. Not the moment I tick it off my list.",
			},
		],
		photoAlt: "Portrait of Michal Roučka",
	},
	contact: {
		title: "Contact",
		intro: "Write to me using the form below, or send me an email or give me a call. I’ll get back to you within two working days and we’ll set up a free consultation.",
		emailLabel: "Email",
		phoneLabel: "Phone",
		form: {
			name: "Name",
			email: "Email",
			phone: "Phone",
			phoneOptional: "(optional)",
			service: "Service",
			servicePlaceholder: "Select a service…",
			serviceOther: "Something else",
			message: "Message",
			honeypot: "Don’t fill in this field",
			submit: "Send",
			sending: "Sending…",
			success:
				"Thank you, your message is on its way. I’ll get back to you within two working days.",
			privacyBefore:
				"I only use the details from this form to reply to your message. More in the ",
			privacyLink: "privacy policy",
			privacyAfter: ".",
			noScript:
				"The form requires JavaScript, which is turned off in your browser. Please email me directly:",
			verificationUnavailable:
				"The spam protection could not be loaded (perhaps because of an ad blocker). Please email me directly:",
			errors: {
				required: "Please fill in this field.",
				invalidEmail: "Please enter a valid email address.",
				invalidPhone: "Please enter a valid phone number.",
				invalidService: "Please select a service.",
				tooLong: "The text is too long.",
				verificationFailed:
					"The verification has expired. Please try sending the form again.",
				unavailable:
					"Your message could not be sent. Please email me directly:",
			},
		},
	},
	languageSwitcher: {
		label: "Language",
	},
	notFound: {
		title: "Page not found",
		description: "Sorry, the page you are looking for doesn’t exist.",
		linkHome: "Return to home page",
	},
};
