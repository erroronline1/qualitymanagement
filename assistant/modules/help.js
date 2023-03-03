//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching the frequently asked questions
//
//  dependencies:	{core.var.moduleVarDir}help.var.js
//					{core.var.moduleDataDir}help.js
//
//////////////////////////////////////////////////////////////

var help = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found;
			found = await core.fn.async.smartSearch.lookup(search, help.data.content, true);
			found.forEach((value) => {
				display = '<a href="javascript:help.fn.init(\'' + help.data.content[value[0]][0] + '\')">' + help.data.content[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('help', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		search: async (query = '') => {
			query = query || 'helpquery'.element().value;
			let found,
				list = '',
				tresult;
			Object.keys(help.data.content).forEach(function (key) {
				if (help.data.content[key][0]) list += '<a style="cursor:pointer" onclick="\'helpquery\'.element().value=\'' + help.data.content[key][0] + '\'; \'search\'.element().submit();">' + help.data.content[key][0] + '</a><br />';
				else list += '<br />';
			});
			core.fn.async.stdout('temp', '<span class="highlight">' + core.fn.static.lang('tableOfContents', 'help') + ':</span><br />' + list);
			if (query) {
				found = await core.fn.async.smartSearch.lookup(query, help.data.content, true);
				// check if search matches item-list
				if (found.length > 0) {
					list = '';
					core.fn.async.smartSearch.relevance.init();
					found.forEach((value) => {
						list += core.fn.async.smartSearch.relevance.nextstep(value[1]);
						tresult = '<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() +
							'<span class="highlight">' + help.data.content[value[0]][0] + ':</span> ' + help.data.content[value[0]][1];
						list += tresult +
							'</div>';
					});
				} else list = core.fn.static.lang('errorNothingFound', 'help', query);
				core.fn.async.stdout('output', list);
			}
			core.history.write('help.fn.init(\'' + query + '\')');
		},
		init: async (query = '') => {
			await core.fn.async.stdout('input',
				'<form id="search" action="javascript:help.fn.search();">' +
				'<input type="text" pattern=".{3,}" required value="' + query.replace(/"/g, '&quot;') + '" placeholder="' + core.fn.static.lang('formInputPlaceholder', 'help') + '" id="helpquery" class="search" />' +
				'<span onclick="help.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
				'<input type="submit" id="artikelsuche" value="' + core.fn.static.lang('formSubmit', 'help') + '" hidden="hidden" /> ' +
				'</form>');
			'helpquery'.element().focus();
			help.fn.search(query);
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'help.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'help.data.js');
		}
	}
};