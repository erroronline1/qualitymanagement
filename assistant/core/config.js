core.var = {
	modules: {
		//		module_file_name:{
		//			icon: svg-icon as string or using core icon function,
		//			display: {  en:"english caption",
		//						de:"german caption",
		//						extend languages as desired
		//			}
		//		},		
		documentlookup: {
			icon: core.function.icon.insert('document'),
			display: {
				en: "Document Lookup",
				de: "Dokumentensuche",
			}
		},
		documentbundles: {
			icon: core.function.icon.insert('folder'),
			display: {
				en: "Document Bundles",
				de: "Dokumentenpakete"
			}
		},
		stocklist: {
			icon: core.function.icon.insert('shoppingcart'),
			display: {
				en: "Stock List",
				de: "Lager- und Artikelliste"
			}
		},
		correspondence: {
			icon: core.function.icon.insert('mail'),
			display: {
				en: "Recommended Words for Correspondence",
				de: "Textvorschläge für Korrespondenz"
			}
		},
		mailtools: {
			icon: core.function.icon.insert('batchmail'),
			display: {
				en: "Mail Tools",
				de: "eMail Tools"
			}
		},
		help: {
			icon: core.function.icon.insert('faq'),
			display: {
				en: "Help",
				de: "Hilfe"
			}
		},
	},
	themes: {
		//		theme.css-filename: { en: 'english title', de: 'german title', extend languages as desired },
		default: {
			en: 'default',
			de: 'standard'
		},
		light: {
			en: 'light',
			de: 'hell'
		},
		dark: {
			en: 'dark',
			de: 'dunkel'
		},
		rose: {
			en: 'rose',
			de: 'rosé'
		},
		orange: {
			en: 'orange',
			de: 'fox'
		},
		slate: {
			en: 'slate',
			de: 'schiefer'
		},
		nord: {
			en: 'nord',
			de: 'nord'
		}
	},
	//	rootdir in case different handling of source files is necessary over developement and production sites
	rootdir: location.pathname.substring(1, location.pathname.lastIndexOf('/')).replace(/%20/g, " ") + '/',

	//	logo as shown in upper left corner
	logo: '<svg xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; transform:scale(1,-1);" class="icon" viewBox="0 0 2048 2048"><path d="M1024 2048l1024 -1024l-1024 -1024l-1024 1024zM768 437l256 -256l843 843l-843 843l-843 -843l459 -459v587h549l-210 211l90 90l365 -365l-365 -365l-90 90l210 211h-421v-587z" /></svg>',
	//	register all languages to be selectable within settings menu. if a language is not extended properly there might be object errors!
	registeredLanguages: {
		en: ["en", "english"],
		de: ["de", "deutsch"]
	},
	//	selected language in settings or desired default fallback
	selectedLanguage: (core.function.setting.get('settingLanguage') || 'en'),
	//	mail for error reporting or feature request as shown in settings
	adminMail: 'your@email.adr',
	//	corporate design considerations for font. used for copied content. has to be installed on local machine
	corporateFontFace: 'Calibri',
	corporateFontSize: '10pt',
	letterTemplate: 'file:///E:/Quality Management/published/letter_template.docx', // if you want to use, else null
	outlookWebUrl: 'https://exc20/owa/auth/logon.aspx', //if you have it installed else null

	//text-blocks within the core file and reusable textblocks for modules
	lang: {
		title: {
			en: 'QM-Assistant',
			de: 'QM-Assistent'
		},
		greeting: {
			en: 'Welcome to the QM-Assistant. How can i help you?',
			de: 'Willkommen beim QM-Assistenten. Wobei kann ich unterstützen?'
		},
		copycontentNewWindowCaption: {
			en: 'Copy text, close window with left mouse button',
			de: 'Text kopieren, linke Maustaste schließt das Fenster wieder'
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
			en: 'Fuzzy-search',
			de: 'Fuzzy-Search'
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
				return 'Show hint #' + (updateTracker.latestMajorUpdate() + 1) + ' on startup';
			},
			de: function () {
				return 'Hinweis #' + (updateTracker.latestMajorUpdate() + 1) + ' beim Start anzeigen';
			}
		},
		settingNotificationHint: {
			en: 'New hints are shown on startup automatically. <a href="javascript:updateTracker.enlist();">Show all hints</a>',
			de: 'Neue Hinweise werden immer automatisch beim Start angezeigt. <a href="javascript:updateTracker.enlist();">Alle Hinweise anzeigen</a>'
		},
		settingModuleselectorCaption: {
			en: 'Displayed modules',
			de: 'angezeigte Module'
		},
		settingGeneralHint: {
			en: 'Local security settings can result in loss of settings on closing browser window.',
			de: 'Lokale Sicherheitseinstellungen können dazu führen, dass beim Schließen des Browser-Fensters die Einstellungen verloren gehen.'
		},
		settingRestartNeccessary: {
			en: 'restart of application neccessary',
			de: 'Neustart der Oberfläche erforderlich'
		},
		settingResetApp: {
			en: 'Reset application',
			de: 'Alle Einstellungen zurücksetzen'
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
				return 'Search for <span class="highlight">' + query + '</span> returned no results. Check spelling ' + (core.function.setting.get('settingFuzzySearch') ? '' : 'or fuzzy-search-setting ') + 'or look for parts of query. Please adhere to mimimum 3 character length.'
			},
			de: function (query) {
				return 'Zum Begriff <span class="highlight">' + query + '</span> konnte nichts gefunden werden. Bitte eventuell Schreibweise ' + (core.function.setting.get('settingFuzzySearch') ? '' : 'oder Fuzzy-Search-Einstellung ') + 'überprüfen oder nach Wortteilen suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
			},
		},

		buttonGenCaption: {
			en: 'generate / update',
			de: 'generieren / aktualisieren'
		},
		buttonGenTitle: {
			en: 'output with given values',
			de: 'Aufgabe gemäß der gewählten Optionen'
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
		quickstart: {
			en: 'Quickstart',
			de: 'Schnelleinstieg'
		},
		homeMenuEntry: {
			en: 'Home',
			de: 'Start'
		},

	},
};