regulatorytools.var = {
	lang: {
		tableOfContents: {
			en: 'available topics',
			de: 'Verfügbare Themen'
		},
		buttonAllTitle: {
			en: 'select all topics',
			de: 'alle Themen wählen'
		},
		buttonNoneTitle: {
			en: 'select no topics',
			de: 'keine Themen wählen'
		},
		buttonFilter:{
			en: 'filter by term',
			de: 'nach Suchbegriff filtern'
		},
		buttonShuffleTitle: {
			en: 'select random topics',
			de: 'zufällige Themen wählen'
		},
		inputFilter:{
			en: 'term',
			de: 'Begriff'
		},
		imdrfurl:{
			en: 'IMDRF Annexes source',
			de: 'IMDRF Annexes Quelle'
		},
		imdrfscraping: {
			en: 'IMDRF Annexes are loading fresh from the source. Stand by...',
			de: 'IMDRF Annexes werden frisch von der Quelle geladen. Bitte warten...'
		},
		selectOptionQuestion: {
			en: 'question',
			de: 'Frage'
		},
		selectOptionQuestions: {
			en: 'questions',
			de: 'Fragen'
		},
		selectOptionAll: {
			en: 'all questions',
			de: 'alle Fragen'
		},
		selectTopic: {
			en: 'select topic',
			de: 'Thema wählen'
		}
	},
	disableOutputSelect: false,
	maximumAuditQuestions: 8,
	submodules: {
		auditplanner: {
			en: 'Audit Planner',
			de: 'Auditplaner'
		},
		imdrf: {
			en: 'IMDRF',
			de: 'IMDRF'
		},
	},
	imdrfURL: "https://www.imdrf.org/documents/terminologies-categorized-adverse-event-reporting-aer-terms-terminology-and-codes",
	imdrfCurrentSectionPattern: /layout layout--content-sidebar container(.*?)layout section-layout--accordion layout--accordion/gis,
	imdrfPattern: /https:\/\/www.imdrf.org\/sites\/default\/files\/[\d\-]+?\/annex[a-g].+?.json/gis,
	imdrfAnnexes: ["a", "b", "c", "d", "e", "f", "g"]
};