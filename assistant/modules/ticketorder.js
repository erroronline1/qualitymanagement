//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for generating decent orders via email
//
//  dependencies:	{core.var.moduleVarDir}ticketorder.var.js
//					{core.var.moduleDataDir}ticketorder.js
//					{core.var.moduleDataDir}stocklist.js
//					ticketorder.xlsm
//
//////////////////////////////////////////////////////////////

var ticketorder = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let data_without_header,
				display,
				found;
			//clone data object and reset first value to undefined otherwise header terms can be displayed as results
			data_without_header = JSON.parse(JSON.stringify(ticketorder.data));
			data_without_header.content[0] = new Array(data_without_header.content[0].length);
			found = await core.fn.async.smartSearch.lookup(search, data_without_header.content, true);
			if (found.length) {
				display = '<a href="javascript:ticketorder.fn.init(\'' + search.replace(/"/g, '&quot;') + '\')">' + found.length + core.fn.static.lang('apiItemsFound', 'ticketorder') + '</a>';
				//add value and relevance
				core.globalSearch.contribute('ticketorder', [display, 1]);
			}
		},
		getShoppingCart: async () => {
			let cart = await core.fn.async.memory.read('ticketorderCart'),
				lineindex,
				value;
			if (cart) {
				cart = cart.split(',');
				cart.pop();
				cart.forEach(function (index) {
					lineindex = ticketorder.fn.addrow(true);
					ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
						if (fieldindex < 1) value = index;
						else if (fieldindex in ticketorder.var.apiTranslate.fieldCorrelation) value = stocklist.data.content[index][ticketorder.var.apiTranslate.fieldCorrelation[fieldindex]];
						else value = '';
						el(field[0].replace(/\W/g, '') + lineindex).value = value;
					});
				});
			}
		},
		currentStatus: async () => {
			let cart = await core.fn.async.memory.read('ticketorderCart'),
				display,
				orders = await core.fn.async.memory.read('ticketorderAwaitingOrders');
			cart = cart || '';
			if (cart) {
				cart = cart.split(',');
				cart.pop();
			}
			display = (cart.length ? core.fn.static.lang('currentCart', 'ticketorder') + cart.length + '<br />' : '') +
				(orders ? core.fn.static.lang('currentOrders', 'ticketorder') + orders + '<br />' : '');
			//add value and relevance
			if (display) core.globalSearch.contribute('ticketorder', [display, 1]);
		},
	},
	fn: {
		translate: {
			returnselect: function () {
				let output = {};
				Object.keys(ticketorder.var.filter()).forEach(function (key) {
					output[key] = [ticketorder.var.filter()[key][0], ticketorder.var.filter()[key][1]];
				});
				return output;
			},
			newTicket: function () {
				return new Date().getTime().toString(36)
			},
			ticketDate: function (ticket) {
				let date,
					timestamp = parseInt(ticket, 36);
				if (timestamp < new Date(2020, 1, 1, 0, 0, 0, 0)) timestamp = NaN;
				date = new Date(timestamp);
				core.fn.static.popup(isNaN(date.getDate()) ? core.fn.static.lang('ticketTranslateError', 'ticketorder') : core.fn.static.lang('ticketTranslate', 'ticketorder') + '<br />' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' - ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes());
				return;
			},
		},
		search: async (query = '') => {
			query = query || el('ticketorderquery').value;
			//		var filter = el('ticketorderfilter').selectedIndex || core.fn.setting.get('ticketorderfilter')
			let data_without_header,
				found,
				list = '',
				maillanguage;
			if (ticketorder.data !== undefined) {
				if (query) {
					//clone data object and reset first value to undefined otherwise header terms can be displayed as results
					data_without_header = JSON.parse(JSON.stringify(ticketorder.data));
					data_without_header.content[0] = new Array(data_without_header.content[0].length);
					found = await core.fn.async.smartSearch.lookup(query, data_without_header.content,
						ticketorder.var.filter()[el('ticketorderfilter').options[el('ticketorderfilter').selectedIndex].value][2]);
					// check if search matches item-list
					if (found.length > 0) {
						core.fn.async.smartSearch.relevance.init();
						//reminder: keep these kind of assignments out of loops for performance reasons!
						maillanguage = {
							queryMailSubject: core.fn.static.lang('queryMailSubject', 'ticketorder'),
							queryMailSubject: core.fn.static.lang('queryMailSubject', 'ticketorder'),
						};
						found.forEach(function (value) {
							list += core.fn.async.smartSearch.relevance.nextstep(value[1]);
							var tresult = '<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand(),
								mailbody = '';
							for (var h = 0; h < ticketorder.data.content[0].length; h++) {
								if (ticketorder.data.content[value[0]][h] != '') {
									tresult += '<p><span class="highlight">' + ticketorder.data.content[0][h] + ':</span> ' + ticketorder.data.content[value[0]][h] + '</p>';
									mailbody += ticketorder.data.content[0][h] + ': ' + ticketorder.data.content[value[0]][h] + "<br />";
								}
							}
							var subject = maillanguage.queryMailSubject + ticketorder.data.content[value[0]][0]
							list += tresult +
								'<a title="' + subject + '" href="javascript:core.fn.static.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'' + subject + '\',\'' + mailbody + '\')">' + subject + '</a> ' +
								'</div>';
						});
					} else list = core.fn.static.lang('errorNothingFound', 'ticketorder', query);
					core.fn.async.stdout('output', list);
				} else {
					return ticketorder.data.content.length - 1;
				}
			}
			ticketorder.var.disableOutputSelect = true;
			core.history.write('ticketorder.fn.init(\'' + query + '\')');
		},
		mkform: async () => {
			let form = core.fn.static.lang('newOrder', 'ticketorder'),
				ordererCostUnitList = ticketorder.var.orderCostUnit.map(function (x) {
					return [x, x]
				}),
				ordererDeptList = ticketorder.var.orderDept.map(function (x) {
					return [x, x]
				}),
				ticketorderAwaitingOrders = await core.fn.async.memory.read('ticketorderAwaitingOrders'),
				ticketorderCart = await core.fn.async.memory.read('ticketorderCart'),
				ticketorderContact = await core.fn.async.memory.read('ticketorderContact'),
				ticketorderCostUnit = await core.fn.async.memory.read('ticketorderCostUnit'),
				ticketorderDept = await core.fn.async.memory.read('ticketorderDept');

			ticketorder.var.orderrows = -1;
			if (!ticketorderAwaitingOrders) {
				ticketorder.var.newTicket = ticketorder.fn.translate.newTicket();
				core.fn.async.memory.write('ticketorderCurrentTicket', ticketorder.var.newTicket);
			}

			ordererDeptList.unshift(['', core.fn.static.lang('ordererDept', 'ticketorder')]);
			ordererCostUnitList.unshift(['', core.fn.static.lang('ordererCostUnit', 'ticketorder')]);
			if (ticketorderCart) form += '<input type="button" id="deleteCart" style="float:right; margin:0 .25em" value="' + core.fn.static.lang('deleteCart', 'ticketorder') + '" onclick="core.fn.async.memory.delete(\'ticketorderCart\'); this.value=\'' + core.fn.static.lang('deleteCartDeleted', 'ticketorder') + '\'; this.disabled=true; core.fn.async.growlNotif(\'' + core.fn.static.lang('deleteCartDeleted', 'ticketorder') + '\');" />';
			if (ticketorderAwaitingOrders) form += '<input type="button" id="deletecurrentOrder" style="float:right; margin:0 .25em" value="' + core.fn.static.lang('deleteCurrentOrder', 'ticketorder') + '" onclick="ticketorder.fn.currentorder.clear(); this.value=\'' + core.fn.static.lang('deleteCurrentOrderDeleted', 'ticketorder') + '\'; this.disabled=true;" />';
			form += '<form action="javascript:ticketorder.fn.currentorder.add()">';
			form += '<br /><input type="text" id="orderer" required placeholder="' + core.fn.static.lang('orderer', 'ticketorder') + '" title="' + core.fn.static.lang('orderer', 'ticketorder') + '" /> ';
			form += core.fn.static.insert.select(ordererDeptList, 'ordererDept', 'ordererDept', ticketorderDept, 'required title="' + core.fn.static.lang('ordererDept', 'ticketorder') + '"');
			form += core.fn.static.insert.select(ordererCostUnitList, 'ordererCostUnit', 'ordererCostUnit', ticketorderCostUnit, 'required title="' + core.fn.static.lang('ordererCostUnit', 'ticketorder') + '"');
			form += ' <input type="text" id="ordererContact" required placeholder="' + core.fn.static.lang('ordererContact', 'ticketorder') + '" title="' + core.fn.static.lang('ordererContact', 'ticketorder') + '" value="' + (ticketorderContact || '') + '" /> ';
			form += '<br style="clear:both" />';
			form += core.fn.static.insert.radio(core.fn.static.lang('notcommissioned', 'ticketorder'), 'commissioned', 'notcommissioned', true, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = el(\'orderReferralTicket\').required = false"', '') + '<br />';
			form += core.fn.static.insert.radio(core.fn.static.lang('commissioned', 'ticketorder'), 'commissioned', 'commissioned', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = true; el(\'orderReferralTicket\').required = false"', '') + '<br />';
			form += core.fn.static.insert.radio(core.fn.static.lang('retour', 'ticketorder'), 'commissioned', 'retour', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = false; el(\'orderReferralTicket\').required = true"', '') + '<br />';
			form += core.fn.static.insert.radio(core.fn.static.lang('service', 'ticketorder'), 'commissioned', 'service', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = false; el(\'orderReferralTicket\').required = true"', '');
			form += '<br /><input type="text" id="orderRcptName" placeholder="' + core.fn.static.lang('orderRcptName', 'ticketorder') + '" title="' + core.fn.static.lang('orderRcptName', 'ticketorder') + '" onchange="el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = Boolean(el(\'orderRcptName\').value.length);" />' +
				'<input type="date" id="orderRcptDob" placeholder="' + core.fn.static.lang('orderRcptDob', 'ticketorder') + '" title="' + core.fn.static.lang('orderRcptDob', 'ticketorder') + '" />' +
				'<input type="text" id="orderRcptFlag" placeholder="' + core.fn.static.lang('orderRcptFlag', 'ticketorder') + '" title="' + core.fn.static.lang('orderRcptFlag', 'ticketorder') + '" />';
			form += '<br style="clear:both" /><input type="text" id="orderReferralTicket" placeholder="' + core.fn.static.lang('orderReferralTicket', 'ticketorder') + '" title="' + core.fn.static.lang('orderReferralTicket', 'ticketorder') + '" /> ';
			form += '<br style="clear:both" /><input type="date" id="orderNeededBy" placeholder="' + core.fn.static.lang('orderNeededBy', 'ticketorder') + '" title="' + core.fn.static.lang('orderNeededBy', 'ticketorder') + '" /> ';
			form += '<br style="clear:both" /><table id="ordertable"><tr>';
			ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
				form += '<td';
				if (index < 1) form += ' style="display:none"'; // hide id
				form += '>' + field[0] + '</td>';
			});
			form += '</tr></table>';
			form += '<input type="button" value="' + core.fn.static.lang('orderAdd', 'ticketorder') + '" onclick="ticketorder.fn.addrow()" />' +
				'<br /><br /><textarea id="orderNote" rows="5" style="width:90%" placeholder="' + core.fn.static.lang('orderNote', 'ticketorder') + '"></textarea>' +
				'<br /><br /><input type="submit" id="submitOrder" disabled value="' + core.fn.static.lang('orderSubmit', 'ticketorder') + '" />';
			form += '<hr /><input type="button" id="confirmOrder" value="' + core.fn.static.lang('orderConfirm', 'ticketorder') + '" onclick=\'ticketorder.fn.drm.confirmform()\' />' +
				'<br /><br /><a id="mailto" href="javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'\')">' +
				core.fn.static.insert.icon('email') + core.fn.static.lang('openMailApp', 'ticketorder') + '</a><br /><br />';
			return form;
		},
		addrow: function (conditionalDisabled) {
			let cellContent,
				disabledPreset,
				table = el('ordertable'),
				td,
				tr = document.createElement('tr');
			ticketorder.var.orderrows++;
			ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
				td = tr.appendChild(document.createElement('td'));
				td.style.cssText = 'width:' + field[1];
				if (index < 1) td.style.cssText += '; display:none'; // hide id
				cellContent = '<input style="width:100%;" type="text" id="' + field[0].replace(/\W/g, '') + ticketorder.var.orderrows + '" required placeholder="' + field[0] + '" ';
				//prefill with ticket or copy from former row, disable conditional
				disabledPreset = field[2];
				if (disabledPreset === true || (disabledPreset === 2 && conditionalDisabled)) cellContent += ' disabled'
				if (ticketorder.var.orderrows > 0 && ticketorder.var.orderFieldsToCopy[core.var.selectedLanguage].indexOf(field[0]) > -1 && el(field[0].replace(/\W/g, '') + (ticketorder.var.orderrows - 1))) cellContent += ' value="' + el(field[0].replace(/\W/g, '') + (ticketorder.var.orderrows - 1)).value + '"';
				cellContent += ' />';
				td.innerHTML = cellContent
			});
			td = tr.appendChild(document.createElement('td'));
			td.innerHTML = core.fn.static.insert.icon('delete', 'bigger rownumberingpseudoclass', false, 'lineexists' + (ticketorder.var.orderrows) + ' onclick="ticketorder.fn.deleterow(' + (ticketorder.var.orderrows) + ')"');
			table.appendChild(tr);
			el('submitOrder').disabled = false;
			return ticketorder.var.orderrows;
		},
		deleterow: function (itemindex) {
			let rows = document.getElementsByClassName('rownumberingpseudoclass');
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].hasAttribute('lineexists' + itemindex)) {
					el('ordertable').deleteRow(i + 1);
					break;
				}
			}
		},
		currentorder: {
			add: async () => {
				//prepare order object, add properties according to form fields and language chunks
				let currentorder,
					curval,
					field,
					id,
					items,
					ordernum,
					orderobj = {},
					neworder,
					wildcard = false;
				orderobj.subject = core.fn.static.lang('orderMailSubject', 'ticketorder') + el('ordererDept').value + ' | ' + el('orderer').value;
				['notcommissioned', 'commissioned', 'retour', 'service'].forEach(function (field) {
					if (el(field).checked) orderobj.type = core.fn.static.lang(field, 'ticketorder');
				});
				['orderRcptName', 'orderRcptDob', 'orderRcptFlag', 'orderer', 'ordererDept', 'ordererCostUnit', 'ordererContact', 'orderReferralTicket', 'orderNeededBy'].forEach(function (field) {
					if (el(field).value) orderobj[field] = el(field).value;
				});
				if (el('orderNote').value) orderobj.orderNote = el('orderNote').value;
				orderobj.items = [];
				// iterate through order form for item descriptions
				for (var i = 0; i < ticketorder.var.orderrows + 1; i++) {
					items = [];
					if (el(ticketorder.var.orderFields[core.var.selectedLanguage][0][0].replace(/\W/g, '') + i)) {
						for (let index = 0; index < ticketorder.var.orderFields[core.var.selectedLanguage].length; index++) {
							field = ticketorder.var.orderFields[core.var.selectedLanguage][index]
							id = el(ticketorder.var.orderFields[core.var.selectedLanguage][0][0].replace(/\W/g, '') + i).value || '';
							curval = el(field[0].replace(/\W/g, '') + i).value || '';
							if (!id || (id && index === 0) || (id && !field[2])) items.push(curval); // if item id exists skip disabled and conditional formfields to limit data usage
							if (ticketorder.var.apiTranslate.orderNumberWildcard && curval.indexOf(ticketorder.var.apiTranslate.orderNumberWildcard) > -1) wildcard = true;
						}
					}
					if (items.length) orderobj.items.push(items);
				}
				if (wildcard) {
					core.fn.static.popup(core.fn.static.lang('orderNumberWildcard', 'ticketorder'));
					return;
				}

				core.fn.async.memory.write('ticketorderDept', el('ordererDept').selectedIndex);
				core.fn.async.memory.write('ticketorderCostUnit', el('ordererCostUnit').selectedIndex);
				core.fn.async.memory.write('ticketorderContact', el('ordererContact').value);
				ordernum = await core.fn.async.memory.read('ticketorderAwaitingOrders');
				ordernum = eval(ordernum) + 1;
				neworder = await core.fn.async.memory.write('ticketorderAwaitingOrder' + ordernum, JSON.stringify(orderobj), core.fn.static.lang('orderStorageError', 'ticketorder'));
				if (neworder) {
					core.fn.async.memory.write('ticketorderAwaitingOrders', ordernum);
					currentorder = await ticketorder.fn.currentorder.get();
					core.fn.async.stdout('output', currentorder);
					el('output').scrollTop = el('output').scrollHeight;
					core.fn.async.memory.delete('ticketorderCart')
					if (el('deleteCart')) el('deleteCart').style.display = 'none';
				}
			},
			get: async () => {
				let currentTicket = await core.fn.async.memory.read('ticketorderCurrentTicket'),
					ordernum = await core.fn.async.memory.read('ticketorderAwaitingOrders'),
					orderobj,
					orders,
					output = '',
					pos,
					value;
				if (ordernum) {
					for (let o = 0; o < ordernum; o++) {
						orders = await core.fn.async.memory.read('ticketorderAwaitingOrder' + (o + 1))
						orders = orders || '';
						if (orders.length) {
							// caution: order/table layout dependent of excel-file !!
							orderobj = JSON.parse(orders);
							output += orderobj.subject + '<br /><br />';
							output += '<i>' + orderobj.type + '</i><br /><br />'
							output += core.fn.static.lang('captionCheckTicket', 'ticketorder') + ': ' + currentTicket + '<br />';
							Object.keys(orderobj).forEach(function (key) {
								if (['subject', 'type', 'items'].indexOf(key) === -1) {
									output += core.fn.static.lang(key, 'ticketorder') + ": " + orderobj[key] + '<br />';
								}
							});
							output += '<br /><table border=1 cellpadding=5 cellspacing=0><tr>';
							ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
								output += '<th';
								output += '>' + field[0] + '</th>';
							});
							output += '</tr>';
							for (let i = 0; i < orderobj.items.length; i++) {
								output += '<tr>';
								pos = 0;
								if (orderobj.items[i].length < ticketorder.var.orderFields[core.var.selectedLanguage].length) {
									ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
										value;
										if (fieldindex in ticketorder.var.apiTranslate.fieldCorrelation) value = stocklist.data.content[orderobj.items[i][0]][ticketorder.var.apiTranslate.fieldCorrelation[fieldindex]];
										else {
											value = orderobj.items[i][pos];
											pos++
										}
										output += '<td';
										output += '>' + value + '</td>';
									});
								} else {
									for (let index = 0; index < orderobj.items[i].length; index++) {
										output += '<td';
										output += '>' + orderobj.items[i][index] + '</td>';
									}
								}
								output += '</tr>';
							}
							output += '</table><br /><br />';
						}
					}
				}
				return output;
			},
			clear: async () => {
				let ordernum = await core.fn.async.memory.read('ticketorderAwaitingOrders');
				if (ordernum) {
					for (let i = 0; i < ordernum; i++) {
						core.fn.async.memory.delete('ticketorderAwaitingOrder' + (i + 1));
					}
				}
				core.fn.async.memory.delete('ticketorderAwaitingOrders');
				core.fn.async.growlNotif(core.fn.static.lang('deleteCurrentOrderDeleted', 'ticketorder'));
			}
		},
		drm: {
			confirmform: async () => {
				let form,
					ticketorderAwaitingOrders = await core.fn.async.memory.read('ticketorderAwaitingOrders');
				if (!ticketorderAwaitingOrders) return;
				form = '<form onsubmit="ticketorder.fn.drm.check(); return false;">' + core.fn.static.lang('settingKeyName') + '<br /><input type="text" id="orderconfirmname" autofocus /><br /><br />' +
					core.fn.static.lang('settingKeyPassword0').split(',')[0] + '<br /><input type="password" id="orderconfirmpassword0" /><br /><br />' +
					'<br /><input type="submit" value="' + core.fn.static.lang('drmConfirmationSubmit') + '" onclick="ticketorder.fn.drm.check()" />' +
					'<br /><br /><span id="keyresult"></span></form>';
				core.fn.static.popup(form);
			},
			check: async () => {
				if (el('orderconfirmname').value && el('orderconfirmpassword0').value && core.fn.static.drm.searchHash(core.fn.static.drm.table('orderApproval'), core.fn.static.drm.createHash(el('orderconfirmname').value + el('orderconfirmpassword0').value))) {
					let confirmedOutput = await ticketorder.fn.currentorder.get(),
						currentTicket = await core.fn.async.memory.read('ticketorderCurrentTicket'),
						token = core.fn.static.drm.encryptToken(currentTicket, el('orderconfirmname').value, el('orderconfirmpassword0').value) || 'unauthorized';
					confirmedOutput = '<i>' +
						core.fn.static.lang('orderConfirmed', 'ticketorder', [currentTicket, token]) +
						'</i><br /><br />' + confirmedOutput;
					core.fn.async.stdout('output', confirmedOutput);
					el('mailto').href = 'javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'' + core.fn.static.lang('orderMailSubject', 'ticketorder') + el('ordererDept').value + ' | ' + el('orderer').value + '\')';
					el('output').scrollTop = 0;
					ticketorder.var.disableOutputSelect = false;
					core.fn.static.popup();
				} else {
					el('keyresult').innerHTML = core.fn.static.lang('drmConfirmationError');
				}
			},
			verifytoken: function () {
				let form = core.fn.static.lang('captionCheckTicket', 'ticketorder') + '<br /><input type="text" id="checkTicket" autofocus /><br /><br />' +
					core.fn.static.lang('captionCheckCode', 'ticketorder') + '<br /><input type="text" id="checkCode" /><br /><br />' +
					'<br /><input type="button" value="' + core.fn.static.lang('buttonVerifyToken', 'ticketorder') + '" onclick="' +
					'var decrypted=core.fn.static.drm.decryptToken(core.fn.static.drm.table(\'orderApproval\'), el(\'checkTicket\').value.trim(), el(\'checkCode\').value.trim());' +
					'if (!decrypted)' +
					'el(\'keycheckresult\').innerHTML=\'' + core.fn.static.lang('failureCheckCode', 'ticketorder') + '\';' +
					'else el(\'keycheckresult\').innerHTML=\'' +
					core.fn.static.lang('successCheckCode', 'ticketorder') + '\' + decrypted;' +
					'" />' +
					'<br /><br /><span id="keycheckresult"></span>';
				core.fn.static.popup(form);
			}
		},
		init: async (query = '') => {
			let input,
				ticketorderfilter = await core.fn.async.memory.read('ticketorderfilter');
			if (ticketorder.data !== undefined) {
				input = '<form id="search" action="javascript:ticketorder.fn.search();">' +
					'<input type="text" pattern=".{3,}" required value="' + query.replace(/"/g, '&quot;') + '" placeholder="' + core.fn.static.lang('formErpInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search" />' +
					'<span onclick="ticketorder.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
					core.fn.static.insert.select(ticketorder.fn.translate.returnselect(), 'ticketorderfilter', 'ticketorderfilter', (ticketorderfilter || 'nofilter'), 'onchange="core.fn.async.memory.write(\'ticketorderfilter\',el(\'ticketorderfilter\').options[el(\'ticketorderfilter\').selectedIndex].value); ticketorder.fn.search();"') +
					core.fn.static.insert.icon('translate', 'bigger', false, 'title="' + core.fn.static.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"') +
					core.fn.static.insert.icon('key', 'bigger', false, 'title="' + core.fn.static.lang('buttonVerifyToken', 'ticketorder') + '" onclick="ticketorder.fn.drm.verifytoken();"') +
					'<input type="submit" id="name" value="' + core.fn.static.lang('formSubmit', 'ticketorder') + '" hidden="hidden" /> ' +
					'</form>';
			} else {
				input = '<input type="text" pattern=".{3,}" required value="' + query + '" placeholder="' + core.fn.static.lang('formInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search"  ' + (query !== '' ? 'value="' + query + '"' : '') + '  />' +
					'<span class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
					core.fn.static.insert.icon('translate', 'bigger', false, 'title="' + core.fn.static.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"');
			}
			core.fn.async.stdout('input', input);
			core.fn.async.stdout('temp', await ticketorder.fn.mkform());
			ticketorder.api.getShoppingCart();
			if (query) ticketorder.fn.search(query);
			else core.fn.async.stdout('output', await ticketorder.fn.currentorder.get());
			core.history.write('ticketorder.fn.init(\'' + query + '\')');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'ticketorder.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'ticketorder.data.js', '');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'stocklist.data.js');
		}
	}
};