if (typeof documentbundles === 'undefined') var documentbundles = {};

documentbundles.var = {
	serialPrintShellCommand: { //making use of core.var.selectedOs()
		win7: '"' + 'C:/Program Files/Adobe/Reader 11.0/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t',
		win10: '"' + 'C:/Program Files (x86)/Adobe/Reader 11.0/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t'
	},
	lang: {
		useCaseDescription: {
			en: 'Shown are all required documents. Process descriptions are applicable.',
			de: 'Es werden die erforderlichen Dokumente angezeigt. Übergeordnet gelten die einschlägigen Verfahrens- und Arbeitsanweisungen.'
		},
		serialPrintLink: {
			en: function (e) {
				return 'Print all documents but ' + e;
			},
			de: function (e) {
				return 'Alle Dokumente außer ' + e + ' drucken';
			}
		},
		primaryCaption: {
			en: 'Always to be delivered by reception',
			de: 'Immer vom Empfang auszuhändigen'
		},
		secondaryCaption: {
			en: 'To be taken into account if applicable',
			de: 'Falls zutreffend zusätzlich zu berücksichtigen'
		},
		selectDefault: {
			en: 'choose...',
			de: 'Auswahl treffen...'
		},
		selectEnableExceptions: {
			en: 'additional case', //change this caption to make sense for you
			de: 'zusätzliche Berücksichtigung'
		},
		errorNoActiveX: {
			en: 'Please reload application and allow ActiveX...',
			de: 'Bitte Oberfläche neu laden und ActiveX zulassen...'
		},
		additionalInfo: {
			en: 'Additional information: can be displayed here if neccessary',
			de: 'Zusatzinformation: können hier angegeben werden, falls erforderlich'
		},
	},
	disableOutputSelect: true,
};