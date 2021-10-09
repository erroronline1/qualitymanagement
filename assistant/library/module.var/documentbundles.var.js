documentbundles.var = {
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
		additionalInfo: {
			en: 'Additional information:' +
				'<br /><br /><div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + 'Scans can not be inserted?<br />Serialprint issues?<ul>' +
				'<li>Scans have to have the PDF- oder JPG-format.</li>' +
				'<li>You\'ll probably have to set your environment within the Settings (...) -> Advanced ({ }).</li>' +
				'<li>You\'ll probably have to set Pop-Up permissions. All documents will be opened but unfortunately have to be printed manually.</li>' +
				'<li>Word might open files in read mode by default disabling automated print command. This behaviour has to be set within word itself.</li>' +
				'</ul></div>',
			de: 'Zusatzinformation:' +
				'<br /><br /><div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + 'Scans können nicht eingefügt werden?<br />Seriendruck nicht möglich?<ul>' +
				'<li>Scans müssen im Format PDF oder JPG gemacht werden.</li>' +
				'<li>Eventuell die Betriebsumgebung für die korrekte Acrobat-Reader-Version bei Einstellungen (...) -> Erweitert ({ }) anpassen.</li>' +
				'<li>Eventuell die Pop-Up berechtigungen erteilen einstellen. Es werden alle Dokumente geöffnet, müsen aber leider manuell gedruckt werden.</li>' +
				'<li>Word öffnet Datein möglicherweise im Lese-Modus wodurch die automatische Druckfunktion nicht funktioniert. Diese Einstellung muss in Word selbst angepasst werden.</li>' +
		'</ul></div>'
		},
	},
	disableOutputSelect: true,
};