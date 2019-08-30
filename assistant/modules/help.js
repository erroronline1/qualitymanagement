//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching the frequently asked questions
//
//  dependencies:	data/help.var.js
//					data/help.js
//
//////////////////////////////////////////////////////////////

if (typeof help === 'undefined') var help = {};

help.api = {
	available: function (search) {
		core.function.loadScript('data/help.js',
			'help.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('help.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var display;
		if (typeof help_data !== 'undefined') {
			var found = core.function.smartSearch.lookup(search, help_data.content, true);
			found.forEach(function (value) {
				display = '<a href="javascript:core.function.loadScript(\'modules/help.js\',\'help.function.init(\\\'' + help_data.content[value[0]][0] + '\\\')\')">' + help_data.content[value[0]][0] + '</a>';
				//add value and relevance
				globalSearch.contribute('help', [display, value[1]]);
			});
		}
		core.performance.stop('help.api.processAfterImport(\'' + search + '\')');
	}
};
help.function = {
	search: function (query) {
		query = query || el('helpquery').value;
		core.performance.start('help.function.input(\'' + value(query) + '\')'); //possible duplicate
		if (typeof help_data !== 'undefined') {
			var list = '';
			Object.keys(help_data.content).forEach(function (key) {
				if (help_data.content[key][0]) list += '<a style="cursor:pointer" onclick="el(\'helpquery\').value=\'' + help_data.content[key][0] + '\'; el(\'search\').submit();">' + help_data.content[key][0] + '</a><br />';
				else list += '<br />';
			});
			el('temp').innerHTML = '<span class="highlight">' + core.function.lang('tableOfContents', 'help') + ':</span><br />' + list;
			if (value(query) !== '') {
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
		core.performance.stop('help.function.input(\'' + value(query) + '\')');
		core.history.write(['help.function.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('modulehelp').checked = true; // highlight menu icon
		core.function.loadScript('data/help.js', 'help.function.search(\'' + value(query) + '\')');
		el('input').innerHTML =
			'<form id="search" action="javascript:help.function.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.function.lang('formInputPlaceholder', 'help') + '" id="helpquery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
			'<span onclick="help.function.search();" class="search">' + core.function.insert.icon('search') + '</span> ' +
			'<input type="submit" id="artikelsuche" value="' + core.function.lang('formSubmit', 'help') + '" hidden="hidden" /> ' +
			'</form>';
		el('helpquery').focus();

		el('temp').innerHTML = el('output').innerHTML = " ";
		core.performance.stop('help.function.init(\'' + value(query) + '\')');
	},
};