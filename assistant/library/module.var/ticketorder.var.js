if (typeof ticketorder === 'undefined') var ticketorder = {};

ticketorder.var = {
	lang: {
		/////////////////////////////////////////////////////
		// erp chunks
		//////////////////////////////////////////////////////
		formErpInputPlaceholder: {
			en: 'ticket, order record or item description',
			de: 'Ticket, Belegnummer oder Artikelbeschreibung'
		},
		filterNofilter:{
			en:'no filter',
			de:'ungefiltert',
		},
		filterClosed:{
			en:'closed',
			de:'abgeschlossen',
		},
		filterOpen:{
			en:'open',
			de:'offen',
		},
		queryMailSubject: {
			en: 'Inquiry regarding order record ',
			de: 'Rückfrage Bestellung Beleg Nummer ',
		},

		/////////////////////////////////////////////////////
		// module chunks
		//////////////////////////////////////////////////////
		formInputPlaceholder: {
			en: 'date ticket',
			de: 'Ticket datieren'
		},
		buttonVerifyToken:{
			en:'verify code',
			de:'Code prüfen',
		},
		captionCheckTicket:{
			en:'ticket',
			de:'Ticket',
		},
		captionCheckCode:{
			en:'code',
			de:'Code',
		},
		successCheckCode:{
			en:'This order was confirmed by ',
			de:'Diese Bestellung wurde freigegeben von ',
		},
		failureCheckCode:{
			en:'The code is invalid! Please contact the ordering person.',
			de:'Der Code ist ungültig! Bitte kontaktiere den Besteller.',
		},
		buttonTranslate:{
			en:'date ticket',
			de:'Ticket datieren',
		},
		newOrder:{
			en: 'New Order',
			de: 'Neue Bestellung'
		},
		notcommissioned: {
			en: 'plain order',
			de: 'Materialbestellung'
		},
		commissioned: {
			en: 'commissioned order&sup1;',
			de: 'Kommissionsbestellung&sup1;'
		},
		retour: {
			en: 'retour&sup2;',
			de: 'Rücksendung&sup2;'
		},
		service: {
			en: 'service / warranty&sup2;',
			de: 'Service / Garantie&sup2;'
		},
		orderer: {
			en: 'orderer',
			de: 'Besteller'
		},
		ordererDept: {
			en: 'deliver to',
			de: 'Auslieferung an'
		},
		ordererCostUnit: {
			en: 'cost unit',
			de: 'Kostenstelle'
		},
		ordererContact: {
			en: 'call back eMail or number',
			de: 'eMail oder Telefon für Rückfragen'
		},
		orderRcptName: {
			en: 'Commission Name&sup1;',
			de: 'Kommission Name&sup1;'
		},
		orderRcptDob: {
			en: 'Commission Birth of Date&sup1;',
			de: 'Kommission Geburtsdatum&sup1;'
		},
		orderRcptFlag: {
			en: 'Case number / approval notice&sup1;',
			de: 'Vorgangsnummer / Genehmigungsvermerk&sup1;',
		},
		orderReferralTicket: {
			en: 'referral ticket&sup2;',
			de: 'Referenzticket&sup2;'
		},
		orderNeededBy: {
			en: 'delivery by',
			de: 'Lieferung bis'
		},
		orderAdd: {
			en: 'add item',
			de: 'Artikel hinzufügen'
		},
		orderNote: {
			en: 'Additional note',
			de: 'Zusatzinformation',
		},
		orderSubmit: {
			en: 'add order',
			de: 'Bestellung hinzufügen'
		},
		orderStorageError: {
			en: 'Please split up order or excute current order list.',
			de: 'Bitte die Bestellung aufteilen oder zunächst aktuelle Gesamtbestellung auslösen.'
		},
		orderConfirm: {
			en: 'approve order list',
			de: 'Bestellliste freigeben'
		},
		orderConfirmed:{
			en: function(args){return 'Order with ticket ' + args[0] + ' approved by code ' + args[1];},
			de: function(args){return 'Bestellung mit dem Ticket ' + args[0] + ' freigegeben mit Code ' + args[1];}
		},
		orderMailSubject: {
			en: 'Order by ',
			de: 'Bestellung von ',
		},
		ticketTranslate:{
			en: 'This ticket was most probably generated on\n',
			de: 'Dieses Ticket wurde wahrscheinlich generiert am\n',
		},
		ticketTranslateError:{
			en: 'This ticket can not be reverse translated.',
			de: 'Dieses Ticket kann nicht zurückübersetzt werden.',
		},
		deleteCart:{
			en: 'delete shopping cart',
			de: 'Warenkorb löschen',
		},
		deleteCartDeleted:{
			en: 'shopping cart deleted',
			de: 'Warenkorb gelöscht',
		},
		deleteCurrentOrder:{
			en: 'delete current order list',
			de: 'aktuelle Bestelliste löschen',
		},
		deleteCurrentOrderDeleted:{
			en: 'current order list deleted',
			de: 'aktuelle Bestelliste gelöscht',
		},
		orderNumberWildcard:{
			en: 'One or more order numbers contains wildcards. Please specify model, size or type.',
			de: 'Eine oder mehrere Bestellnummern enhalten Platzhalter. Bitte Modell, Größe oder Typ konkretisieren.',
		},
		apiItemsFound: {
			en: ' tickets found',
			de: ' Tickets gefunden'
		}
	},
	disableOutputSelect: true,
	inventoryControl: 'inventory.control@email.adr',
	orderFields: {
		// [description, displayed width]
		en:[['Ticket', '10em'],
			['Distributor', '15em'],
			['Order number', '15em'],
			['Item description', '20em'],
			['Quantity', '5em'],
			['Unit', '5em'],
		],
		de:[['Ticket', '10em'],
			['Lieferant', '15em'],
			['Artikelnummer', '15em'],
			['Artikelbezeichnung, Ausführung', '20em'],
			['Anzahl', '5em'],
			['Einheit', '5em'],
		],
	},
	orderFieldsToCopy: {
		en:['Distributor',
		],
		de:['Lieferant',
		],
	},
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
		fieldCorrelation:{ // index of order fields in correlation to fiels in stock list
			1: 1,
			2: 3,
			3: 2,
			5: 5,
		},
		orderNumberWildcard: '(X)', // if this (string) is part of the item number, else false
	},
	filter: function(){ //filters according to module.data/ticketorder.js
		//id:[select value, select text, filter for smartsearch]
		return {
			nofilter: ['nofilter', core.fn.lang('filterNofilter', 'ticketorder'), 'true'],
			closed: ['closed', core.fn.lang('filterClosed', 'ticketorder'), 'ticketorder_data.content[key][3]!=\'\''],
			open: ['open', core.fn.lang('filterOpen', 'ticketorder'), 'ticketorder_data.content[key][3]==\'\''],
		};
	},
};