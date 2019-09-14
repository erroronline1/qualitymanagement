//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for checking if a item exists in stock
//
//  dependencies:	{core.var.moduleVarDir}stocklist.var.js
//					{core.var.moduleDataDir}stocklist.js
//					stocklist.xlsm
//
//////////////////////////////////////////////////////////////

if (typeof stocklist === 'undefined') var stocklist = {};

stocklist.api = {
	available: function (search) {
		core.function.loadScript(core.var.moduleDataDir + 'stocklist.js',
			'stocklist.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('stocklist.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var display;
		if (typeof stocklist_data !== 'undefined') {
			//clone data object and reset first value to undefined otherwise header terms can be displayed as results
			var data_without_header=JSON.parse(JSON.stringify(stocklist_data));
			data_without_header.content[0]=new Array(data_without_header.content[0].length);
			var found = core.function.smartSearch.lookup(search, data_without_header.content, true);
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
		returnselect: function () {
			var output = new Object();
			Object.keys(stocklist.var.filter()).forEach(function (key) {
				output[key] = [stocklist.var.filter()[key][0], stocklist.var.filter()[key][1]];
			});
			return output;
		},
	},
	search: function (query) {
		query = query || el('itemname').value;
		core.performance.start('stocklist.function.input(\'' + value(query) + '\')'); //possible duplicate
		var list = '';
		if (typeof stocklist_data !== 'undefined') {
			if (value(query) !== '') {
				//clone data object and reset first value to undefined otherwise header terms can be displayed as results
				var data_without_header=JSON.parse(JSON.stringify(stocklist_data));
				data_without_header.content[0]=new Array(data_without_header.content[0].length);
				var found = core.function.smartSearch.lookup(query, data_without_header.content, stocklist.var.filter()[el('stockfilter').options[el('stockfilter').selectedIndex].value][2]);
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
					function mklink(str){
						//replaces http://website and c:/folder/file with links
						//given folders may contain whitespaces but are not embedded into text
						return str.replace(/\w{3,}:\/+\S*|\w:\/.+/g, function(l){return '<a href="' + l + '" target="_blank">' + l + '</a>';});
					}

					found.forEach(function (value) {
						list += core.function.smartSearch.relevance.nextstep(value[1]);
						var tresult = '<div class="items items71" onclick="core.function.toggleHeight(this)">' + core.function.insert.expand(),
							mailbody = '';
						for (var h = 0; h < stocklist_data.content[0].length; h++) {
							if (stocklist_data.content[value[0]][h]!='') {
								tresult += '<p><span class="highlight">' + stocklist_data.content[0][h] + ':</span> ' + mklink(stocklist_data.content[value[0]][h]) + '</p>';
								mailbody += stocklist_data.content[0][h] + ': ' + stocklist_data.content[value[0]][h] + "\n";
							}
						}
						list += tresult +
							'<a title="' + maillanguage.helpChangeItemTitle + '" onclick="return confirm(\'' + maillanguage.helpChangeItemPopup + '\');" href="mailto:' + stocklist.var.inventoryControl + '?subject=' + core.function.escapeHTML(maillanguage.helpChangeItemSubject) + '&body=' + core.function.escapeHTML(mailbody) + '">' + maillanguage.helpChangeItemCaption + '</a> ' +
							'<a title="' + maillanguage.helpDeleteItemTitle + '" onclick="return confirm(\'' + maillanguage.helpDeleteItemPopup + '\');" href="mailto:' + stocklist.var.inventoryControl + '?subject=' + core.function.escapeHTML(maillanguage.helpDeleteItemSubject) + '&body=' + core.function.escapeHTML(mailbody) + '">' + maillanguage.helpDeleteItemCaption + '</a> ' +
							'</div>';
					});
				} else list = core.function.lang('errorNothingFound', 'stocklist', query);
				core.function.stdout('output', list);
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
		core.function.loadScript(core.var.moduleDataDir + 'stocklist.js', 'stocklist.function.search(\'' + value(query) + '\')');
		core.function.stdout('input',
			'<form id="search" action="javascript:stocklist.function.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.function.lang('inputPlaceholder', 'stocklist') + '" id="itemname" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + ' />' +
			'<span onclick="stocklist.function.search();" class="search">' + core.function.insert.icon('search') + '</span> ' +
			core.function.insert.select(stocklist.function.translate.returnselect(), 'stockfilter', 'stockfilter', (core.function.setting.get('stockfilter') || 'all'), 'onchange="core.function.setting.set(\'stockfilter\',el(\'stockfilter\').options[el(\'stockfilter\').selectedIndex].value); stocklist.function.search();"') +
			'<input type="submit" id="submit" value="' + core.function.lang('formSubmit', 'stocklist') + '" hidden="hidden" /> ' +
			core.function.insert.icon('websearch', 'bigger', false, 'onclick="window.open(\'https://www.google.de/#q=\'+el(\'itemname\').value,\'_blank\');" title="' + core.function.lang('webSearchTitle', 'stocklist') + '"') +
			'</form>');
		el('itemname').focus();
		core.function.stdout('temp', core.function.lang('useCaseDescription', 'stocklist'));
		core.performance.stop('stocklist.function.init(\'' + value(query) + '\')');
	},
};