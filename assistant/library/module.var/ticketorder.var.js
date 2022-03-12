ticketorder.var = {
	lang: {
		/////////////////////////////////////////////////////
		// erp chunks
		//////////////////////////////////////////////////////
		formErpInputPlaceholder: {
			en: 'ticket, order record or item description',
			de: 'Ticket, Belegnummer oder Artikelbeschreibung'
		},
		filterNofilter: {
			en: 'no filter',
			de: 'ungefiltert',
		},
		filterClosed: {
			en: 'closed',
			de: 'abgeschlossen',
		},
		filterOpen: {
			en: 'open',
			de: 'offen',
		},
		queryMailSubject: {
			en: 'Inquiry regarding order record ',
			de: 'Rückfrage Bestellung Beleg Nummer ',
		},

		/////////////////////////////////////////////////////
		// module chunks
		//////////////////////////////////////////////////////
		apiItemsFound: {
			en: ' tickets found',
			de: ' Tickets gefunden'
		},
		buttonTranslate: {
			en: 'date ticket',
			de: 'Ticket datieren',
		},
		buttonVerifyToken: {
			en: 'verify code',
			de: 'Code prüfen',
		},
		captionCheckTicket: {
			en: 'ticket',
			de: 'Ticket',
		},
		captionCheckCode: {
			en: 'code',
			de: 'Code',
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
			en: 'delete current order list',
			de: 'aktuelle Bestelliste löschen',
		},
		deleteCurrentOrderDeleted: {
			en: 'current order list deleted, reload module',
			de: 'aktuelle Bestelliste gelöscht, Modul neu laden',
		},
		failureCheckCode: {
			en: 'The code is invalid! Please contact the ordering person.',
			de: 'Der Code ist ungültig! Bitte kontaktiere den Besteller.',
		},
		formInputPlaceholder: {
			en: 'date ticket',
			de: 'Ticket datieren'
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
		orderConfirm: {
			en: 'approve order list',
			de: 'Bestellliste freigeben'
		},
		orderConfirmed: {
			en: function (args) {
				return 'Order with ticket ' + args[0] + ' approved by code ' + args[1];
			},
			de: function (args) {
				return 'Bestellung mit dem Ticket ' + args[0] + ' freigegeben mit Code ' + args[1];
			}
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
			en: 'add order',
			de: 'Bestellung hinzufügen'
		},
		orderStorageError: {
			en: 'Please split up order or excute current order list.',
			de: 'Bitte die Bestellung aufteilen oder zunächst aktuelle Gesamtbestellung auslösen.'
		},
		retour: {
			en: 'retour&sup2;',
			de: 'Rücksendung&sup2;'
		},
		service: {
			en: 'service / warranty&sup2;',
			de: 'Service / Garantie&sup2;'
		},
		successCheckCode: {
			en: 'This order was confirmed by ',
			de: 'Diese Bestellung wurde freigegeben von ',
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
		}
	},
	disableOutputSelect: true,
	inventoryControl: 'inventory.control@email.adr',
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
	filter: function () { //filters according to module.data/ticketorder.js
		//id:[select value, select text, filter for smartsearch]
		return {
			nofilter: ['nofilter', core.fn.static.lang('filterNofilter', 'ticketorder'), 'true'],
			closed: ['closed', core.fn.static.lang('filterClosed', 'ticketorder'), 'ticketorder.data.content[key][3]!=\'\''],
			open: ['open', core.fn.static.lang('filterOpen', 'ticketorder'), 'ticketorder.data.content[key][3]==\'\''],
		};
	},
};