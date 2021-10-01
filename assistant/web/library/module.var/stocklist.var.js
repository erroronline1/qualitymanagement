stocklist.var = {
	filter: function () { //filters according to stocklist.xls
		//id:[select value, select text, filter for smartsearch]
		return {
			all: ['all', core.fn.static.lang('filterAll', 'stocklist'), 'true'],
			conf: ['conf', core.fn.static.lang('filterReadymade', 'stocklist'), 'stocklist.data.content[key][6]==\'yes\''],
			nconf: ['nconf', core.fn.static.lang('filterNoReadymade', 'stocklist'), 'stocklist.data.content[key][6]==\'no\''],
			store: ['store', core.fn.static.lang('filterStock', 'stocklist'), 'stocklist.data.content[key][7]!=\'no\''],
		};
	},
	lang: {
		inputPlaceholder: {
			en: 'item, 3 characters minimum',
			de: 'Artikel (mindestens 3 Zeichen)'
		},
		useCaseDescription: {
			en: function () {
				return (stocklist.temp.overallItems != undefined ? 'There are currently ' + stocklist.temp.overallItems + ' items listed' +
						(stocklist.data.modified != undefined ? ' (as of ' + stocklist.data.modified + ')' : '') + '. ' : '') +
					'These are the products that have permission to be ordered and used in production. Search for default items by &quot;manufacturer&quot and mess around with search terms.';
			},
			de: function () {
				return (stocklist.temp.overallItems != undefined ? 'Aktuell hat die Artikelliste ' + stocklist.temp.overallItems + ' Einträge' +
						(stocklist.data.modified != undefined ? ' (Stand ' + stocklist.data.modified + ')' : '') + '. ' : '') +
					'An dieser Stelle könne alle zugelassenen Artikel eingesehen werden. Suche nach Standardeinträgen von &quot;Manufacturer&quot; und spiel mit Suchbegriffen.';
			}
		},
		filterAll: {
			en: 'all items',
			de: 'alle Artikel'
		},
		filterReadymade: {
			en: 'ready-made aids only',
			de: 'nur Konfektionsartikel'
		},
		filterNoReadymade: {
			en: 'all but ready-made aids',
			de: 'keine Konfektionsartikel'
		},
		filterStock: {
			en: 'in stock only',
			de: 'nur Lagerartikel'
		},
		helpChangeItemCaption: {
			en: 'change',
			de: 'ändern'
		},
		helpChangeItemTitle: {
			en: 'request change at inventory control',
			de: 'Änderung beim Einkauf beantragen'
		},
		helpChangeItemPopup: {
			en: 'please specify\\ne.g \\\'item name spelled wrong\\\'',
			de: 'Bitte Änderung erläutern\\nz.B. \\\'Artikelname falsch\\\''
		},
		helpChangeItemSubject: {
			en: 'Change item in stock list',
			de: 'Artikel im Artikelstamm ändern'
		},
		helpDeleteItemCaption: {
			en: 'delete',
			de: 'löschen'
		},
		helpDeleteItemTitle: {
			en: 'request deletion at intentory control',
			de: 'Löschung beim Einkauf beantragen'
		},
		helpDeleteItemPopup: {
			en: 'Please specify\\ne.g. \\\'no longer available\\\'',
			de: 'Bitte Löschung erläutern\\nz.B. \\\'Aus dem Programm genommen\\\''
		},
		helpDeleteItemSubject: {
			en: 'Delete item from stock list',
			de: 'Artikel aus dem Artikelstamm löschen'
		},
		apiItemsFound: {
			en: ' articles found',
			de: ' Artikel gefunden'
		},
		orderBy: {
			en: 'by ',
			de: 'nach '
		},
		articleAdded: {
			en: 'Added to shopping cart',
			de: 'Zum Warenkorb hinzugefügt'
		}
	},
	disableOutputSelect: true,
};