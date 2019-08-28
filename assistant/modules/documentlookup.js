//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching document-files in a static database
//
//  dependencies:	data/documentlookup_int.js,
//					data/documentlookup_ext.js,
//					documents.xlsm,
//					external_dokuments.xlsm
//
//////////////////////////////////////////////////////////////

var documentlookup = {
	var: {
		lang: {
			optionThirdType: {
				en: 'record documents',
				de: 'Nachweisdokumente'
			},
			searchPlaceholder: {
				en: 'search documents',
				de: 'Dokumente durchsuchen'
			},
			searchTitle: {
				en: 'alternative terms: ',
				de: 'alternative Suchbegriffe: '
			},
			favouriteCaption: {
				en: 'last used documents',
				de: 'zuletzt genutzte Dokumente'
			},
			favouriteDeleteTitle: {
				en: 'delete favourites until next request',
				de: 'alle Favoriten bis zum nächsten Aufruf löschen'
			},
			favouriteDefaultTitle: {
				en: 'default values',
				de: 'Standardwerte'
			},
			favouriteRestoreTitle: {
				en: 'restore personal favourites',
				de: 'eigene Liste wiederherstellen'
			},
			favouriteSaveTitle: {
				en: 'save personal favourites',
				de: 'eigene Liste speichern'
			},
			favouriteRestoreConfirm: {
				en: 'please reload module',
				de: 'Modul bitte neu laden...'
			},
			favouriteSaveConfirm: {
				en: 'recent favourites saved.',
				de: 'neue Favoritenliste gespeichert.'
			},
			errorNothingFound: {
				en: function (query) {
					return 'Query for document searched by <span class="highlight">' + query + '</span> returned no results. Check spelling ' + (core.function.setting.get('settingFuzzySearch') ? '' : 'or fuzzy-search-setting ') + ', look for parts of query, in another document group or within record documents.  Please adhere to mimimum 3 character length.'
				},
				de: function (query) {
					return 'Es konnte kein Dokument mit dem Begriff <span class="highlight">' + query + '</span> gefunden werden. Bitte eventuell Schreibweise ' + (core.function.setting.get('settingFuzzySearch') ? '' : 'oder Fuzzy-Search-Einstellung ') + 'überprüfen, nach Wortteilen, in einer anderen Dokumengruppe oder bei den Nachweisdokumenten suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'
				},
			},
		},
		submodules: {
			documentlookup_int: {
				en: 'internal documents',
				de: 'interne Dokumente'
			},
			documentlookup_ext: {
				en: 'external documents',
				de: 'externe Dokumente'
			},
			documentlookup_contract: {
				en: 'contracts',
				de: 'Verträge'
			},
		},
		selectedModule: function () {
			return (core.function.setting.get('lookup_bundle') || 'documentlookup_int');
		},
		selectedObject: function () {
			return eval(documentlookup.var.selectedModule() + '_data');
		},
		thirdDocumentCategoryPath: 'O:/Technische Orthopaedie/QM/QM-PDF Vorlagen/Nachweisdokumente/',
		disableOutputSelect: true,
	},
	api: {
		available: function (search) {
			Object.keys(documentlookup.var.submodules).forEach(function (key) {
				core.function.loadScript('data/' + key + '.js',
					'documentlookup.api.processAfterImport(\'' + search + '\', \'' + key + '_data\')');
			});
			core.performance.stop('documentlookup.api.available(\'' + search + '\')');
		},
		processAfterImport: function (search, objectname) {
			var display = '';
			if (typeof (objectname) != 'undefined') {
				object = eval(objectname);
				var found = core.function.smartSearch.lookup(search, object.content, true);
				found.forEach(function (value) {
					if (typeof (object.content[value[0]]) == 'object') display = documentlookup.function.linkfile(object.content[value[0]][0], core.function.lang('searchTitle', 'documentlookup') + object.content[value[0]][1]);
					else display = documentlookup.function.linkfile(object.content[value[0]]);
					//add value and relevance
					globalSearch.contribute('documentlookup', [display, value[1]]);
				});
			}
			core.performance.stop('documentlookup.api.processAfterImport(\'' + search + '\', \'' + objectname + '\')', found);
		}
	},
	function: {
		linkfile: function (url, title) {
			title = value(title) != '' ? ' title="' + title + '" ' : '';
			// bad filename or dynamic url
			if (typeof (url) === 'object') {
				return '<a href="' + url[0] + '" ' + title + ' target="_blank">' + url[1] + '</a>';
			}
			// url with quality filename
			else return '<a href="' + url + '" ' + title + ' onclick="documentlookup.function.favouriteHandler.set(\'' + documentlookup.function.favouriteHandler.prepare(url) + '\'); return;" target="_blank">' + url.substring(url.lastIndexOf('/'), url.lastIndexOf('.')).substring(1) + '</a>';
		},
		favouriteHandler: {
			prepare: function (value) {
				return value.substring(value.lastIndexOf('/'), value.lastIndexOf('.')).substring(1).replace(/[^a-z0-9]/gi, '');
			},
			set: function (value) {
				var output = core.function.setting.get('favouritedocs');
				if (output) {
					if (output.indexOf(value) > -1) {
						var tfav = output.split(','),
							favourites = new Array();
						//create two dimensional array and add sighting if neccessary
						for (var i = 0; i < tfav.length; i += 2) {
							favourites.push(new Array(tfav[i], parseInt(tfav[i + 1]) + (tfav[i] == value ? 1 : 0)));
						}
						favourites.sort(core.function.sortBySecondColumn);
						//reduce two dimensional array after sorting
						for (i = 0; i < favourites.length; i++) {
							favourites[i] = favourites[i].join(',');
						}
						//reduce to flat
						output = favourites.join(',');
					} else output += ',' + value + ',1';
				} else output = value + ',1';
				core.function.setting.set('favouritedocs', output);
			},
			get: function () {
				var output = core.function.setting.get('favouritedocs');
				if (output) {
					var tfav = tfav2 = new Array();
					//assign link to index as favourite handler
					Object.keys(documentlookup.var.selectedObject().content).forEach(function (key) {
						if (typeof (documentlookup.var.selectedObject().content[key]) == 'object')
							tfav[documentlookup.function.favouriteHandler.prepare(documentlookup.var.selectedObject().content[key][0])] = documentlookup.function.linkfile(documentlookup.var.selectedObject().content[key][0]);
						else tfav[documentlookup.function.favouriteHandler.prepare(documentlookup.var.selectedObject().content[key])] = documentlookup.function.linkfile(documentlookup.var.selectedObject().content[key]);
					});

					var tfav2 = output.split(',');
					//sef default document titles without whitespaces, predefined clicks for hiher postion 
					var defaults = 'Briefvorlagemit100JahrLogo,20,' +
						'FahrtArbeitgeberbescheinigung,10,' +
						'arbeitsunt,10,' +
						'KAssenanordnungNationalIBANID22678,5,' +
						'Protokoll,10,' +
						'Bestellschein,10,' +
						'Empfangsbesttigung,10,' +
						'Reklamation,10';

					output = '<br />' + core.function.lang('favouriteCaption', 'documentlookup') + ':<span style="display:inline-block; vertical-align:middle; float:right;">' +
						core.function.icon.insert('delete', 'bigger', false, 'title="' + core.function.lang('favouriteDeleteTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.reset(\'\')"') +
						core.function.icon.insert('clipboard', 'bigger', false, 'title="' + core.function.lang('favouriteDefaultTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.reset(\'' + defaults + '\')"') +
						core.function.icon.insert('refresh', 'bigger', false, 'title="' + core.function.lang('favouriteRestoreTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.reset(\'' + core.function.setting.get('customfavouritedocs') + '\')"') +
						core.function.icon.insert('save', 'bigger', false, 'title="' + core.function.lang('favouriteSaveTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.customreset()"') +
						'</span><br /><br />';
					for (var i = 0; i < tfav2.length; i += 2) {
						if (tfav[tfav2[i]] != undefined) output += tfav[tfav2[i]] + '<br />';
					}
				}
				return output || '';
			},
			reset: function (output) {
				core.function.setting.set('favouritedocs', output);
				alert(core.function.lang('favouriteRestoreConfirm', 'documentlookup'));
			},
			customreset: function () {
				core.function.setting.set('customfavouritedocs', core.function.setting.get('favouritedocs'));
				alert(core.function.lang('favouriteSaveConfirm', 'documentlookup'));
			}
		},
		search: function (query) {
			query = query || el('documentname').value;
			core.performance.start('documentlookup.function.search(\'' + value(query) + '\')'); //possible duplicate
			var list = '';
			if (typeof (documentlookup.var.selectedObject()) != 'undefined') {
				//list all items for overview
				Object.keys(documentlookup.var.selectedObject().content).forEach(function (key) {
					if (typeof (documentlookup.var.selectedObject().content[key]) == 'object') list += documentlookup.function.linkfile(documentlookup.var.selectedObject().content[key][0]) + '<br />';
					else list += documentlookup.function.linkfile(documentlookup.var.selectedObject().content[key]) + '<br />';
				});
				el('temp').innerHTML = list;

				if (query != '') {
					var found = core.function.smartSearch.lookup(query, documentlookup.var.selectedObject().content, true);

					// check if search matches item-list and display result
					if (found.length > 0) {
						list = '';
						core.function.smartSearch.relevance.init();
						found.forEach(function (value) {
							list += core.function.smartSearch.relevance.nextstep(value[1]);
							if (typeof (documentlookup.var.selectedObject().content[value[0]]) == 'object') list += documentlookup.function.linkfile(documentlookup.var.selectedObject().content[value[0]][0], (documentlookup.var.selectedObject().content[value[0]][1] ? core.function.lang('searchTitle', 'documentlookup') + documentlookup.var.selectedObject().content[value[0]][1] : false)) + '<br />';
							else list += documentlookup.function.linkfile(documentlookup.var.selectedObject().content[value[0]]) + '<br />';
						});
						el('output').innerHTML = list;
						list = '';
					} else el('output').innerHTML = core.function.lang('errorNothingFound', 'documentlookup', query);
				} else el('output').innerHTML = documentlookup.function.favouriteHandler.get() || '';
			}
			core.performance.stop('documentlookup.function.search(\'' + value(query) + '\')', found);
			core.history.write(['documentlookup.function.init(\'' + value(query) + '\')']);
		},
		init: function (query) {
			el('moduledocumentlookup').checked = true; // highlight menu icon
			core.function.loadScript('data/' + documentlookup.var.selectedModule() + '.js', 'documentlookup.function.search(\'' + value(query) + '\')');
			//prepare selection
			var selection = {};
			Object.keys(documentlookup.var.submodules).forEach(function (key) {
				selection[key] = [key, documentlookup.var.submodules[key][core.var.selectedLanguage]];
			});
			el('input').innerHTML =
				'<form id="search" action="javascript:documentlookup.function.search();">' +
				'<input type="text" pattern=".{3,}" required id="documentname" placeholder="' + core.function.lang('searchPlaceholder', 'documentlookup') + '" class="search"  ' + (value(query) != '' ? 'value="' + query + '"' : '') + ' />' +
				'<span onclick="documentlookup.function.search();" class="search">' + core.function.icon.insert('search') + '</span> ' +
				core.function.insert.select(selection, 'lookup', 'lookup', (core.function.setting.get('lookup_bundle') || false), 'onchange="core.function.setting.set(\'lookup_bundle\',this.options[this.selectedIndex].value); core.function.loadScript(\'data/\' + this.options[this.selectedIndex].value+ \'.js\',\'documentlookup.function.search()\');"') +
				'<input type="submit" id="submit" value="' + core.function.lang('formSubmit', 'documentlookup') + '" hidden="hidden" /> ' +
				'<a style="float:right" href="' + documentlookup.var.thirdDocumentCategoryPath + '">' + core.function.lang('optionThirdType', 'documentlookup') + '</a>' +
				'</form>';
			el('temp').innerHTML = el('output').innerHTML = '';
			core.performance.stop('documentlookup.function.init(\'' + value(query) + '\')');
		},
	},
}