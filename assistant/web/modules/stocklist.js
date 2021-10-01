//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for checking if an item exists in stock
//
//  dependencies:	{core.var.moduleVarDir}stocklist.var.js
//					{core.var.moduleDataDir}stocklist.js
//					stocklist.xlsm
//
//////////////////////////////////////////////////////////////

var stocklist = {
	temp: {},
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				ordered_stocklist_data;
			// clone data object and reset first value to undefined otherwise header terms can be displayed as results
			ordered_stocklist_data = await stocklist.fn.order.prepare('noOrder');
			found = await core.fn.async.smartSearch.lookup(search, ordered_stocklist_data.content, true);
			// i dismiss the idea of displaying found items considering multiple thousands of items in stock
			// show number of matches instead and pass the result as a module call with passed query
			if (found.length) {
				display = '<a href="javascript:stocklist.fn.init(\'' + search.replace(/"/g, '&quot;') + '\')">' + found.length + core.fn.static.lang('apiItemsFound', 'stocklist') + '</a>';
				//add value and relevance
				core.globalSearch.contribute('stocklist', [display, 1]);
			}
			core.performance.stop('stocklist.api.available(\'' + search + '\')');
		},
		addToCart: async (index) => {
			// this only makes sense in case of using the ticketorder-module
			let ticketorderCart = await core.fn.async.memory.read('ticketorderCart');
			core.fn.async.memory.write('ticketorderCart', ticketorderCart + index + ",");
		},
		currentStatus: () => {
			core.performance.stop('stocklist.api.currentStatus()');
		}
	},
	fn: {
		translate: {
			returnselect: () => {
				let output = {};
				Object.keys(stocklist.var.filter()).forEach(function (key) {
					output[key] = [stocklist.var.filter()[key][0], stocklist.var.filter()[key][1]];
				});
				return output;
			},
		},
		search: async (query) => {
			query = query || el('itemname').value;
			core.performance.start('stocklist.fn.input(\'' + value(query) + '\')'); //possible duplicate
			let core_ticketorder = await core.fn.async.memory.read('core_ticketorder'),
				found,
				list = '',
				mailbody,
				maillanguage,
				ordered_stocklist_data,
				tresult;
			await stocklist.fn.order.options();
			if (value(query) !== '') {
				// clone data object and reset first value to undefined otherwise header terms can be displayed as results
				ordered_stocklist_data = await stocklist.fn.order.prepare();
				found = await core.fn.async.smartSearch.lookup(query, ordered_stocklist_data.content, stocklist.var.filter()[el('stockfilter').options[el('stockfilter').selectedIndex].value][2]);
				// check if search matches item-list
				if (found.length > 0) {
					core.fn.async.smartSearch.relevance.init();
					// reminder: keep these kind of assignments out of loops for performance reasons!
					maillanguage = {
						helpChangeItemTitle: core.fn.static.lang('helpChangeItemTitle', 'stocklist'),
						helpDeleteItemTitle: core.fn.static.lang('helpDeleteItemTitle', 'stocklist'),
						helpChangeItemPopup: core.fn.static.lang('helpChangeItemPopup', 'stocklist'),
						helpDeleteItemPopup: core.fn.static.lang('helpDeleteItemPopup', 'stocklist'),
						helpChangeItemSubject: core.fn.static.lang('helpChangeItemSubject', 'stocklist'),
						helpDeleteItemSubject: core.fn.static.lang('helpDeleteItemSubject', 'stocklist'),
						helpChangeItemCaption: core.fn.static.lang('helpChangeItemCaption', 'stocklist'),
						helpDeleteItemCaption: core.fn.static.lang('helpDeleteItemCaption', 'stocklist'),
					};

					function mklink(str) {
						// replaces http://website and c:/folder/file with links
						// given folders may contain whitespaces but are not embedded into text
						return str.toString().replace(/\w{3,}:\/+\S*|\w:\/.+/g, function (l) {
							return '<a href="' + l + '" target="_blank">' + l + '</a>';
						});
					}
					await found.forEach(async (value) => {
						list += core.fn.async.smartSearch.relevance.nextstep(value[1]);
						tresult = '<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand();
						mailbody = '';
						for (let h = 1; h < stocklist.data.content[0].length; h++) { // start from 1 because of assigned id on position 0
							if (ordered_stocklist_data.content[value[0]][h] != '') {
								tresult += '<p><span class="highlight">' + stocklist.data.content[0][h - 1] + ':</span> ' + mklink(ordered_stocklist_data.content[value[0]][h]) + '</p>';
								mailbody += stocklist.data.content[0][h - 1] + ': ' + ordered_stocklist_data.content[value[0]][h] + "<br />";
							}
						}
						list += tresult +
							'<a title="' + maillanguage.helpChangeItemTitle + '" onclick="return confirm(\'' + maillanguage.helpChangeItemPopup + '\');" href="javascript:core.fn.dynamicMailto(\'' + core.var.eMailAddress.inventorycontrol.address + '\',\'' + maillanguage.helpChangeItemSubject + '\',\'' + mailbody + '\')">' + maillanguage.helpChangeItemCaption + '</a> ' +
							'<a title="' + maillanguage.helpDeleteItemTitle + '" onclick="return confirm(\'' + maillanguage.helpDeleteItemPopup + '\');" href="javascript:core.fn.dynamicMailto(\'' + core.var.eMailAddress.inventorycontrol.address + '\',\'' + maillanguage.helpDeleteItemSubject + '\',\'' + mailbody + '\')">' + maillanguage.helpDeleteItemCaption + '</a> ' +
							(ordered_stocklist_data.content[value[0]][0] && (typeof core.var.modules['ticketorder'] === 'object' && (core_ticketorder !== false ? eval(core_ticketorder) : core.var.modules['ticketorder'].enabledByDefault)) ?
								'<span style="float:right">' + core.fn.static.insert.icon('shoppingcart', 'bigger', false, 'onclick="stocklist.api.addToCart(' + ordered_stocklist_data.content[value[0]][0] + '); core.fn.async.growlNotif(core.fn.static.lang(\'articleAdded\',\'stocklist\'))"') + '</span>' : '') +
							'</div>';
					});
				} else list = core.fn.static.lang('errorNothingFound', 'stocklist', query);
				core.fn.async.stdout('output', list);
			} else {
				return stocklist.data.content.length - 1;
			}
			core.performance.stop('stocklist.fn.input(\'' + value(query) + '\')');
			core.history.write(['stocklist.fn.init(\'' + value(query) + '\')']);
		},
		order: {
			options: async () => {
				let option,
					stocklistOrder = await core.fn.async.memory.read('stocklistOrder');
				try {
					if (el('stocklistorderoption0') == null)
						Object.keys(stocklist.data.content[0]).forEach(function (key) {
							option = document.createElement('option');
							option.setAttribute('value', key);
							option.setAttribute('id', 'stocklistorderoption' + key);
							if (stocklistOrder == key)
								option.setAttribute('selected', 'selected');
							var optiontext = document.createTextNode(core.fn.static.lang('orderBy', 'stocklist') + stocklist.data.content[0][key]);
							option.appendChild(optiontext);
							el('stocklistOrder').appendChild(option);
						});
				} catch (e) {
					return
				}
			},
			prepare: async (noOrder) => {
				// clone data object and reset first value to undefined otherwise header terms can be displayed as results
				let data_without_header = JSON.parse(JSON.stringify(stocklist.data)), // copy object to manipulate
					order = await core.fn.async.memory.read('stocklistOrder');
				order = order || 0;
				data_without_header.content[0] = new Array(data_without_header.content[0].length + 1); // "unset" header item
				for (let id = 0; id < data_without_header.content.length; id++) data_without_header.content[id].unshift(id); // assign id to keep even if sorted for shopping cart
				function sortByOrderColumn(a, b) {
					if (a[order] === b[order]) return 0;
					else return (a[order] > b[order]) ? 1 : -1;
				}
				if (order && typeof (noOrder) == 'undefined')
					data_without_header.content = data_without_header.content.sort(sortByOrderColumn);
				return data_without_header;
			}
		},
		init: async (query) => {
			let stocklistFilter = await core.fn.async.memory.read('stocklistFilter'),
				stocklistOrder = await core.fn.async.memory.read('stocklistOrder');
			await core.fn.async.stdout('input',
				'<form id="search" action="javascript:stocklist.fn.search();">' +
				'<input type="text" pattern=".{3,}" required value="' + value(query).replace(/"/g, '&quot;') + '" placeholder="' + core.fn.static.lang('inputPlaceholder', 'stocklist') + '" id="itemname" class="search" />' +
				'<span onclick="stocklist.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
				core.fn.static.insert.select(stocklist.fn.translate.returnselect(), 'stockfilter', 'stockfilter', (stocklistFilter || 'all'), 'onchange="this.selectedIndex == 0 ? core.fn.async.memory.delete(\'stocklistFilter\') : core.fn.async.memory.write(\'stocklistFilter\',el(\'stockfilter\').options[el(\'stockfilter\').selectedIndex].value); stocklist.fn.search();"') +
				core.fn.static.insert.select(null, 'stocklistOrder', 'stocklistOrder', (stocklistOrder || 0), 'onchange="this.selectedIndex == 0 ? core.fn.async.memory.delete(\'stocklistOrder\') : core.fn.async.memory.write(\'stocklistOrder\',el(\'stocklistOrder\').options[el(\'stocklistOrder\').selectedIndex].value); stocklist.fn.search();"') +
				'<input type="submit" id="submit" value="' + core.fn.static.lang('formSubmit', 'stocklist') + '" hidden="hidden" /> ' +
				core.fn.static.insert.icon('websearch', 'bigger', false, 'onclick="window.open(\'https://www.ecosia.org/search?q=\'+el(\'itemname\').value,\'_blank\');" title="' + core.fn.static.lang('webSearchTitle', 'stocklist') + '"') +
				'</form>');
			await stocklist.fn.order.options();
			el('itemname').focus();
			stocklist.temp.overallItems = await stocklist.fn.search();
			core.fn.async.stdout('temp', core.fn.static.lang('useCaseDescription', 'stocklist'));
			core.performance.stop('stocklist.fn.init(\'' + value(query) + '\')');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'stocklist.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'stocklist.data.js');
		}
	}
};