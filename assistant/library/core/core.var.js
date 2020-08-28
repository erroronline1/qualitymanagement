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
			icon: core.fn.insert.icon('document'),
			display: {
				en: "Document Lookup",
				de: "Dokumentensuche",
			},
			enabledByDefault: true,
			wide: false,
		},
		documentbundles: {
			icon: core.fn.insert.icon('folder'),
			display: {
				en: "Document Bundles",
				de: "Dokumentenpakete"
			},
			enabledByDefault: true,
			wide: false,
		},
		stocklist: {
			icon: core.fn.insert.icon('shelf'),
			display: {
				en: "Stock List",
				de: "Lager- und Artikelliste"
			},
			enabledByDefault: true,
			wide: false,
		},
		ticketorder: {
			icon: core.fn.insert.icon('shoppingcart'),
			display: {
				en: "Orders",
				de: "Bestellungen"
			},
			enabledByDefault: true,
			wide: true,
		},
		timetable: {
			icon: core.fn.insert.icon('clock'),
			display: {
				en: "Timetable",
				de: "Arbeitszeittabelle"
			},
			enabledByDefault: true,
			wide: false,
		},
		correspondence: {
			icon: core.fn.insert.icon('mail'),
			display: {
				en: "Recommendation for Correspondence",
			enabledByDefault: true,
				de: "Textvorschläge für Korrespondenz"
			},
			enabledByDefault: true,
			wide: false,
		},
		mailtools: {
			icon: core.fn.insert.icon('batchmail'),
			display: {
				en: "Mail Tools",
				de: "eMail Tools"
			},
			enabledByDefault: true,
			wide: false,
		},
		auditplanner:{
			icon:core.fn.insert.icon('checklist'),
            display: {	en:"Audit Planner",
						de:"Auditplaner"
			},
			enabledByDefault: true,
			wide: false,
		},
		help: {
			icon: core.fn.insert.icon('faq'),
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
	//	rootdir in case different handling of source files is necessary over developement and production sites
	coreRootDir: location.pathname.substring(1, location.pathname.lastIndexOf('/')).replace(/%20/g, " ") + '/',
	// moduleDataDir path to modules data files according to xlsm-files
	moduleDataDir: 'library/module.data/',
	// moduleVarDir path to modules config files
	moduleVarDir: 'library/module.var/',
	// this will be automatically set to the last loaded module
	currentScope: null,
	//	logo as shown in upper left corner
	logo: '<svg xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; transform:scale(1,-1);" class="icon" viewBox="0 0 2048 2048"><path d="M1024 2048l1024 -1024l-1024 -1024l-1024 1024zM768 437l256 -256l843 843l-843 843l-843 -843l459 -459v587h549l-210 211l90 90l365 -365l-365 -365l-90 90l210 211h-421v-587z" /></svg>',
	//	register all languages to be selectable within settings menu. if a language is not extended properly there might be object errors!
	registeredLanguages: {
		en: ["en", "english"],
		de: ["de", "deutsch"]
	},
	//	selected language in settings or desired default fallback
	selectedLanguage: (core.fn.setting.get('settingLanguage') || 'en'),
	//  size for content of mails for mailto, browser dependent, can be set in advanced settings
	//  as of 2-2020 chrome, edge and ie11 support somewhere (but not exactly) up to 2^11 characters minus mailto:{xxx}?subject={xxx}&body=
	//  only firefox seemingly supports up to 2^15 characters (32768 - the afore mentioned)
	directMailSize: (core.fn.setting.get('settingDirectMailSize') || 1900),
	//	mail for error reporting or feature request as shown in settings
	adminMail: 'your@email.adr',
	//	corporate design considerations for font. used for copied content. has to be installed on local machine
	corporateFontFace: 'Calibri',
	corporateFontSize: '10pt',
	letterTemplate: 'file:///E:/Quality Management/published/letter_template.docx', // if you want to use, else null
	outlookWebUrl: 'https://exc20/owa/auth/logon.aspx', //if you have it installed else null
	publishedFolder: 'file:///E:/Quality Management/published',

	//supported OSs
	oss:{
		win7: 'Windows 7',
		win10: 'Windows 10'
	},
	selectedOs:function (){return core.fn.setting.get('settingSelectedOs') || 'win7';},
	
	// permissions and data rights managament
	drm:{
		pwLength: {
			min: 5,
			max: 256
		},
		translate:{
			//translate permission levels according to xlsm-permission list / library/core/core.drm.js
			orderApproval: 'order approval',
			timetables: 'timetables'
		}
	},
	
	//text-blocks within the core file and reusable textblocks for modules
	lang: {
		title: {
			en: 'QM-Assistant',
			de: 'QM-Assistent'
		},
		greeting: {
			en: 'Welcome to the QM-Assistant. How can I help you?',
			de: 'Willkommen beim QM-Assistenten. Wobei kann ich unterstützen?'
		},
		globalSearchPlaceholder: {
			en: 'SEARCH ALL',
			de: 'ALLES DURCHSUCHEN'
		},
		copycontentNewWindowCaption: {
			en: 'Copy text, close window with left mouse button',
			de: 'Text kopieren, linke Maustaste schließt das Fenster wieder'
		},
		mailtoLimitBar: {
			en: 'indicates if the desired text size can be exported to email directly',
			de: 'zeigt an, ob die gewünschte Textlänge direkt in die eMail exportiert werden kann'
		},
		popupCloseButton: {
			en: 'close',
			de: 'schließen'
		},
		itemResizeTitle: {
			en: 'expand / reduce',
			de: 'erweitern / verkleinern'
		},
		settingMenuEntry: {
			en: 'Settings',
			de: 'Einstellungen'
		},
		settingModuleselectorCaption: {
			en: 'Displayed modules',
			de: 'angezeigte Module'
		},
		settingKeyCaption: {
			en: 'Passwort construction',
			de: 'Kennwortanlage'
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
		settingKeySubmit: {
			en: 'encrypt',
			de: 'verschlüsseln'
		},
		settingKeyError: {
			en: 'The entered values were invalid or the passwords did not match!',
			de: 'Es wurden unzureichende Angaben gemacht oder die Kennwörter stimmten nicht überein!'
		},
		settingKeyResult: {
			en: 'Send your encrypted key to administration for implementation. Your password is not visible.',
			de: 'Sende deinen Schlüssel an die Administration um ihn zu implementieren. Dein Kennwort ist nicht sichtbar.'
		},
		settingKeyMailHeader: {
			en: 'Request to implement key to the data rights management',
			de: 'Bitte um Eintrag des Schlüssels in die Rechteverwaltung'
		},
		settingMainCaption: {
			en: 'Common settings',
			de: 'Allgemein'
		},
		settingAdvancedCaption: {
			en: 'Advanced settings',
			de: 'Erweitert'
		},
		settingThemeCaption: {
			en: 'Color-Theme',
			de: 'Farbschema'
		},
		settingMenusizeCaption: {
			en: 'Menu size',
			de: 'Menügröße'
		},
		settingMenusizeSelector: {
			en: 'always small',
			de: 'immer schmal'
		},
		settingFontsizeCaption: {
			en: 'Font size',
			de: 'Schriftgröße'
		},
		settingLanguageCaption: {
			en: 'Language',
			de: 'Sprache'
		},
		settingSearchOptionFuzzy: {
			en: 'Fuzzy-Search',
			de: 'Tippfehler-Toleranz'
		},
		settingSearchOptionFuzzyHint: {
			en: 'Includes possible typos, but gets a bigger sample size.',
			de: 'Berücksichtigt auch mögliche Tippfehler, führt aber zu größeren Ergebnismengen.'
		},
		settingCopyOptionSelector: {
			en: 'Open contents to be copied in new window',
			de: 'Zu kopierende Inhalte in neuem Fenster öffnen'
		},
		settingCopyOptionHint: {
			en: 'No need to adjust font. Left mouse button closes window.',
			de: 'Umgeht die Notwendigkeit die Schriftart anpassen zu müssen. Linke Maustaste schließt das Fenster.'
		},
		settingNotificationSelector: {
			en: function () {
				return 'Hide hint #' + (updateTracker.latestMajorUpdate() + 1) + ' on startup';
			},
			de: function () {
				return 'Hinweis #' + (updateTracker.latestMajorUpdate() + 1) + ' beim Start verbergen';
			}
		},
		settingNotificationHint: {
			en: 'New hints are shown on startup automatically. <a href="javascript:core.fn.popup(updateTracker.enlist());">Show all hints</a>',
			de: 'Neue Hinweise werden immer automatisch beim Start angezeigt. <a href="javascript:core.fn.popup(updateTracker.enlist());">Alle Hinweise anzeigen</a>'
		},

		settingResetApp: {
			en: 'Reset application',
			de: 'Alle Einstellungen zurücksetzen'
		},
		settingSelectedOsCaption: {
			en: 'used environment',
			de: 'genutzte Betriebsumgebung'
		},
		settingFuzzyThresholdCaption: {
			en: 'Fuzzy threshold (5 is a reasonable default)',
			de: 'Schwellenwert für Tippfehler (5 ist ein guter Standard)'
		},
		settingGlobalSearchCaption: {
			en: 'Seconds to deliver global search results',
			de: 'Sekunden für die Bereitstellung von globalen Suchergebnissen'
		},
		settingVarPreloadCaption: {
			en: 'Delay between loading modules data and functions in milliseconds (Edge)',
			de: 'Millisekunden Ladeverzögerung zwischen Moduldaten und -funktionen (Edge)'
		},
		settingMailSizeDeterminationCaption:{
			en: 'Browser dependent maximum size for direct email',
			de: 'Maximale Browserabhängige Größe für Direkt-eMails',
		},
		settingMailSizeDeterminationCheck:{
			en: 'Verify size setting',
			de: 'Größeneinstellung auf Funktion prüfen',
		},
		settingMailSizeDeterminationHint:{
			en: 'If your browser supports the setting a mail will open without further use that can be closed afterwards. If not reduce the setting value and try again. Finally a restart of application is necessary. A possible overflow might make a restart of the browser necessary. Tested browsers support the closest smaller value to 2000, only Firefox is capable of almost up to 32500 characters.',
			de: 'Wenn der Browser die Einstellung unterstützt öffnet sich ein eMail-Fenster das keine weitere Verwendung hat und anschließend geschlossen werden kann. Ist dies nicht der Fall muss der Wert reduziert und erneut geprüft werden. Anschließen ist ein Neustart der Oberfläche erforderlich. Es kann zu einer Überforderung des Browsers kommen der seinen Neustart erfordert. Die gestesteten Browser unterstützen den nächstkleineren Wert zu 2000, nur Firefox schafft bis zu 35500 Zeichen.',
		},
		settingMailtoMethod:{
			en: 'Open email in Chromium Edge and other browsers',
			de: 'eMails öffnen in Chromium Edge und anderen Browsern'
		},
		settingMailtoMethodHint:{
			en: 'Does not work with Windows 7.',
			de: 'Funktioniert nicht unter Windows 7.'
		},

		settingDebugSpaceCaption:{
			en: 'Available storage space: ',
			de: 'Verfügbarer Speicherplatz: '
		},
		settingDebugDumpCaption:{
			en: 'currently stored settings',
			de: 'aktuell gespeicherte Einstellungen'
		},
		settingDeleteDistinctPlaceholder:{
			en: 'delete distinct settings, csv',
			de: 'Einstellungen gezielt löschen, kommagetrennt'
		},
		settingMailDebugDump:{
			en: 'open mail to send settings',
			de: 'eMail öffnen um Einstellungen zu versenden'
		},

		settingGeneralHint: {
			en: 'Local security settings can result in loss of settings on closing browser window.',
			de: 'Lokale Sicherheitseinstellungen können dazu führen, dass beim Schließen des Browser-Fensters die Einstellungen verloren gehen.'
		},
		settingRestartNeccessary: {
			en: 'restart of application neccessary',
			de: 'Neustart der Oberfläche erforderlich'
		},

		errorLoadingModules: {
			en: 'Error loading modules...',
			de: 'Fehler beim Laden der Module...'
		},
		errorSelectModules: {
			en: 'please choose category...',
			de: 'Bitte Kategorie wählen...'
		},
		errorNoContent: {
			en: 'Well, <em>please</em> provide values...',
			de: 'Na, die Angaben müssen schon auch gemacht werden...'
		},
		errorNothingFound: {
			en: function (query) {
				return 'Search for <span class="highlight">' + query + '</span> returned no results. Check spelling ' + (core.fn.setting.get('settingFuzzySearch') ? '' : 'or Fuzzy-Search-setting ') + 'or look for parts of query. Please adhere to mimimum 3 character length.'
			},
			de: function (query) {
				return 'Zum Begriff <span class="highlight">' + query + '</span> konnte nichts gefunden werden. Bitte eventuell Schreibweise ' + (core.fn.setting.get('settingFuzzySearch') ? '' : 'oder Tippfehler-Toleranz-Einstellung ') + 'überprüfen oder nach Wortteilen suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
			},
		},
		errorMailSizeExport: {
			en: function () {
				return 'The text exceeded the maximum length of ' + core.var.directMailSize + ' characters. Please copy from the assistants output. The browserspecific limit can be adjusted and testes in the advanced settings.'
			},
			de: function () {
				return 'Der Text überschreitet die maximal zulässige Menge von ' + core.var.directMailSize + ' Zeichen. Bitte kopiere den Inhalt aus dem Ausgabefenster des Assistenten. Die browserabhängige Größe kann bei den erweiterten Einstellungen geändert und getestet werden.'
			},
		},
		errorStorageLimit: {
			en: 'Storing was not possible. The local storage limit for this application was exceeded.',
			de: 'Speichern nicht möglich. Der Speicherplatz für diese Anwendung ist erschöpft.'
		},
		
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
		formSubmit: {
			en: 'lookup',
			de: 'suchen'
		},
		webSearch: {
			en: 'web search',
			de: 'Internetsuche'
		},
		webSearchTitle: {
			en: 'search the web for the term',
			de: 'im Internet nach dem Begriff suchen'
		},
		openOutlook: {
			en: 'open Outlook WebApp',
			de: 'Outlook WebApp öffnen'
		},
		openMailApp: {
			en: 'open mail app',
			de: 'eMail-Programm öffnen'
		},
		openPublishedFolder: {
			en: 'open published folder directly',
			de: 'Dokumentenpfad direkt öffnen'
		},
		openLetterTemplate: {
			en: 'open letter tempate',
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
		homeMenuEntry: {
			en: 'Home',
			de: 'Start'
		},
		homeMenuBack: {
			en: 'back',
			de: 'zurück'
		},
		homeMenuForth: {
			en: 'forward',
			de: 'vor'
		},
		homeMenuRestart: {
			en: 'restart',
			de: 'neu starten'
		},
		homeMenuFeedbackRequest: {
			en: 'feedback / request',
			de: 'Rückmeldung / Anfrage'
		},
	},
};