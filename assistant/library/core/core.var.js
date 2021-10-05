if (typeof core === 'undefined') var core = {};

core.var = {
	modules: {
		//		module_file_name:{
		//			icon: svg-icon as string or using core icon function,
		//			display: {  en:"english caption",
		//						de:"german caption",
		//						extend languages as desired
		//			},
		//			enabledByDefault: boolean e.g. hiding for testing in production or modules of no general use
		//			wide: boolean to make the temp-container wide for content on mouseover
		//		},		
		documentlookup: {
			icon: core.fn.static.insert.icon('document'),
			display: {
				en: "Document Lookup",
				de: "Dokumentensuche",
			},
			enabledByDefault: true,
			wide: false,
		},
		documentbundles: {
			icon: core.fn.static.insert.icon('folder'),
			display: {
				en: "Document Bundles",
				de: "Dokumentenpakete"
			},
			enabledByDefault: true,
			wide: false,
		},
		stocklist: {
			icon: core.fn.static.insert.icon('shelf'),
			display: {
				en: "Stock List",
				de: "Lager- und Artikelliste"
			},
			enabledByDefault: true,
			wide: false,
		},
		ticketorder: {
			icon: core.fn.static.insert.icon('shoppingcart'),
			display: {
				en: "Orders",
				de: "Bestellungen"
			},
			enabledByDefault: true,
			wide: true,
		},
		timetable: {
			icon: core.fn.static.insert.icon('clock'),
			display: {
				en: "Timetable",
				de: "Arbeitszeittabelle"
			},
			enabledByDefault: true,
			wide: false,
		},
		correspondence: {
			icon: core.fn.static.insert.icon('mail'),
			display: {
				en: "Recommendation for Correspondence",
				de: "Textvorschläge für Korrespondenz"
			},
			enabledByDefault: true,
			wide: false,
		},
		mailtools: {
			icon: core.fn.static.insert.icon('batchmail'),
			display: {
				en: "Mail Tools",
				de: "eMail Tools"
			},
			enabledByDefault: true,
			wide: true,
		},
		auditplanner: {
			icon: core.fn.static.insert.icon('checklist'),
			display: {
				en: "Audit Planner",
				de: "Auditplaner"
			},
			enabledByDefault: true,
			wide: false,
		},
		help: {
			icon: core.fn.static.insert.icon('faq'),
			display: {
				en: "Help",
				de: "Hilfe"
			},
			enabledByDefault: true,
			wide: false,
		},
	},
	themes: {
		//		theme.css-filename: { en: 'english title', de: 'german title', extend languages as desired },
		default: {
			en: 'Default',
			de: 'Standard'
		},
		light: {
			en: 'Snow Storm',
			de: 'Schneesturm'
		},
		nord: {
			en: 'Polar Night',
			de: 'Polarnacht'
		},
		green: {
			en: 'Greenland',
			de: 'Grönland'
		},
		aurora: {
			en: 'Aurora',
			de: 'Aurora'
		},
		orange: {
			en: 'Reindeer',
			de: 'Rentier'
		},
		dark: {
			en: 'Deep Black',
			de: 'Tiefschwarz'
		},
		rose: {
			en: 'Rose',
			de: 'Rosé'
		},
	},
	// moduleDir path to modules
	moduleDir: root.dir + 'modules/',
	// moduleDataDir path to modules data files according to xlsm-files
	moduleDataDir: root.dir + 'library/module.data/',
	// moduleVarDir path to modules config files
	moduleVarDir: root.dir + 'library/module.var/',
	// this will be automatically set to the last loaded module
	currentScope: null,
	//	logo as shown in upper left corner
	logo: '<svg xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; transform:scale(1,-1);" class="icon" viewBox="0 0 2048 2048"><path d="M1024 2048l1024 -1024l-1024 -1024l-1024 1024zM768 437l256 -256l843 843l-843 843l-843 -843l459 -459v587h549l-210 211l90 90l365 -365l-365 -365l-90 90l210 211h-421v-587z" /></svg>',
	//	register all languages to be selectable within settings menu. if a language is not extended properly there might be object errors!
	registeredLanguages: {
		en: ["en", "english"],
		de: ["de", "deutsch"]
	},
	//	selected language with default value, will be occasionally overridden with asynchronous settings query on startup
	selectedLanguage: 'en',
	//  size for content of mails for mailto, browser dependent, can be set in advanced settings
	//  as of 2-2020 chrome, edge and ie11 support somewhere (but not exactly) up to 2^11 characters minus mailto:{xxx}?subject={xxx}&body=
	//  only firefox seemingly supports up to 2^15 characters (32768 - the afore mentioned)
	//  will be occasionally overridden with asynchronous settings query on startup
	directMailSize: 1900,
	//  generated content opens in new window, will be occasionally overridden with asynchronous settings query on startup
	copyFromNewWindow: false,
	//  will be occasionally overridden with asynchronous settings query on startup
	fuzzySearch: false,
	//	corporate design considerations for font. used for copied content. has to be installed on local machine
	corporateFontFace: 'Calibri',
	corporateFontSize: '10pt',
	letterTemplate: 'file:///E:/Quality Management/published/letter_template.docx', // if you want to use, else null
	outlookWebUrl: 'https://exc20/owa/auth/logon.aspx', //if you have it installed else null
	publishedFolder: 'file:///E:/Quality Management/published',

	eMailAddress: {
		inventorycontrol: {
			address: "inventory.control@yourcompany.tld",
			display: {
				en: "Inventory Control",
				de: "Einkauf"
			}
		},
		qmrepresentative: {
			address: "qmr@yourcompany.tld",
			display: {
				en: "Quality Management Representative",
				de: "QMB"
			}
		},
		prrc: {
			address: "prrc@yourcompany.tld",
			display: {
				en: "Person Responsible For Regulatory Compliance",
				de: "verantwortliche Person"
			}
		},
		deputyprrc: {
			address: "deputy.prrc@yourcompany.tld",
			display: {
				en: "Deputy Person Responsible For Regulatory Compliance",
				de: "stellvertretende verantwortliche Person"
			}
		},
		deputyqmrepresentative: {
			address: "deputy.qmr@yourcompany.tld",
			display: {
				en: "Deputy Quality Management Representative",
				de: "stellvertretender QMB"
			}
		},
		admin: { // extend items to display on the home-screen. better not delete this item.
			address: "admin@yourcompany.tld",
			display: {
				en: "QM-Assistant admin",
				de: "QM-Assistent Administrator"
			}
		}
	},

	//supported OSs
	oss: {
		win10k: 'Windows 10 Adobe Reader DC',
		win10: 'Windows 10 Adobe Reader XI',
		win7: 'Windows 7'
	},
	selectedOs: 'win10k',

	// permissions and data rights managament
	drm: {
		pwLength: {
			min: 5,
			max: 256
		},
		translate: {
			//translate permission levels according to xlsm-permission list / library/core/core.drm.js
			orderApproval: 'order approval',
			timetables: 'timetables'
		}
	},

	//text-blocks within the core file and reusable textblocks for modules
	lang: {
		buttonGenCaption: {
			en: 'generate / update',
			de: 'generieren / aktualisieren'
		},
		buttonGenTitle: {
			en: 'refresh output with given values',
			de: 'aktualisiere Ausgabe gemäß der gewählten Optionen'
		},
		buttonResetCaption: {
			en: 'reset',
			de: 'zurücksetzen'
		},
		buttonResetTitle: {
			en: 'resets all inputs to initial value',
			de: 'Setzt alle Eingaben auf Ursprungswert zurück'
		},
		copycontentNewWindowCaption: {
			en: 'Copy text, close window with left mouse button',
			de: 'Text kopieren, linke Maustaste schließt das Fenster wieder'
		},
		drmConfirmationError: {
			en: 'The entered values were invalid!',
			de: 'Es wurden unzureichende Angaben gemacht!'
		},
		drmConfirmationSubmit: {
			en: 'Approval',
			de: 'Freigabe'
		},
		errorLoadingModules: {
			en: 'Error loading modules...',
			de: 'Fehler beim Laden der Module...'
		},
		errorMailSizeExport: {
			en: function () {
				return 'The text exceeded the maximum length of ' + core.var.directMailSize + ' characters. Please copy from the assistants output. The browserspecific limit can be adjusted and testes in the advanced settings.'
			},
			de: function () {
				return 'Der Text überschreitet die maximal zulässige Menge von ' + core.var.directMailSize + ' Zeichen. Bitte kopiere den Inhalt aus dem Ausgabefenster des Assistenten. Die browserabhängige Größe kann bei den erweiterten Einstellungen geändert und getestet werden.'
			},
		},
		errorNoContent: {
			en: 'Well, <em>please</em> provide values...',
			de: 'Na, die Angaben müssen schon auch gemacht werden...'
		},
		errorNothingFound: {
			en: function (query) {
				return 'Search for <span class="highlight">' + query + '</span> returned no results. Check spelling ' + (core.var.fuzzySearch ? '' : 'or Fuzzy-Search-setting ') + 'or look for parts of query. Please adhere to mimimum 3 character length.'
			},
			de: function (query) {
				return 'Zum Begriff <span class="highlight">' + query + '</span> konnte nichts gefunden werden. Bitte eventuell Schreibweise ' + (core.var.fuzzySearch ? '' : 'oder Tippfehler-Toleranz-Einstellung ') + 'überprüfen oder nach Wortteilen suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
			},
		},
		errorSelectModules: {
			en: 'please choose category...',
			de: 'Bitte Kategorie wählen...'
		},
		errorStorageLimit: {
			en: 'Storing was not possible. The local storage limit for this application was exceeded.',
			de: 'Speichern nicht möglich. Der Speicherplatz für diese Anwendung ist erschöpft.'
		},
		formSubmit: {
			en: 'lookup',
			de: 'suchen'
		},
		globalSearchPlaceholder: {
			en: 'SEARCH ALL',
			de: 'ALLES DURCHSUCHEN'
		},
		greeting: {
			en: 'Welcome to the QM-Assistant. How can I help you?',
			de: 'Willkommen beim QM-Assistenten. Wobei kann ich unterstützen?'
		},
		homeMenuBack: {
			en: 'back',
			de: 'zurück'
		},
		homeMenuEntry: {
			en: 'Home',
			de: 'Start'
		},
		homeMenuFeedbackRequest: {
			en: 'feedback / request / support',
			de: 'Rückmeldung / Anfrage / Unterstützung'
		},
		homeMenuForth: {
			en: 'forward',
			de: 'vor'
		},
		homeMenuRestart: {
			en: 'restart',
			de: 'neu starten'
		},
		importantMails: {
			en: 'important eMail-addresses',
			de: 'wichtige eMail-Adressen'
		},
		itemResizeTitle: {
			en: 'expand / reduce',
			de: 'erweitern / verkleinern'
		},
		mailtoLimitBar: {
			en: 'indicates if the desired text size can be exported to email directly',
			de: 'zeigt an, ob die gewünschte Textlänge direkt in die eMail exportiert werden kann'
		},
		openLetterTemplate: {
			en: 'open letter template',
			de: 'Briefvorlage öffnen'
		},
		openLetterTemplateHint: {
			en: function () {
				return 'change font to ' + core.var.corporateFontFace + ', size ' + core.var.corporateFontSize;
			},
			de: function () {
				return 'Schriftart ggf zu ' + core.var.corporateFontFace + ', Schriftgröße ' + core.var.corporateFontSize + ' anpassen';
			}
		},
		openMailApp: {
			en: 'open mail app',
			de: 'eMail-Programm öffnen'
		},
		openOutlook: {
			en: 'open Outlook WebApp',
			de: 'Outlook WebApp öffnen'
		},
		openPublishedFolder: {
			en: 'open published folder directly',
			de: 'Dokumentenpfad direkt öffnen'
		},
		popupCloseButton: {
			en: 'close',
			de: 'schließen'
		},
		settingAdvancedCaption: {
			en: 'Advanced settings',
			de: 'Erweitert'
		},
		settingCopyOptionHint: {
			en: 'No need to adjust font. Left mouse button closes window.',
			de: 'Umgeht die Notwendigkeit die Schriftart anpassen zu müssen. Linke Maustaste schließt das Fenster.'
		},
		settingCopyOptionSelector: {
			en: 'Open contents to be copied in new window',
			de: 'Zu kopierende Inhalte in neuem Fenster öffnen'
		},
		settingDebugDumpCaption: {
			en: 'currently stored settings',
			de: 'aktuell gespeicherte Einstellungen'
		},
		settingDebugSpaceCaption: {
			en: 'Used storage space: ',
			de: 'Genutzter Speicherplatz: '
		},
		settingDeleteDistinctPlaceholder: {
			en: 'delete distinct settings, comma separated',
			de: 'Einstellungen gezielt löschen, kommagetrennt'
		},
		settingFontsizeCaption: {
			en: 'Font size',
			de: 'Schriftgröße'
		},
		settingFuzzyThresholdCaption: {
			en: 'Fuzzy threshold (5 is a reasonable default)',
			de: 'Schwellenwert für Tippfehler (5 ist ein guter Standard)'
		},
		settingGeneralHint: {
			en: 'Local security settings can result in loss of settings on closing browser window.',
			de: 'Lokale Sicherheitseinstellungen können dazu führen, dass beim Schließen des Browser-Fensters die Einstellungen verloren gehen.'
		},
		settinggrowlNotifIntervalCaption: {
			en: 'Seconds to show short information',
			de: 'Sekunden für Anzeige von Kurzinformationen'
		},
		settingKeyCaption: {
			en: 'Passwort construction',
			de: 'Kennwortanlage'
		},
		settingKeyError: {
			en: 'The entered values were invalid or the passwords did not match!',
			de: 'Es wurden unzureichende Angaben gemacht oder die Kennwörter stimmten nicht überein!'
		},
		settingKeyMailHeader: {
			en: 'Request to implement key to the data rights management',
			de: 'Bitte um Eintrag des Schlüssels in die Rechteverwaltung'
		},
		settingKeyName: {
			en: 'Name',
			de: 'Name'
		},
		settingKeyPassword0: {
			en: 'Password, number of characters ',
			de: 'Kennwort, Zeichenanzahl '
		},
		settingKeyPassword1: {
			en: 'Enter password again',
			de: 'Kennwort erneut eingeben'
		},
		settingKeyResult: {
			en: 'Send your encrypted key to administration for implementation. Your password is not visible.',
			de: 'Sende deinen Schlüssel an die Administration um ihn zu implementieren. Dein Kennwort ist nicht sichtbar.'
		},
		settingKeySubmit: {
			en: 'encrypt',
			de: 'verschlüsseln'
		},
		settingLanguageCaption: {
			en: 'Language',
			de: 'Sprache'
		},
		settingMainCaption: {
			en: 'Common settings',
			de: 'Allgemein'
		},
		settingMailDebugDump: {
			en: 'open mail to send settings',
			de: 'eMail öffnen um Einstellungen zu versenden'
		},
		settingMailSizeDeterminationCaption: {
			en: 'Browser dependent maximum size for direct email',
			de: 'Maximale browserabhängige Größe für Direkt-eMails',
		},
		settingMailSizeDeterminationCheck: {
			en: 'Verify size setting',
			de: 'Größeneinstellung auf Funktion prüfen',
		},
		settingMailSizeDeterminationHint: {
			en: 'If your browser supports the setting a mail will open without further use that can be closed afterwards. If not reduce the setting value and try again. Finally a restart of application is necessary. A possible overflow might make a restart of the browser necessary. Tested browsers support the closest smaller value to 2000, only Firefox is capable of almost up to 32500 characters.',
			de: 'Wenn der Browser die Einstellung unterstützt öffnet sich ein eMail-Fenster das keine weitere Verwendung hat und anschließend geschlossen werden kann. Ist dies nicht der Fall muss der Wert reduziert und erneut geprüft werden. Anschließen ist ein Neustart der Oberfläche erforderlich. Es kann zu einer Überforderung des Browsers kommen der seinen Neustart erfordert. Die gestesteten Browser unterstützen den nächstkleineren Wert zu 2000, nur Firefox schafft bis zu 35500 Zeichen.',
		},
		settingMenuEntry: {
			en: 'Settings',
			de: 'Einstellungen'
		},
		settingModuleselectorCaption: {
			en: 'Displayed modules',
			de: 'angezeigte Module'
		},
		settingNotificationHint: {
			en: 'New hints are shown on startup automatically. <a href="javascript:core.fn.popup(updateTracker.enlist());">Show all hints</a>',
			de: 'Neue Hinweise werden immer automatisch beim Start angezeigt. <a href="javascript:core.fn.popup(updateTracker.enlist());">Alle Hinweise anzeigen</a>'
		},
		settingNotificationSelector: {
			en: function () {
				return 'Hide hint #' + (updateTracker.latestMajorUpdate() + 1) + ' on startup';
			},
			de: function () {
				return 'Hinweis #' + (updateTracker.latestMajorUpdate() + 1) + ' beim Start verbergen';
			}
		},
		settingResetApp: {
			en: 'Reset application',
			de: 'Alle Einstellungen zurücksetzen'
		},
		settingRestartNeccessary: {
			en: 'restart of application neccessary',
			de: 'Neustart der Oberfläche erforderlich'
		},
		settingSearchOptionFuzzy: {
			en: 'Fuzzy-Search',
			de: 'Tippfehler-Toleranz'
		},
		settingSearchOptionFuzzyHint: {
			en: 'Includes possible typos, but gets a bigger sample size.',
			de: 'Berücksichtigt auch mögliche Tippfehler, führt aber zu größeren Ergebnismengen.'
		},
		settingSelectedOsCaption: {
			en: 'used environment',
			de: 'genutzte Betriebsumgebung'
		},
		settingThemeCaption: {
			en: 'Color-Theme',
			de: 'Farbschema'
		},
		title: {
			en: 'QM-Assistant',
			de: 'QM-Assistent'
		},
		webSearch: {
			en: 'web search',
			de: 'Internetsuche'
		},
		webSearchTitle: {
			en: 'search the web for the term',
			de: 'im Internet nach dem Begriff suchen'
		},
	},
};