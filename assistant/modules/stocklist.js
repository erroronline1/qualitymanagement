//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for checking if an item exists in stock
//
//  dependencies:	{core.var.moduleVarDir}stocklist.var.js
//					{core.var.moduleDataDir}stocklist.data.stocklist.js
//					{core.var.moduleDataDir}stocklist.data.ticketorder.js
//					{core.var.moduleDir}stocklist.ticketorder.js
//					stocklist.xlsm or stocklist.py
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
		},
		addToCart: async (index) => {
			let stocklistCart = await core.fn.async.memory.read('stocklistCart');
			await core.fn.async.memory.write('stocklistCart', stocklistCart + index + ",");
			core.fn.async.growlNotif(core.fn.static.lang('articleAdded', 'stocklist'));
			await stocklist.fn.getShoppingCart('update');
		},
		currentStatus: async () => {
			let cart = await core.fn.async.memory.read('stocklistCart'),
				display,
				orders = await core.fn.async.memory.read('stocklistAwaitingOrders'),
				ordersrefined = 0;
			cart = cart || '';
			if (cart) {
				cart = cart.split(',');
				cart.pop();
			}
			if (orders) {
				for (let i = 1; i < orders + 1; i++) {
					if (await core.fn.async.memory.read('stocklistAwaitingOrder' + i)) ordersrefined++;
				}
			}
			display = (cart.length ? core.fn.static.lang('currentCart', 'stocklist') + cart.length + '<br />' : '') +
				(ordersrefined > 0 ? core.fn.static.lang('currentOrders', 'stocklist') + ordersrefined + '<br />' : '');
			//add value and relevance
			if (display) core.globalSearch.contribute('stocklist', [display, 1]);
		}
	},
	fn: {
		translate: {
			returnselect: () => { // selection options for displaying results of item queries
				let output = {};
				Object.keys(stocklist.var.filter.stocklist()).forEach(function (key) {
					output[key] = [stocklist.var.filter.stocklist()[key][0], stocklist.var.filter.stocklist()[key][1]];
				});
				return output;
			},
			returnselect2: function () { // selection options for ticket queries
				let output = {};
				Object.keys(stocklist.var.filter.tickets()).forEach(function (key) {
					output[key] = [stocklist.var.filter.tickets()[key][0], stocklist.var.filter.tickets()[key][1]];
				});
				return output;
			},
			newTicket: () => {
				return new Date().getTime().toString(36)
			},
			ticketDate: (ticket) => {
				let date,
					timestamp = parseInt(ticket, 36);
				if (timestamp < new Date(2020, 1, 1, 0, 0, 0, 0)) timestamp = NaN;
				date = new Date(timestamp);
				core.fn.static.popup(isNaN(date.getDate()) ? core.fn.static.lang('ticketTranslateError', 'stocklist') : core.fn.static.lang('ticketTranslate', 'stocklist') + '<br />' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' - ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes());
				return;
			}
		},
		search: async (query = '') => {
			let selectedFilter = core.fn.static.getTab('stocklistFilter');
			if (!selectedFilter) await core.fn.async.memory.delete('stocklistFilter');
			else await core.fn.async.memory.write('stocklistFilter', selectedFilter);

			stocklist.var.disableOutputSelect = true; // (re-)set in case a cart has been displayed

			query = query || 'itemname'.element().value;
			core.history.write('stocklist.fn.init(\'' + query + '\')');
			let found,
				list = '',
				mailbody,
				maillanguage,
				ordered_stocklist_data,
				tresult;
			await stocklist.fn.order.options();
			if (query) {
				// clone data object and reset first value to undefined otherwise header terms can be displayed as results
				ordered_stocklist_data = await stocklist.fn.order.prepare();
				found = await core.fn.async.smartSearch.lookup(query, ordered_stocklist_data.content, stocklist.var.filter.stocklist()[core.fn.static.getTab('stocklistFilter')][2]);
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

					async function mklink(str) {
						// replaces http://website and c:/folder/file with links
						// given folders may contain whitespaces but are not embedded into text
						// str.replace is not capable of async callbacks!!
						str = str.toString();
						let genlink;
						const links = [...str.matchAll(/\w{3,}:\/+\S*/g)],
							files = [...str.matchAll(/(?:^|\W)\w:\/.+/g)];
						if (links.length) str = str.replace(/\w{3,}:\/+\S*/g, function (l) {
							return '<a href="' + l + '" target="_blank">' + l + '</a>'
						})
						if (files.length) {
							await files.forEach(async (value) => {
								genlink = await core.fn.async.file.link(value[0]);
								str = str.replace(value[0], '<a ' + genlink.replace('\\', '\\\\') + '>' + value[0] + '</a>');
							});
						}
						return str;
					}
					for (let item = 0; item < found.length; item++) {
						list += core.fn.async.smartSearch.relevance.nextstep(found[item][1]);
						tresult = '<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand();
						mailbody = '';
						for (let h = 1; h < stocklist.data.stocklist.content[0].length + 1; h++) { // start from 1 because of assigned id on position 0, add one to length because of offset shift
							if (ordered_stocklist_data.content[found[item][0]][h] != '') {
								tresult += '<p><span class="highlight">' + stocklist.data.stocklist.content[0][h - 1] + ':</span> ' + await mklink(ordered_stocklist_data.content[found[item][0]][h]) + '</p>';
								mailbody += stocklist.data.stocklist.content[0][h - 1] + ': ' + ordered_stocklist_data.content[found[item][0]][h] + "<br />";
							}
						}
						list += tresult +
							'<a title="' + maillanguage.helpChangeItemTitle + '" onclick="return confirm(\'' + maillanguage.helpChangeItemPopup + '\');" href="javascript:core.fn.static.dynamicMailto(\'' + core.var.eMailAddress.inventorycontrol.address + '\',\'' + maillanguage.helpChangeItemSubject + '\',\'' + mailbody + '\')">' + maillanguage.helpChangeItemCaption + '</a> ' +
							'<a title="' + maillanguage.helpDeleteItemTitle + '" onclick="return confirm(\'' + maillanguage.helpDeleteItemPopup + '\');" href="javascript:core.fn.static.dynamicMailto(\'' + core.var.eMailAddress.inventorycontrol.address + '\',\'' + maillanguage.helpDeleteItemSubject + '\',\'' + mailbody + '\')">' + maillanguage.helpDeleteItemCaption + '</a> ' +
							'<span style="float:right">' + core.fn.static.insert.icon('shoppingcart', 'bigger', false, 'onclick="stocklist.api.addToCart(' + ordered_stocklist_data.content[found[item][0]][0] + ');"') + '</span>' +
							'</div>';
					}
				} else list = core.fn.static.lang('errorNothingFound', 'stocklist', query);
				core.fn.async.stdout('output', list);
			} else {
				return stocklist.data.stocklist.content.length - 1;
			}
		},
		order: { // order of results, no item request - a language thing
			options: async () => {
				let option,
					stocklistOrder = await core.fn.async.memory.read('stocklistOrder');
				try {
					if ('stocklistorderoption1'.element() == null)
						Object.keys(stocklist.data.stocklist.content[0]).forEach(function (key) {
							keynum = parseInt(key) + 1;
							option = document.createElement('option');
							option.setAttribute('value', keynum);
							option.setAttribute('id', 'stocklistorderoption' + keynum);
							if (stocklistOrder == keynum)
								option.setAttribute('selected', 'selected');
							var optiontext = document.createTextNode(core.fn.static.lang('orderBy', 'stocklist') + stocklist.data.stocklist.content[0][key]);
							option.appendChild(optiontext);
							'stocklistOrder'.element().appendChild(option);
						});
				} catch (e) {
					return
				}
			},
			prepare: async (noOrder) => {
				// clone data object and reset first value to undefined otherwise header terms can be displayed as results
				let data_without_header = JSON.parse(JSON.stringify(stocklist.data.stocklist)), // copy object to manipulate
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
		init: async (query = '') => {
			let stocklistFilter = await core.fn.async.memory.read('stocklistFilter'),
				stocklistOrder = await core.fn.async.memory.read('stocklistOrder');
			await core.fn.async.stdout('input',
				'<form id="search" action="javascript:stocklist.fn.search();">' +
				'<input type="text" pattern=".{3,}" required value="' + query.replace(/"/g, '&quot;') + '" placeholder="' + core.fn.static.lang('inputPlaceholder', 'stocklist') + '" id="itemname" class="search" />' +
				'<span onclick="stocklist.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
				core.fn.static.insert.select(null, 'stocklistOrder', 'stocklistOrder', (stocklistOrder || 0), 'onchange="this.selectedIndex == 0 ? core.fn.async.memory.delete(\'stocklistOrder\') : core.fn.async.memory.write(\'stocklistOrder\',\'stocklistOrder\'.element().options[\'stocklistOrder\'.element().selectedIndex].value); stocklist.fn.search();"') +
				core.fn.static.insert.tabs(stocklist.fn.translate.returnselect(), 'stocklistFilter', (stocklistFilter || 'all'), 'onchange="stocklist.fn.search();"') +
				'<input type="submit" id="submit" value="' + core.fn.static.lang('formSubmit', 'stocklist') + '" hidden="hidden" /> ' +
				'</form>');
			await stocklist.fn.order.options();
			'itemname'.element().focus();
			stocklist.temp.overallItems = await stocklist.fn.search();
			core.fn.async.stdout('temp', core.fn.static.lang('useCaseDescription', 'stocklist') + '<br /><br />' +
				'<div class="items items23" id="stocklistOrderForm" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + await stocklist.fn.orderform() + '</div>' +
				'<div id="currentorders"></div>'+
				'<div class="items items23" id="stocklistOrderForm" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + await stocklist.fn.ticketqueryform() + '</div>'
				);
			if (await core.fn.async.memory.read('stocklistCart')) core.fn.static.toggleHeight('stocklistOrderForm'.element(), true);
			stocklist.fn.getShoppingCart();
			core.fn.async.stdout('currentorders', await stocklist.fn.currentorder.get());

		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'stocklist.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'stocklist.data.stocklist.js');
			await core.fn.async.loadScript(core.var.moduleDir + 'stocklist.order.js');
			await core.fn.async.loadScript(core.var.moduleDir + 'stocklist.ticketorder.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'stocklist.data.ticketorder.js');
		}
	}
};