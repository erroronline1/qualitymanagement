﻿//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for checking if a item exists in stock
//
//  dependencies:	data/stocklist.var.js
//					data/stocklist.js
//					artikelmanager.xlsm
//
//////////////////////////////////////////////////////////////

if (typeof stocklist == 'undefined') var stocklist = {};

stocklist.api = {
	available: function (search) {
		core.function.loadScript('data/stocklist.js',
			'stocklist.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('stocklist.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var display;
		if (typeof (stocklist_data) != 'undefined') {
			var found = core.function.smartSearch.lookup(search, stocklist_data.content, true);
			//the following would return the found items, but i decided otherwise in this case
			//found.forEach(function (value) {
			//	display=display:stocklist_data.content[value[0]][1] + ' ' +stocklist_data.content[value[0]][2] + ' '+ stocklist_data.content[value[0]][3];
			//	globalSearch.contribute('stocklist', display);
			//});
			if (found.length) {
				display = '<a href="javascript:core.function.loadScript(\'modules/stocklist.js\',\'stocklist.function.init(\\\'' + search + '\\\')\')">' + found.length + core.function.lang('apiItemsFound', 'stocklist') + '</a>';
				//add value and relevance
				globalSearch.contribute('stocklist', [display, 1]);
			}
			core.performance.stop('stocklist.api.processAfterImport(\'' + search + '\')');
		}
	}
};
stocklist.function = {
	translate: {
		filter: function () {
			//id:[select value, select text, filter for smartsearch]
			return {
				all: ['all', core.function.lang('filterAll', 'stocklist'), 'true'],
				conf: ['conf', core.function.lang('filterReadymade', 'stocklist'), 'stocklist_data.content[key][6]==\'ja\''],
				nconf: ['nconf', core.function.lang('filterNoReadymade', 'stocklist'), 'stocklist_data.content[key][6]==\'nein\''],
				store: ['store', core.function.lang('filterStock', 'stocklist'), 'stocklist_data.content[key][7]!=\'nein\''],
			};
		},
		returnselect: function () {
			var output = new Object();
			Object.keys(stocklist.function.translate.filter()).forEach(function (key) {
				output[key] = [stocklist.function.translate.filter()[key][0], stocklist.function.translate.filter()[key][1]];
			});
			return output;
		},
	},
	search: function (query) {
		query = query || el('itemname').value;
		core.performance.start('stocklist.function.input(\'' + value(query) + '\')'); //possible duplicate
		var list = '';
		if (typeof (stocklist_data) != 'undefined') {
			if (value(query) != '') {
				var found = core.function.smartSearch.lookup(query, stocklist_data.content, stocklist.function.translate.filter()[el('stockfilter').options[el('stockfilter').selectedIndex].value][2]);
				// check if search matches item-list
				if (found.length > 0) {
					core.function.smartSearch.relevance.init();
					//reminder: keep these kind of assignments out of loops for performance reasons!
					var maillanguage = {
						helpChangeItemTitle: core.function.lang('helpChangeItemTitle', 'stocklist'),
						helpDeleteItemTitle: core.function.lang('helpDeleteItemTitle', 'stocklist'),
						helpChangeItemPopup: core.function.lang('helpChangeItemPopup', 'stocklist'),
						helpDeleteItemPopup: core.function.lang('helpDeleteItemPopup', 'stocklist'),
						helpChangeItemSubject: core.function.lang('helpChangeItemSubject', 'stocklist'),
						helpDeleteItemSubject: core.function.lang('helpDeleteItemSubject', 'stocklist'),
						helpChangeItemCaption: core.function.lang('helpChangeItemCaption', 'stocklist'),
						helpDeleteItemCaption: core.function.lang('helpDeleteItemCaption', 'stocklist'),
					};

					found.forEach(function (value) {
						list += core.function.smartSearch.relevance.nextstep(value[1]);
						var tresult = '<div class="items items71" onclick="core.function.toggleHeight(this)">' + core.function.insert.expand(),
							mailbody = '';
						for (var h = 0; h < stocklist_data.content[0].length; h++) {
							tresult += '<p><span class="highlight">' + stocklist_data.content[0][h] + ':</span> ' + stocklist_data.content[value[0]][h] + '</p>';
							mailbody += stocklist_data.content[0][h] + ': ' + stocklist_data.content[value[0]][h] + "\n";
						}
						list += tresult +
							'<a title="' + maillanguage.helpChangeItemTitle + '" onclick="return confirm(\'' + maillanguage.helpChangeItemPopup + '\');" href="mailto:' + stocklist.var.inventoryControl + '?subject=' + core.function.escapeHTML(maillanguage.helpChangeItemSubject) + '&body=' + core.function.escapeHTML(mailbody) + '">' + maillanguage.helpChangeItemCaption + '</a> ' +
							'<a title="' + maillanguage.helpDeleteItemTitle + '" onclick="return confirm(\'' + maillanguage.helpDeleteItemPopup + '\');" href="mailto:' + stocklist.var.inventoryControl + '?subject=' + core.function.escapeHTML(maillanguage.helpDeleteItemSubject) + '&body=' + core.function.escapeHTML(mailbody) + '">' + maillanguage.helpDeleteItemCaption + '</a> ' +
							'</div>';
					});
				} else list = core.function.lang('errorNothingFound', 'stocklist', query);
				el('output').innerHTML = list;
				list = '';
			} else {
				return stocklist_data.content.length - 1;
			}
		}
		core.performance.stop('stocklist.function.input(\'' + value(query) + '\')');
		core.history.write(['stocklist.function.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('modulestocklist').checked = true; // highlight menu icon
		core.function.loadScript('data/stocklist.js', 'stocklist.function.search(\'' + value(query) + '\')');
		el('input').innerHTML =
			'<form id="search" action="javascript:stocklist.function.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.function.lang('inputPlaceholder', 'stocklist') + '" id="itemname" class="search"  ' + (value(query) != '' ? 'value="' + query + '"' : '') + ' />' +
			'<span onclick="stocklist.function.search();" class="search">' + core.function.icon.insert('search') + '</span> ' +
			core.function.insert.select(stocklist.function.translate.returnselect(), 'stockfilter', 'stockfilter', (core.function.setting.get('stockfilter') || 'all'), 'onchange="core.function.setting.set(\'stockfilter\',el(\'stockfilter\').options[el(\'stockfilter\').selectedIndex].value); stocklist.function.search();"') +
			'<input type="submit" id="submit" value="' + core.function.lang('formSubmit', 'stocklist') + '" hidden="hidden" /> ' +
			core.function.icon.insert('websearch', 'bigger', false, 'onclick="window.open(\'https://www.google.de/#q=\'+el(\'itemname\').value,\'_blank\');" title="' + core.function.lang('webSearchTitle', 'stocklist') + '"') +
			'</form>';
		el('output').innerHTML = el('temp').innerHTML = '';
		el('temp').innerHTML = core.function.lang('useCaseDescription', 'stocklist');
		core.performance.stop('stocklist.function.init(\'' + value(query) + '\')');
	},
};