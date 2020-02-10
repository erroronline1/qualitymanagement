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
		core.fn.loadScript(core.var.moduleDataDir + 'stocklist.js',
			'stocklist.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('stocklist.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var display;
		if (typeof stocklist_data !== 'undefined') {
			//clone data object and reset first value to undefined otherwise header terms can be displayed as results
			var data_without_header=JSON.parse(JSON.stringify(stocklist_data));
			data_without_header.content[0]=new Array(data_without_header.content[0].length);
			var found = core.fn.smartSearch.lookup(search, data_without_header.content, true);
			//the following would return the found items, but i decided otherwise in this case
			//found.forEach(function (value) {
			//	display=display:stocklist_data.content[value[0]][1] + ' ' +stocklist_data.content[value[0]][2] + ' '+ stocklist_data.content[value[0]][3];
			//	globalSearch.contribute('stocklist', display);
			//});
			if (found.length) {
				display = '<a href="javascript:core.fn.loadScript(\'modules/stocklist.js\',\'stocklist.fn.init(\\\'' + search + '\\\')\')">' + found.length + core.fn.lang('apiItemsFound', 'stocklist') + '</a>';
				//add value and relevance
				globalSearch.contribute('stocklist', [display, 1]);
			}
			core.performance.stop('stocklist.api.processAfterImport(\'' + search + '\')');
		}
	},
	addToCart: function(index){
		// this only makes sense in case of the ticketorder-module
		core.fn.setting.set('moduleExchangeTicketorder', core.fn.setting.get('moduleExchangeTicketorder') + index + ",");
	}
};
stocklist.fn = {
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
		core.performance.start('stocklist.fn.input(\'' + value(query) + '\')'); //possible duplicate
		var list = '';
		if (typeof stocklist_data !== 'undefined') {
			if (value(query) !== '') {
				//clone data object and reset first value to undefined otherwise header terms can be displayed as results
				var data_without_header=JSON.parse(JSON.stringify(stocklist_data));
				data_without_header.content[0]=new Array(data_without_header.content[0].length);
				var found = core.fn.smartSearch.lookup(query, data_without_header.content, stocklist.var.filter()[el('stockfilter').options[el('stockfilter').selectedIndex].value][2]);
				// check if search matches item-list
				if (found.length > 0) {
					core.fn.smartSearch.relevance.init();
					//reminder: keep these kind of assignments out of loops for performance reasons!
					var maillanguage = {
						helpChangeItemTitle: core.fn.lang('helpChangeItemTitle', 'stocklist'),
						helpDeleteItemTitle: core.fn.lang('helpDeleteItemTitle', 'stocklist'),
						helpChangeItemPopup: core.fn.lang('helpChangeItemPopup', 'stocklist'),
						helpDeleteItemPopup: core.fn.lang('helpDeleteItemPopup', 'stocklist'),
						helpChangeItemSubject: core.fn.lang('helpChangeItemSubject', 'stocklist'),
						helpDeleteItemSubject: core.fn.lang('helpDeleteItemSubject', 'stocklist'),
						helpChangeItemCaption: core.fn.lang('helpChangeItemCaption', 'stocklist'),
						helpDeleteItemCaption: core.fn.lang('helpDeleteItemCaption', 'stocklist'),
					};
					function mklink(str){
						//replaces http://website and c:/folder/file with links
						//given folders may contain whitespaces but are not embedded into text
						return str.replace(/\w{3,}:\/+\S*|\w:\/.+/g, function(l){return '<a href="' + l + '" target="_blank">' + l + '</a>';});
					}

					found.forEach(function (value) {
						list += core.fn.smartSearch.relevance.nextstep(value[1]);
						var tresult = '<div class="items items71" onclick="core.fn.toggleHeight(this)">' + core.fn.insert.expand(),
							mailbody = '';
						for (var h = 0; h < stocklist_data.content[0].length; h++) {
							if (stocklist_data.content[value[0]][h]!='') {
								tresult += '<p><span class="highlight">' + stocklist_data.content[0][h] + ':</span> ' + mklink(stocklist_data.content[value[0]][h]) + '</p>';
								mailbody += stocklist_data.content[0][h] + ': ' + stocklist_data.content[value[0]][h] + "<br />";
							}
						}
						list += tresult +
							'<a title="' + maillanguage.helpChangeItemTitle + '" onclick="return confirm(\'' + maillanguage.helpChangeItemPopup + '\');" href="javascript:core.fn.dynamicMailto(\'' + stocklist.var.inventoryControl + '\',\'' + maillanguage.helpChangeItemSubject + '\',\'' + mailbody + '\')">' + maillanguage.helpChangeItemCaption + '</a> ' +
							'<a title="' + maillanguage.helpDeleteItemTitle + '" onclick="return confirm(\'' + maillanguage.helpDeleteItemPopup + '\');" href="javascript:core.fn.dynamicMailto(\'' + stocklist.var.inventoryControl + '\',\'' + maillanguage.helpDeleteItemSubject + '\',\'' + mailbody + '\')">' + maillanguage.helpDeleteItemCaption + '</a> ' +
							((typeof core.var.modules['ticketorder'] === 'object' && (core.fn.setting.isset('module_ticketorder')?eval(core.fn.setting.get('module_ticketorder')):core.var.modules['ticketorder'].enabledByDefault))
							? '<span style="float:right">' + core.fn.insert.icon('shoppingcart', 'bigger', false, 'onclick="stocklist.api.addToCart(' + value[0] + '); this.parentElement.style.backgroundColor=\'#a3be8c\';"') + '</span>' : '')+
							'</div>';
					});
				} else list = core.fn.lang('errorNothingFound', 'stocklist', query);
				core.fn.stdout('output', list);
				list = '';
			} else {
				return stocklist_data.content.length - 1;
			}
		}
		core.performance.stop('stocklist.fn.input(\'' + value(query) + '\')');
		core.history.write(['stocklist.fn.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('modulestocklist').checked = true; // highlight menu icon
		core.fn.loadScript(core.var.moduleDataDir + 'stocklist.js', 'stocklist.fn.search(\'' + value(query) + '\')');
		core.fn.stdout('input',
			'<form id="search" action="javascript:stocklist.fn.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.fn.lang('inputPlaceholder', 'stocklist') + '" id="itemname" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + ' />' +
			'<span onclick="stocklist.fn.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
			core.fn.insert.select(stocklist.fn.translate.returnselect(), 'stockfilter', 'stockfilter', (core.fn.setting.get('stockfilter') || 'all'), 'onchange="core.fn.setting.set(\'stockfilter\',el(\'stockfilter\').options[el(\'stockfilter\').selectedIndex].value); stocklist.fn.search();"') +
			'<input type="submit" id="submit" value="' + core.fn.lang('formSubmit', 'stocklist') + '" hidden="hidden" /> ' +
			core.fn.insert.icon('websearch', 'bigger', false, 'onclick="window.open(\'https://www.google.de/#q=\'+el(\'itemname\').value,\'_blank\');" title="' + core.fn.lang('webSearchTitle', 'stocklist') + '"') +
			'</form>');
		el('itemname').focus();
		core.fn.stdout('temp', core.fn.lang('useCaseDescription', 'stocklist'));
		core.performance.stop('stocklist.fn.init(\'' + value(query) + '\')');
	},
};