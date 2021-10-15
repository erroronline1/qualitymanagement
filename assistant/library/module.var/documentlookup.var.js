documentlookup.var = {
	lang: {
		errorNothingFound: {
			en: function (query) {
				return 'Query for document searched by <span class="highlight">' + query + '</span> returned no results. Check spelling' + (core.var.fuzzySearch ? '' : ' or Fuzzy-Search-setting ') + ', look for parts of query or in another document group. Please adhere to mimimum 3 character length.'
			},
			de: function (query) {
				return 'Es konnte kein Dokument mit dem Begriff <span class="highlight">' + query + '</span> gefunden werden. Bitte eventuell Schreibweise' + (core.var.fuzzySearch ? '' : ' oder Tippfehler-Toleranz-Einstellung') + ' überprüfen, nach Wortteilen oder in einer anderen Dokumentengruppe suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
			},
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
		filterNone: {
			en: 'all documents',
			de: 'alle Dokumente'
		},
		openDir: {
			en: 'open directory for ',
			de: 'Dateispeicherort öffnen für ',
		},
		searchPlaceholder: {
			en: 'search documents',
			de: 'Dokumente durchsuchen'
		},
		searchTitle: {
			en: 'alternative terms: ',
			de: 'alternative Suchbegriffe: '
		},
	},
	lists: [
		core.var.moduleDataDir + 'documentlookup.data.int.js',
		core.var.moduleDataDir + 'documentlookup.data.ext.js',
		core.var.moduleDataDir + 'documentlookup.data.contract.js'
	],
	dirs: [{
		id: 'dir1',
		path: 'E:/Quality Management/someRandomDirectory',
		en: 'record documents',
		de: 'Nachweisdokumente'
	}],
	disableOutputSelect: true,
};