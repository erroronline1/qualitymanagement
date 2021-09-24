if (typeof documentbundles === 'undefined') var documentbundles = {};

documentbundles.var = {
	serialPrintShellCommand: { //making use of core.var.selectedOs()
		win7: {
			pdf: '"' + 'C:/Program Files/Adobe/Reader 11.0/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t',
			docm: ''
		},
		win10: {
			pdf: '"' + 'C:/Program Files (x86)/Adobe/Reader 11.0/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t',
			docm: '"' + 'C:/Program Files (x86)/Microsoft Office/root/Office16/WINWORD.EXE'.replace(/\//g, '\\') + '" /q /n /mFilePrintDefault /mFileExit'
		},
		win10k: {
			pdf: '"' + 'C:/Program Files (x86)/Adobe/Acrobat Reader DC/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t',
			docm: '"' + 'C:/Program Files (x86)/Microsoft Office/root/Office16/WINWORD.EXE'.replace(/\//g, '\\') + '" /q /n /mFilePrintDefault /mFileExit'
		}
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
			en: 'Additional information:' +
				'<br /><br /><div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + 'Scans can not be inserted?<br />Serialprint issues?<br />ActiveX-error?<ul>' +
				'<li>Scans have to have the PDF- oder JPG-format.</li>' +
				'<li>You\'ll probably have to set the correct Acrobat-Reader Version within the Setings (...) -> Advanced ({ }).</li>' +
				'<li>You\'ll probably have to set Pop-Up permissions (for all browsers but Internet Explorer). All documents will be opened but unfortunately have to be printed manually.</li>' +
				'<li>You\'ll probably have to set the ActiveX-Settings to <em>allow</em> or <em>ask</em> for Internet Explorer</li>' +
				'</ul></div>',
			de: 'Zusatzinformation:' +
				'<br /><br /><div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + 'Scans können nicht eingefügt werden?<br />Seriendruck nicht möglich?<br />ActiveX-Fehler?<ul>' +
				'<li>Scans müssen im Format PDF oder JPG gemacht werden.</li>' +
				'<li>Eventuell die Betriebsumgebung für die korrekte Acrobat-Reader-Version bei Einstellungen (...) -> Erweitert ({ }) anpassen.</li>' +
				'<li>Eventuell die Pop-Up berechtigungen erteilen (für Browser außer Internetexplorer) einstellen. Es werden alle Dokumente geöffnet, müsen aber leider manuell gedruckt werden.</li>' +
				'<li>Eventuell die ActiveX-Einstellungen des Internet-Explorers einstellen: Zahnrad oben rechts -> Internetoptionen -> Sicherheit -> Stufe anpassen -> ActiveX-Steuerelemente ausführen... alle aktivieren oder bestätigen</li>' +
				'</ul></div>'
		},
	},
	disableOutputSelect: true,
};