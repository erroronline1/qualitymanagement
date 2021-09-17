if (typeof documentlookup === 'undefined') var documentlookup = {};

documentlookup.var = {
	lang: {
		optionThirdType: {
			en: 'record documents',
			de: 'Nachweisdokumente'
		},
		searchPlaceholder: {
			en: 'search documents',
			de: 'Dokumente durchsuchen'
		},
		searchTitle: {
			en: 'alternative terms: ',
			de: 'alternative Suchbegriffe: '
		},
		favouriteCaption: {
			en: 'last used documents',
			de: 'zuletzt genutzte Dokumente'
		},
		favouriteDeleteTitle: {
			en: 'delete favourites until next request',
			de: 'alle Favoriten bis zum nächsten Aufruf löschen'
		},
		favouriteRestoreConfirm: {
			en: 'Favourites deleted / reset. Reload module to refresh...',
			de: 'Favoriten wurden gelöscht / zurückgesetzt. Um die Anzeige zu aktualisieren bitte Modul neu starten...'
		},
		errorNothingFound: {
			en: function (query) {
				return 'Query for document searched by <span class="highlight">' + query + '</span> returned no results. Check spelling' + (core.fn.setting.get('coreFuzzySearch') ? '' : ' or Fuzzy-Search-setting ') + ', look for parts of query, in another document group or within <a href="file://' + documentlookup.var.thirdDocumentCategoryPath + '" target="thirdDocumentCategory">' + core.fn.lang('optionThirdType', 'documentlookup') + '</a>. Please adhere to mimimum 3 character length.'
			},
			de: function (query) {
				return 'Es konnte kein Dokument mit dem Begriff <span class="highlight">' + query + '</span> gefunden werden. Bitte eventuell Schreibweise' + (core.fn.setting.get('coreFuzzySearch') ? '' : ' oder Tippfehler-Toleranz-Einstellung') + ' überprüfen, nach Wortteilen, in einer anderen Dokumentengruppe oder bei den <a href="file://' + documentlookup.var.thirdDocumentCategoryPath + '" target="thirdDocumentCategory">' + core.fn.lang('optionThirdType', 'documentlookup') + 'n</a> suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
			},
		},
		generalThirdTypeHint: {
			en: function () {
				return 'Of course the requested document could be within the <a href="file://' + documentlookup.var.thirdDocumentCategoryPath + '" target="thirdDocumentCategory">' + core.fn.lang('optionThirdType', 'documentlookup') + '</a>.'
			},
			de: function () {
				return 'Das gesuchte Dokument könnte natürlich auch bei den <a href="file://' + documentlookup.var.thirdDocumentCategoryPath + '" target="thirdDocumentCategory">' + core.fn.lang('optionThirdType', 'documentlookup') + 'n</a> sein.'
			}
		},
	},
	submodules: {
		documentlookup_int: {
			en: 'internal documents',
			de: 'interne Dokumente'
		},
		documentlookup_ext: {
			en: 'external documents',
			de: 'externe Dokumente'
		},
		documentlookup_contract: {
			en: 'contracts',
			de: 'Verträge'
		},
	},
	//set default document titles without whitespaces and special characters, predefined clicks for higher postion 
	defaultFavourites: 'Protocol,10,' +
		'AttendanceList,5,',
	selectedModule: function () {
		return (core.fn.setting.get('lookup_bundle') || 'documentlookup_int');
	},
	selectedObject: function () {
		return eval(documentlookup.var.selectedModule() + '_data');
	},
	thirdDocumentCategoryPath: 'E:/Quality Management/TTD',
	disableOutputSelect: true,
};