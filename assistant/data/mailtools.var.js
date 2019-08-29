if (typeof mailtools == 'undefined') var mailtools = {};

mailtools.var = {
	lang: {
		selectSubmodule: {
			en: 'Please select Submodule',
			de: 'Bitte Funktion wählen'
		},
		errorMatchingRows: {
			en: 'The numbers of names and email-adresses don\'t match.',
			de: 'Die Anzahl der Namen und der eMailadressen stimmt nicht überein!'
		},
		buttonTestCaption: {
			en: 'sample entries',
			de: 'Testeinträge'
		},
		buttonTestTitle: {
			en: 'tests with samples',
			de: 'testet mit Standardwerten'
		},
		sampleNameValue: {
			en: 'Mrs. Doe\nMr. Doe',
			de: 'Frau Musterfrau\nHerr Mustermann'
		},
		sampleMailValue: {
			en: 'jane.doe@email.adr\njohn.doe@email.adr',
			de: 'monika.musterfrau@email.adr\nmax.mustermann@email.adr'
		},
		sampleSubjectValue: {
			en: 'Mail subject',
			de: 'Betreff der eMail'
		},
		sampleBodyValue: {
			en: 'This is a test mail.\n\nHave fun reading.',
			de: 'Die ist eine Test-Mail\n\nViel Spaß beim Lesen.'
		},
		formRecipientListCaption: {
			en: 'Recipient list',
			de: 'Empfängerliste'
		},
		formRecipientListPlaceholder: {
			en: 'names, 1 per row',
			de: 'Namen, 1 pro Zeile'
		},
		formRecipientMailPlaceholder: {
			en: 'adresses, 1 per row',
			de: 'Adressen, 1 pro Zeile'
		},
		formContentCaption: {
			en: 'Content',
			de: 'Inhalt'
		},
		formSubjectPlaceholder: {
			en: 'Subject',
			de: 'Betreff'
		},
		formBodyPlaceholder: {
			en: 'Text without salutation',
			de: 'Text ohne Anrede'
		},
		outputMailTo: {
			en: 'mail to',
			de: 'eMail an'
		},
		outputSalutation: {
			en: function (val) {
				return 'Dear';
			},
			de: function (val) {
				var greeting = 'Sehr geehrte';
				if (val.search('Herr') < 2 && val.search('Herr') > -1) greeting += "r";
				return greeting;
			}
		},
		errorMatchingRows: {
			en: 'The numbers of names and email-adresses doesn\'t match.',
			de: 'Die Anzahl der Namen und der eMailadressen stimmt nicht überein!'
		},
		buttonTestCaption: {
			en: 'sample entries',
			de: 'Testeinträge'
		},
		buttonTestTitle: {
			en: 'tests with samples',
			de: 'testet mit Standardwerten'
		},
		sampleNameValue: {
			en: 'Mrs. Doe\nMr. Doe',
			de: 'Frau Musterfrau\nHerr Mustermann'
		},
		sampleMailValue: {
			en: 'jane.doe@email.adr\njohn.doe@email.adr',
			de: 'monika.musterfrau@email.adr\nmax.mustermann@email.adr'
		},
		sampleSubjectValue: {
			en: 'Mail subject',
			de: 'Betreff der eMail'
		},
		sampleBodyValue: {
			en: 'This is a test mail.\n\nHave fun reading.',
			de: 'Die ist eine Test-Mail\n\nViel Spaß beim Lesen.'
		},
		formRecipientListCaption: {
			en: 'Recipient list',
			de: 'Empfängerliste'
		},
		formRecipientListPlaceholder: {
			en: 'names, 1 per row',
			de: 'Namen, 1 pro Zeile'
		},
		formRecipientMailPlaceholder: {
			en: 'adresses, 1 per row',
			de: 'Adressen, 1 pro Zeile'
		},
		formContentCaption: {
			en: 'Content',
			de: 'Inhalt'
		},
		formSubjectPlaceholder: {
			en: 'Subject',
			de: 'Betreff'
		},
		formBodyPlaceholder: {
			en: 'Text without salutation',
			de: 'Text ohne Anrede'
		},
		outputMailTo: {
			en: 'mail to',
			de: 'eMail an'
		},
		outputSalutation: {
			en: function (val) {
				return 'Dear';
			},
			de: function (val) {
				var greeting = 'Sehr geehrte';
				if (val.search('Herr') < 2 && val.search('Herr') > -1) greeting += "r";
				return greeting;
			}
		},
		notavailableFrom: {
			en: 'not available from',
			de: 'Nicht erreichbar vom'
		},
		notavailableTo: {
			en: 'until',
			de: 'bis'
		},
		notavailableDay: {
			en: function (day) {
				if (day == '11' || day == '12' || day == '13') return day + 'th';
				else if (day.substring(1) == '1') return day + 'st';
				else if (day.substring(1) == '2') return day + 'nd';
				else if (day.substring(1) == '3') return day + 'rd';
				else return day + 'th';
			},
			de: function (day) {
				return day;
			}
		},
		notavailableMonth: {
			en: function (month) {
				var m = new Array('', 'January', 'February', 'March', ' April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
				return m[month];
			},
			de: function (month) {
				var m = new Array('', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember');
				return m[month];
			}
		},
	},
	submodules: {
		serialmail: {
			en: 'Serialmail',
			de: 'Serienmail'
		},
		signature: {
			en: 'Signature Composer',
			de: 'Signaturgenerator'
		},
		notavailable: {
			en: 'Not Available Message',
			de: 'Abwesenheitsnotiz'
		},
	},
	disableOutputSelect: true,
};