if (typeof ticketorder === 'undefined') var ticketorder = {};

ticketorder.var = {
	lang: {
		formInputPlaceholder: {
			en: 'date ticket',
			de: 'Ticket datieren'
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
		orderer: {
			en: 'orderer',
			de: 'Besteller'
		},
		ordererDept: {
			en: 'select department',
			de: 'Bereich wählen'
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
		orderAdd: {
			en: 'add item',
			de: 'Artikel hinzufügen'
		},
		orderNote: {
			en: 'Additional note',
			de: 'Zusatzinformation',
		},
		orderSubmit: {
			en: 'prepare order',
			de: 'Bestellung vorbereiten'
		},
		missingFieldsPrompt: {
			en: 'Please provide all necessary information!',
			de: 'Bitte alle erforderlichen Felder ausfüllen!'
		},
		orderMailSubject: {
			en: 'Order by ',
			de: 'Bestellung von ',
		},
		retoureMailSubject: {
			en: 'Retoure related to ticket ',
			de: 'Retoure in Zusammenhang mit Ticket ',
		},
		ticketTranslate:{
			en: 'This ticket war generated on\n',
			de: 'Dieses Ticket wurde generiert am\n',
		},
		deleteCart:{
			en: 'delete shopping cart',
			de: 'Warenkorb löschen',
		},
		orderNumberWildcard:{
			en: 'One or more order numbers contains wildcards. Please specify model, size or type.',
			de: 'Eine oder mehrere Bestellnummern enhalten Platzhalter. Bitte Modell, Größe oder Typ konkretisieren.',
		},
	},
	searchTerms:{
		en: ['ticket','order'],
		de: ['Ticket','Bestellung']
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
		],
		de:[['Ticket', '10em'],
			['Lieferant', '15em'],
			['Artikelnummer', '15em'],
			['Artikelbezeichnung, Ausführung', '20em'],
			['Anzahl', '5em'],
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
	apiTranslate: {
		fieldCorrelation:{ // index of order fields in correlation to fiels in stock list
			1: 1,
			2: 3,
			3: 2,
		},
		orderNumberWildcard: '(X)', // if this is part of the item number
	},
};