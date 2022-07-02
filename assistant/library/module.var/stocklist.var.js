if (typeof ticketorder === 'undefined') var ticketorder = {};

stocklist.var = {
	lang: {
		apiItemsFound: {
			en: ' articles found',
			de: ' Artikel gefunden'
		},
		articleAdded: {
			en: 'Added to shopping cart',
			de: 'Zum Warenkorb hinzugefügt'
		},
		buttonTranslate: {
			en: 'date ticket',
			de: 'Ticket datieren',
		},
		captionCheckTicket: {
			en: 'ticket',
			de: 'Ticket',
		},
		commissioned: {
			en: 'commissioned order&sup1;',
			de: 'Kommissionsbestellung&sup1;'
		},
		currentCart: {
			en: 'items in cart: ',
			de: 'Artikel im Einkaufswagen: '
		},
		currentOrders: {
			en: 'orders for approval: ',
			de: 'Bestellungen zur Freigabe: '
		},
		deleteCart: {
			en: 'delete shopping cart',
			de: 'Warenkorb löschen',
		},
		deleteCartDeleted: {
			en: 'shopping cart deleted, reload module',
			de: 'Warenkorb gelöscht, Modul neu laden',
		},
		deleteCurrentOrder: {
			en: 'delete this order list',
			de: 'diese Bestellung löschen',
		},
		deleteCurrentOrderDeleted: {
			en: 'current order list deleted, reload module if necessary',
			de: 'aktuelle Bestelliste gelöscht, Modul ggf. neu laden',
		},
		deletionReminder: {
			en: 'don\'t forget to delete the order oder shopping cart after a successfull execution!',
			de: 'Vergiss nicht nach einer erfolgreichen Order die Bestellung oder den Warenkorb zu löschen!'
		},
		editOrder: {
			en: 'edit this order',
			de: 'diese Bestellung bearbeiten',
		},
		filterAll: {
			en: 'all items',
			de: 'alle Artikel'
		},
		filterClosed: {
			en: 'closed',
			de: 'abgeschlossen',
		},
		filterNofilter: {
			en: 'no filter',
			de: 'ungefiltert',
		},
		filterOpen: {
			en: 'open',
			de: 'offen',
		},
		filterStock: {
			en: 'in stock only',
			de: 'nur Lagerartikel'
		},
		formErpInputPlaceholder: {
			en: 'ticket, order record or item description',
			de: 'Ticket, Belegnummer oder Artikelbeschreibung'
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
		inputPlaceholder: {
			en: 'item, 3 characters minimum',
			de: 'Artikel (mindestens 3 Zeichen)'
		},
		newOrder: {
			en: 'New Order',
			de: 'Neue Bestellung'
		},
		notcommissioned: {
			en: 'plain order',
			de: 'Materialbestellung'
		},
		orderer: {
			en: 'orderer',
			de: 'Besteller'
		},
		orderAdd: {
			en: 'add item',
			de: 'Artikel hinzufügen'
		},
		orderBy: {
			en: 'by ',
			de: 'nach '
		},
		ordererContact: {
			en: 'call back eMail or number',
			de: 'eMail oder Telefon für Rückfragen'
		},
		ordererCostUnit: {
			en: 'cost unit',
			de: 'Kostenstelle'
		},
		ordererDept: {
			en: 'deliver to',
			de: 'Auslieferung an'
		},
		orderFormFile: {
			en: 'open order form',
			de: 'Bestellformular öffnen'
		},
		orderRcptDob: {
			en: 'Commission Birth of Date&sup1;',
			de: 'Kommission Geburtsdatum&sup1;'
		},
		orderRcptFlag: {
			en: 'Case number / approval notice&sup1;',
			de: 'Vorgangsnummer / Genehmigungsvermerk&sup1;',
		},
		orderRcptName: {
			en: 'Commission Name&sup1;',
			de: 'Kommission Name&sup1;'
		},
		orderReferralTicket: {
			en: 'referral / referral ticket&sup2;',
			de: 'Referenz / Referenzticket&sup2;'
		},
		orderMailSubject: {
			en: 'Order by ',
			de: 'Bestellung von ',
		},
		orderNeededBy: {
			en: 'delivery by',
			de: 'Lieferung bis'
		},
		orderNote: {
			en: 'Additional note',
			de: 'Zusatzinformation',
		},
		orderNumberWildcard: {
			en: 'One or more order numbers contains wildcards. Please specify model, size or type.',
			de: 'Eine oder mehrere Bestellnummern enhalten Platzhalter. Bitte Modell, Größe oder Typ konkretisieren.',
		},
		orderSubmit: {
			en: 'save order and proceed later',
			de: 'Bestellung speichern und später fortsetzen'
		},
		orderStorageError: {
			en: 'Please split up order or excute current orders.',
			de: 'Bitte die Bestellung aufteilen oder zunächst aktuelle Bestellungen auslösen.'
		},
		queryMailSubject: {
			en: 'Inquiry regarding order record ',
			de: 'Rückfrage Bestellung Beleg Nummer ',
		},
		retour: {
			en: 'retour&sup2;',
			de: 'Rücksendung&sup2;'
		},
		service: {
			en: 'service / warranty&sup2;',
			de: 'Service / Garantie&sup2;'
		},
		ticketorder: {
			en: 'trace orders',
			de: 'Bestellungen nachverfolgen'
		},
		ticketTranslate: {
			en: 'This ticket was most probably generated on\n',
			de: 'Dieses Ticket wurde wahrscheinlich generiert am\n',
		},
		ticketTranslateError: {
			en: 'This ticket can not be reverse translated.',
			de: 'Dieses Ticket kann nicht zurückübersetzt werden.',
		},
		tidyOrder: {
			en: 'display tidy order',
			de: 'ordentliche Bestellung anzeigen'
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
					'Artikel mit Bestellstop sind (vorbehaltlich der Aktualität der Liste) bereits herausgefiltert. ' +
					'<br /><br />' +
					'<ul>' +
					'<li><i>-Suchbegriff</i> filtert alles heraus, in denen dieser Begriff vorkommt z.B. &quot;Elektrode -Bock&quot;</li>' +
					'<li><i>+Suchbegriff</i> listet nur auf, wo alle Suchbegriffe vorkommen z.B. &quot;Elektrode +Bock&quot;</li>' +
					'<li>Suchbegriffe in Anführungszeichen werden nur in der exakten Reihenfolge gefunden.</li>' +
					'<li><i>?</i> und <i>*</i> schalten die Tippfehler-Toleranz ein auch wenn diese eigentlich deaktiviert ist.</li>' +
					'</ul>';
			}
		},
	},
	disableOutputSelect: true,
	orderFields: {
		// [description, displayed width (null if hidden), disabled:true, false, 2 for conditional]
		en: [
			['Quantity', '5em', false],
			['Unit', '5em', 2],
			['Id', null, true], // stocklist item id, no matter where but mandatory, will be contained in output
			['Distributor', '15em', 2],
			['Order number', '15em', 2],
			['Item description', '20em', 2],
		],
		de: [
			['Anzahl', '5em', false],
			['Einheit', '5em', 2],
			['Id', null, true], // stocklist item id, no matter where but mandatory, will be contained in output
			['Lieferant', '15em', 2],
			['Artikelnummer', '15em', 2],
			['Artikelbezeichnung, Ausführung', '20em', 2],
		],
	},
	orderFieldsToCopy: {
		en: ['Distributor', ],
		de: ['Lieferant', ],
	},
	orderFormFile: 'D:/Quality Management/published/Sample Form.pdf',
	orderDept: [
		'Common',
		'Office',
		'Workshop A',
		'Workshop B',
	],
	orderCostUnit: [
		'Common',
		'Office',
		'Workshop A',
		'Workshop B',
	],
	apiTranslate: {
		fieldCorrelation: { // index of order fields (see above) in correlation to fields in stocklist.data.js
			//0: NaN; would be quantity in this case which is not correlated to stocklist-data
			1: 5,
			2: 0,
			3: 1,
			4: 3,
			5: 2,
		},
		idField: function () {
			let stocklistIDColumn = 0;
			return ticketorder.var.orderFields[core.var.selectedLanguage][Object.keys(ticketorder.var.apiTranslate.fieldCorrelation).find(key => ticketorder.var.apiTranslate.fieldCorrelation[key] === stocklistIDColumn)][0];
		},
		orderNumberWildcard: '(X)', // if this (string) is part of the item number, else false
	},
	filter: {
		stocklist: function () { //filters according to stocklist.xls
			//id:[select value, select text, filter for smartsearch]
			return {
				all: ['all', core.fn.static.lang('filterAll', 'stocklist'), 'true'],
				conf: ['conf', core.fn.static.lang('filterReadymade', 'stocklist'), 'stocklist.data.content[key][6]==\'yes\''],
				nconf: ['nconf', core.fn.static.lang('filterNoReadymade', 'stocklist'), 'stocklist.data.content[key][6]==\'no\''],
				store: ['store', core.fn.static.lang('filterStock', 'stocklist'), 'stocklist.data.content[key][7]!=\'no\''],
			};
		},
		tickets: function () { //filters according to module.data/ticketorder.js
			//id:[select value, select text, filter for smartsearch]
			return {
				nofilter: ['nofilter', core.fn.static.lang('filterNofilter', 'ticketorder'), 'true'],
				closed: ['closed', core.fn.static.lang('filterClosed', 'ticketorder'), 'ticketorder.data.content[key][3]!=\'\''],
				open: ['open', core.fn.static.lang('filterOpen', 'ticketorder'), 'ticketorder.data.content[key][3]==\'\''],
			};
		},
	}
};