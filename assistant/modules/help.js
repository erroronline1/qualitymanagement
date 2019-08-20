//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching the frequently asked questions
//
//  dependencies:	data/help.js
//
//////////////////////////////////////////////////////////////

var help = {
	var: {
		lang: {
			formInputPlaceholder: {
				en: 'search help (3 characters minimum)',
				de: 'Hilfe durchsuchen (mindestens 3 Zeichen)'
			},
			tableOfContents: {
				en: 'Contents',
				de: 'Themen'
			},
		}
	},
	api: {
		available: function (search) {
			core.function.loadScript('data/help.js',
				'help.api.processAfterImport(\'' + search + '\')');
			core.performance.stop('help.api.available(\''+search+'\')');
			},
		processAfterImport: function (search) {
			var display;
			if (typeof (help_data) != 'undefined') {
				var found = core.function.smartSearch.lookup(search, help_data.content, true);
				found.forEach(function (value) {
					display = '<a href="javascript:core.function.loadScript(\'modules/help.js\',\'help.function.init(\\\'' + help_data.content[value[0]][0] + '\\\')\',\'' + core.var.modules.help.display[core.var.selectedLanguage] + '\')">' + help_data.content[value[0]][0] + '</a>';
					//add value and relevance
					globalSearch.contribute('help', [display, value[1]]);
				});
			}
			core.performance.stop('help.api.processAfterImport(\''+search+'\')');
		}
	},
	function: {
		init: function (query) {
			core.function.loadScript('data/help.js', 'help.function.search(\'' + (query || '') + '\')');
			el('input').innerHTML =
				'<form id="search" action="javascript:help.function.search();">' +
				'<input type="text" pattern=".{3,}" required value="' + (query || '') + '" placeholder="' + core.function.lang('formInputPlaceholder', 'help') + '" id="helpquery" class="search" />' +
				'<span onclick="help.function.search();" class="search">' + core.function.icon.insert('search') + '</span> ' +
				'<input type="submit" id="artikelsuche" value="' + core.function.lang('formSubmit', 'help') + '" hidden="hidden" /> ' +
				'</form>';
			el('temp').innerHTML = el('output').innerHTML = " ";
			core.performance.stop('help.function.init(' + (typeof query != 'undefined' ? '\'' + query + '\'' : '') + ')');
		},
		search: function (query) {
			query = query || el('helpquery').value;
			core.performance.start('help.function.input(\'' + (query || '') + '\')'); //possible duplicate
			if (typeof (help_data) != 'undefined') {
				var list = '';
				Object.keys(help_data.content).forEach(function (key) {
					if (help_data.content[key][0]) list += '<a style="cursor:pointer" onclick="el(\'helpquery\').value=\'' + help_data.content[key][0] + '\'; el(\'search\').submit();">' + help_data.content[key][0] + '</a><br />';
					else list += '<br />';
				});
				el('temp').innerHTML = '<span class="highlight">' + core.function.lang('tableOfContents', 'help') + ':</span><br />' + list;
				if (query != '') {
					var found = core.function.smartSearch.lookup(query, help_data.content, true);

					// check if search matches item-list
					if (found.length > 0) {
						list = '';
						core.function.smartSearch.relevance.init();
						found.forEach(function (value) {
							list += core.function.smartSearch.relevance.nextstep(value[1]);
							var tresult = '<div class="items items71" onclick="core.function.toggleHeight(this)">' + core.function.insert.expand() +
								'<span class="highlight">' + help_data.content[value[0]][0] + ':</span> ' + help_data.content[value[0]][1];

							list += tresult +
								'</div>';
						});
					} else list = core.function.lang('errorNothingFound', 'help', query);
					el('output').innerHTML = list;
				}
			}
			core.performance.stop('help.function.input(\'' + (query || '') + '\')');
		},
	}
}

var disableOutputSelect = true;