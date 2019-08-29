if (typeof documentlookup == 'undefined') var documentlookup = {};

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
		favouriteDefaultTitle: {
			en: 'default values',
			de: 'Standardwerte'
		},
		favouriteRestoreTitle: {
			en: 'restore personal favourites',
			de: 'eigene Liste wiederherstellen'
		},
		favouriteSaveTitle: {
			en: 'save personal favourites',
			de: 'eigene Liste speichern'
		},
		favouriteRestoreConfirm: {
			en: 'please reload module',
			de: 'Modul bitte neu laden...'
		},
		favouriteSaveConfirm: {
			en: 'recent favourites saved.',
			de: 'neue Favoritenliste gespeichert.'
		},
		errorNothingFound: {
			en: function (query) {
				return 'Query for document searched by <span class="highlight">' + query + '</span> returned no results. Check spelling ' + (core.function.setting.get('settingFuzzySearch') ? '' : 'or fuzzy-search-setting ') + ', look for parts of query, in another document group or within record documents.  Please adhere to mimimum 3 character length.'
			},
			de: function (query) {
				return 'Es konnte kein Dokument mit dem Begriff <span class="highlight">' + query + '</span> gefunden werden. Bitte eventuell Schreibweise ' + (core.function.setting.get('settingFuzzySearch') ? '' : 'oder Fuzzy-Search-Einstellung ') + 'überprüfen, nach Wortteilen, in einer anderen Dokumengruppe oder bei den Nachweisdokumenten suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
			},
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
	defaultFavourites:	'Protocol,10,' +
						'AttendanceList,5,',
	selectedModule: function () {
		return (core.function.setting.get('lookup_bundle') || 'documentlookup_int');
	},
	selectedObject: function () {
		return eval(documentlookup.var.selectedModule() + '_data');
	},
	thirdDocumentCategoryPath: 'E:/Quality Management/TTD',
	disableOutputSelect: true,
};