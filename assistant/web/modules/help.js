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
	available: async (search) => {
		await core.fn.async.loadScript(core.var.moduleDataDir + 'help.js',
			'help.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('help.api.available(\'' + search + '\')');
	},
	processAfterImport: async (search) => {
		let display,
			found;
		if (typeof help_data !== 'undefined') {
			found = await core.fn.async.smartSearch.lookup(search, help_data.content, true);
			found.forEach((value) => {
				display = '<a href="javascript:core.fn.async.loadScript(\'' + core.var.moduleDir + 'help.js\',\'help.fn.init(\\\'' + help_data.content[value[0]][0] + '\\\')\')">' + help_data.content[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('help', [display, value[1]]);
			});
		}
		core.performance.stop('help.api.processAfterImport(\'' + search + '\')');
	},
	currentStatus: async () => {
		core.performance.stop('help.api.currentStatus()');
		return false;
	}
};
help.fn = {
	search: async (query) => {
		query = query || el('helpquery').value;
		core.performance.start('help.fn.input(\'' + value(query) + '\')'); //possible duplicate
		let found,
			list = '',
			tresult;
		if (typeof help_data !== 'undefined') {
			Object.keys(help_data.content).forEach(function (key) {
				if (help_data.content[key][0]) list += '<a style="cursor:pointer" onclick="el(\'helpquery\').value=\'' + help_data.content[key][0] + '\'; el(\'search\').submit();">' + help_data.content[key][0] + '</a><br />';
				else list += '<br />';
			});
			core.fn.async.stdout('temp', '<span class="highlight">' + core.fn.static.lang('tableOfContents', 'help') + ':</span><br />' + list);
			if (value(query) !== '') {
				found = await core.fn.async.smartSearch.lookup(query, help_data.content, true);
				// check if search matches item-list
				if (found.length > 0) {
					list = '';
					core.fn.async.smartSearch.relevance.init();
					found.forEach((value) => {
						list += core.fn.async.smartSearch.relevance.nextstep(value[1]);
						tresult = '<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() +
							'<span class="highlight">' + help_data.content[value[0]][0] + ':</span> ' + help_data.content[value[0]][1];
						list += tresult +
							'</div>';
					});
				} else list = core.fn.static.lang('errorNothingFound', 'help', query);
				core.fn.async.stdout('output', list);
			}
		}
		core.performance.stop('help.fn.input(\'' + value(query) + '\')');
		core.history.write(['help.fn.init(\'' + value(query) + '\')']);
	},
	init: async (query) => {
		await core.fn.async.loadScript(core.var.moduleDataDir + 'help.js', 'help.fn.search(\'' + value(query) + '\')');
		await core.fn.async.stdout('input',
			'<form id="search" action="javascript:help.fn.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query).replace(/"/g, '&quot;') + '" placeholder="' + core.fn.static.lang('formInputPlaceholder', 'help') + '" id="helpquery" class="search" />' +
			'<span onclick="help.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
			'<input type="submit" id="artikelsuche" value="' + core.fn.static.lang('formSubmit', 'help') + '" hidden="hidden" /> ' +
			'</form>');
		el('helpquery').focus();
		core.performance.stop('help.fn.init(\'' + value(query) + '\')');
	},
};