//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching the frequently asked questions
//
//  dependencies:	{core.var.moduleVarDir}help.var.js
//					{core.var.moduleDataDir}help.js
//
//////////////////////////////////////////////////////////////

if (typeof help === 'undefined') var help = {};

help.api = {
	available: function (search) {
		core.fn.loadScript(core.var.moduleDataDir +'help.js',
			'help.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('help.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var display;
		if (typeof help_data !== 'undefined') {
			var found = core.fn.smartSearch.lookup(search, help_data.content, true);
			found.forEach(function (value) {
				display = '<a href="javascript:core.fn.loadScript(\'modules/help.js\',\'help.fn.init(\\\'' + help_data.content[value[0]][0] + '\\\')\')">' + help_data.content[value[0]][0] + '</a>';
				//add value and relevance
				globalSearch.contribute('help', [display, value[1]]);
			});
		}
		core.performance.stop('help.api.processAfterImport(\'' + search + '\')');
	}
};
help.fn = {
	search: function (query) {
		query = query || el('helpquery').value;
		core.performance.start('help.fn.input(\'' + value(query) + '\')'); //possible duplicate
		if (typeof help_data !== 'undefined') {
			var list = '';
			Object.keys(help_data.content).forEach(function (key) {
				if (help_data.content[key][0]) list += '<a style="cursor:pointer" onclick="el(\'helpquery\').value=\'' + help_data.content[key][0] + '\'; el(\'search\').submit();">' + help_data.content[key][0] + '</a><br />';
				else list += '<br />';
			});
			core.fn.stdout('temp', '<span class="highlight">' + core.fn.lang('tableOfContents', 'help') + ':</span><br />' + list);
			if (value(query) !== '') {
				var found = core.fn.smartSearch.lookup(query, help_data.content, true);

				// check if search matches item-list
				if (found.length > 0) {
					list = '';
					core.fn.smartSearch.relevance.init();
					found.forEach(function (value) {
						list += core.fn.smartSearch.relevance.nextstep(value[1]);
						var tresult = '<div class="items items71" onclick="core.fn.toggleHeight(this)">' + core.fn.insert.expand() +
							'<span class="highlight">' + help_data.content[value[0]][0] + ':</span> ' + help_data.content[value[0]][1];

						list += tresult +
							'</div>';
					});
				} else list = core.fn.lang('errorNothingFound', 'help', query);
				core.fn.stdout('output', list);
			}
		}
		core.performance.stop('help.fn.input(\'' + value(query) + '\')');
		core.history.write(['help.fn.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('modulehelp').checked = true; // highlight menu icon
		core.fn.loadScript(core.var.moduleDataDir + 'help.js', 'help.fn.search(\'' + value(query) + '\')');
		core.fn.stdout('input',
			'<form id="search" action="javascript:help.fn.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query).replace(/"/g,'&quot;') + '" placeholder="' + core.fn.lang('formInputPlaceholder', 'help') + '" id="helpquery" class="search" />' +
			'<span onclick="help.fn.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
			'<input type="submit" id="artikelsuche" value="' + core.fn.lang('formSubmit', 'help') + '" hidden="hidden" /> ' +
			'</form>');
		el('helpquery').focus();
		core.performance.stop('help.fn.init(\'' + value(query) + '\')');
	},
};