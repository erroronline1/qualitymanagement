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

if (typeof ticketorder === 'undefined') var ticketorder = {};

ticketorder.api = {
	available: function (search) {
		core.fn.loadScript(core.var.moduleDataDir + 'ticketorder.js',
			'ticketorder.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('ticketorder.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var display;
		if (typeof ticketorder_data !== 'undefined') {
			//clone data object and reset first value to undefined otherwise header terms can be displayed as results
			var data_without_header = JSON.parse(JSON.stringify(ticketorder_data));
			data_without_header.content[0] = new Array(data_without_header.content[0].length);
			var found = core.fn.smartSearch.lookup(search, data_without_header.content, true);
			//the following would return the found items, but i decided otherwise in this case
			//found.forEach(function (value) {
			//	display=display:ticketorder_data.content[value[0]][1] + ' ' +ticketorder_data.content[value[0]][2] + ' '+ ticketorder_data.content[value[0]][3];
			//	globalSearch.contribute('ticketorder', display);
			//});
			if (found.length) {
				display = '<a href="javascript:core.fn.loadScript(\'modules/ticketorder.js\',\'ticketorder.fn.init(\\\'' + search.replace(/"/g, '&quot;') + '\\\')\')">' + found.length + core.fn.lang('apiItemsFound', 'ticketorder') + '</a>';
				//add value and relevance
				globalSearch.contribute('ticketorder', [display, 1]);
			}
			core.performance.stop('ticketorder.api.processAfterImport(\'' + search + '\')');
		}
	},
	getShoppingCart: function () {
		var cart = core.fn.setting.get('moduleExchangeTicketorder');
		if (cart) {
			cart = cart.split(',');
			cart.pop();
			cart.forEach(function (index) {
				var lineindex = ticketorder.fn.addrow(true);
				ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
					var value;
					if (fieldindex < 1) value = index;
					else if (fieldindex in ticketorder.var.apiTranslate.fieldCorrelation) value = stocklist_data.content[index][ticketorder.var.apiTranslate.fieldCorrelation[fieldindex]];
					else value = '';
					el(field[0].replace(/\W/g, '') + lineindex).value = value;
				});
			});
		}
	},
};
ticketorder.fn = {
	translate: {
		returnselect: function () {
			var output = new Object();
			Object.keys(ticketorder.var.filter()).forEach(function (key) {
				output[key] = [ticketorder.var.filter()[key][0], ticketorder.var.filter()[key][1]];
			});
			return output;
		},
		newTicket: function () {
			return new Date().getTime().toString(36)
		},
		ticketDate: function (ticket) {
			var timestamp = parseInt(ticket, 36);
			if (timestamp < new Date(2020, 1, 1, 0, 0, 0, 0)) timestamp = NaN;
			var date = new Date(timestamp);
			core.fn.popup(isNaN(date.getDate()) ? core.fn.lang('ticketTranslateError', 'ticketorder') : core.fn.lang('ticketTranslate', 'ticketorder') + '<br />' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' - ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes());
			return;
		},
	},
	search: function (query) {
		query = query || el('ticketorderquery').value;
		//		var filter = el('ticketorderfilter').selectedIndex || core.fn.setting.get('ticketorderfilter')
		core.performance.start('ticketorder.fn.input(\'' + value(query) + '\')'); //possible duplicate
		var list = '';
		if (typeof ticketorder_data !== 'undefined') {
			if (value(query) !== '') {
				//clone data object and reset first value to undefined otherwise header terms can be displayed as results
				var data_without_header = JSON.parse(JSON.stringify(ticketorder_data));
				data_without_header.content[0] = new Array(data_without_header.content[0].length);
				var found = core.fn.smartSearch.lookup(query, data_without_header.content,
					ticketorder.var.filter()[el('ticketorderfilter').options[el('ticketorderfilter').selectedIndex].value][2]);
				// check if search matches item-list
				if (found.length > 0) {
					core.fn.smartSearch.relevance.init();
					//reminder: keep these kind of assignments out of loops for performance reasons!
					var maillanguage = {
						queryMailSubject: core.fn.lang('queryMailSubject', 'ticketorder'),
						queryMailSubject: core.fn.lang('queryMailSubject', 'ticketorder'),
					};
					found.forEach(function (value) {
						list += core.fn.smartSearch.relevance.nextstep(value[1]);
						var tresult = '<div class="items items71" onclick="core.fn.toggleHeight(this)">' + core.fn.insert.expand(),
							mailbody = '';
						for (var h = 0; h < ticketorder_data.content[0].length; h++) {
							if (ticketorder_data.content[value[0]][h] != '') {
								tresult += '<p><span class="highlight">' + ticketorder_data.content[0][h] + ':</span> ' + ticketorder_data.content[value[0]][h] + '</p>';
								mailbody += ticketorder_data.content[0][h] + ': ' + ticketorder_data.content[value[0]][h] + "<br />";
							}
						}
						var subject = maillanguage.queryMailSubject + ticketorder_data.content[value[0]][0]
						list += tresult +
							'<a title="' + subject + '" href="javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'' + subject + '\',\'' + mailbody + '\')">' + subject + '</a> ' +
							'</div>';
					});
				} else list = core.fn.lang('errorNothingFound', 'ticketorder', query);
				core.fn.stdout('output', list);
				list = '';
			} else {
				return ticketorder_data.content.length - 1;
			}
		}
		ticketorder.var.disableOutputSelect = true;
		core.performance.stop('ticketorder.fn.input(\'' + value(query) + '\')');
		core.history.write(['ticketorder.fn.init(\'' + value(query) + '\')']);
	},
	mkform: function () {
		ticketorder.var.orderrows = -1;
		if (!core.fn.setting.get('ticketorderAwaitingOrders')) core.fn.setting.set('ticketorderCurrentTicket', ticketorder.fn.translate.newTicket());
		ticketorder.var.newTicket = core.fn.setting.get('ticketorderCurrentTicket');
		var form = core.fn.lang('newOrder', 'ticketorder'),
			ordererDeptList = ticketorder.var.orderDept.map(function (x) {
				return [x, x]
			}),
			ordererCostUnitList = ticketorder.var.orderCostUnit.map(function (x) {
				return [x, x]
			});
		ordererDeptList.unshift(['', core.fn.lang('ordererDept', 'ticketorder')]);
		ordererCostUnitList.unshift(['', core.fn.lang('ordererCostUnit', 'ticketorder')]);
		if (core.fn.setting.get('moduleExchangeTicketorder')) form += '<input type="button" id="deleteCart" style="float:right; margin:0 .25em" value="' + core.fn.lang('deleteCart', 'ticketorder') + '" onclick="core.fn.setting.unset(\'moduleExchangeTicketorder\'); this.value=\'' + core.fn.lang('deleteCartDeleted', 'ticketorder') + '\'; this.disabled=true; core.fn.growlNotif(\'' + core.fn.lang('deleteCartDeleted', 'ticketorder') + '\');" />';
		if (core.fn.setting.get('ticketorderAwaitingOrders')) form += '<input type="button" id="deletecurrentOrder" style="float:right; margin:0 .25em" value="' + core.fn.lang('deleteCurrentOrder', 'ticketorder') + '" onclick="ticketorder.fn.currentorder.clear(); this.value=\'' + core.fn.lang('deleteCurrentOrderDeleted', 'ticketorder') + '\'; this.disabled=true;" />';
		form += '<form action="javascript:ticketorder.fn.currentorder.add()">';
		form += '<br /><input type="text" id="orderer" required placeholder="' + core.fn.lang('orderer', 'ticketorder') + '" title="' + core.fn.lang('orderer', 'ticketorder') + '" /> ';
		form += core.fn.insert.select(ordererDeptList, 'ordererDept', 'ordererDept', core.fn.setting.get('ticketorderDept'), 'required title="' + core.fn.lang('ordererDept', 'ticketorder') + '"');
		form += core.fn.insert.select(ordererCostUnitList, 'ordererCostUnit', 'ordererCostUnit', core.fn.setting.get('ticketorderCostUnit'), 'required title="' + core.fn.lang('ordererCostUnit', 'ticketorder') + '"');
		form += ' <input type="text" id="ordererContact" required placeholder="' + core.fn.lang('ordererContact', 'ticketorder') + '" title="' + core.fn.lang('ordererContact', 'ticketorder') + '" value="' + (core.fn.setting.get('ticketorderContact') || '') + '" /> ';
		form += '<br style="clear:both" />';
		form += core.fn.insert.radio(core.fn.lang('notcommissioned', 'ticketorder'), 'commissioned', 'notcommissioned', true, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = el(\'orderReferralTicket\').required = false"', '') + '<br />';
		form += core.fn.insert.radio(core.fn.lang('commissioned', 'ticketorder'), 'commissioned', 'commissioned', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = true; el(\'orderReferralTicket\').required = false"', '') + '<br />';
		form += core.fn.insert.radio(core.fn.lang('retour', 'ticketorder'), 'commissioned', 'retour', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = false; el(\'orderReferralTicket\').required = true"', '') + '<br />';
		form += core.fn.insert.radio(core.fn.lang('service', 'ticketorder'), 'commissioned', 'service', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = false; el(\'orderReferralTicket\').required = true"', '');
		form += '<br /><input type="text" id="orderRcptName" placeholder="' + core.fn.lang('orderRcptName', 'ticketorder') + '" title="' + core.fn.lang('orderRcptName', 'ticketorder') + '" onchange="el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = Boolean(el(\'orderRcptName\').value.length);" />' +
			'<input type="date" id="orderRcptDob" placeholder="' + core.fn.lang('orderRcptDob', 'ticketorder') + '" title="' + core.fn.lang('orderRcptDob', 'ticketorder') + '" />' +
			'<input type="text" id="orderRcptFlag" placeholder="' + core.fn.lang('orderRcptFlag', 'ticketorder') + '" title="' + core.fn.lang('orderRcptFlag', 'ticketorder') + '" />';
		form += '<br style="clear:both" /><input type="text" id="orderReferralTicket" placeholder="' + core.fn.lang('orderReferralTicket', 'ticketorder') + '" title="' + core.fn.lang('orderReferralTicket', 'ticketorder') + '" /> ';
		form += '<br style="clear:both" /><input type="date" id="orderNeededBy" placeholder="' + core.fn.lang('orderNeededBy', 'ticketorder') + '" title="' + core.fn.lang('orderNeededBy', 'ticketorder') + '" /> ';
		form += '<br style="clear:both" /><table id="ordertable"><tr>';
		ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
			form += '<td';
			if (index < 1) form += ' style="display:none"'; // hide id
			form += '>' + field[0] + '</td>';
		});
		form += '</tr></table>';
		form += '<input type="button" value="' + core.fn.lang('orderAdd', 'ticketorder') + '" onclick="ticketorder.fn.addrow()" />' +
			'<br /><br /><textarea id="orderNote" rows="5" style="width:90%" placeholder="' + core.fn.lang('orderNote', 'ticketorder') + '"></textarea>' +
			'<br /><br /><input type="submit" id="submitOrder" disabled value="' + core.fn.lang('orderSubmit', 'ticketorder') + '" />';

		form += '<hr /><input type="button" id="confirmOrder" value="' + core.fn.lang('orderConfirm', 'ticketorder') + '" onclick=\'ticketorder.fn.drm.confirmform()\' />' +
			'<br /><br /><a id="mailto" href="javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'\')">' +
			core.fn.insert.icon('email') + core.fn.lang('openMailApp', 'ticketorder') + '</a><br /><br />';

		return form;
	},
	addrow: function (conditionalDisabled) {
		var table = el('ordertable'),
			tr = document.createElement('tr');
		ticketorder.var.orderrows++;
		ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
			var td = tr.appendChild(document.createElement('td'));
			td.style.cssText = 'width:' + field[1];
			if (index < 1) td.style.cssText += ';display:none'; // hide id
			var cellContent = '<input style="width:100%;" type="text" id="' + field[0].replace(/\W/g, '') + ticketorder.var.orderrows + '" required placeholder="' + field[0] + '" ';
			//prefill with ticket or copy from former row, disable conditional
			var disabledPreset = ticketorder.var.orderFields[core.var.selectedLanguage][index][2];
			if (disabledPreset === true || (disabledPreset === 2 && conditionalDisabled)) cellContent += ' disabled'
			if (ticketorder.var.orderrows > 0 && ticketorder.var.orderFieldsToCopy[core.var.selectedLanguage].indexOf(field[0]) > -1 && el(field[0].replace(/\W/g, '') + (ticketorder.var.orderrows - 1))) cellContent += 'value="' + el(field[0].replace(/\W/g, '') + (ticketorder.var.orderrows - 1)).value + '"';
			cellContent += ' />';
			td.innerHTML = cellContent
		});
		var td = tr.appendChild(document.createElement('td'));
		td.innerHTML = core.fn.insert.icon('delete', 'bigger rownumberingpseudoclass', false, 'lineexists' + (ticketorder.var.orderrows) + ' onclick="ticketorder.fn.deleterow(' + (ticketorder.var.orderrows) + ')"');
		table.appendChild(tr);
		el('submitOrder').disabled = false;
		return ticketorder.var.orderrows;
	},
	deleterow: function (itemindex) {
		var rows = document.getElementsByClassName('rownumberingpseudoclass');
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].hasAttribute('lineexists' + itemindex)) {
				el('ordertable').deleteRow(i + 1);
				break;
			}
		}
	},
	currentorder: {
		add: function () {
			//prepare order object, add properties according to form fields and language chunks
			var orderobj = {}
			orderobj.subject = core.fn.lang('orderMailSubject', 'ticketorder') + el('ordererDept').value + ' | ' + el('orderer').value;
			orderobj.captionCheckTicket = ticketorder.var.newTicket;
			['notcommissioned', 'commissioned', 'retour', 'service'].forEach(function (field) {
				if (el(field).checked) orderobj.type = core.fn.lang(field, 'ticketorder');
			});
			['orderRcptName', 'orderRcptDob', 'orderRcptFlag', 'orderer', 'ordererDept', 'ordererCostUnit', 'ordererContact', 'orderReferralTicket', 'orderNeededBy'].forEach(function (field) {
				if (el(field).value) orderobj[field] = el(field).value;
			});
			if (el('orderNote').value) orderobj.orderNote = el('orderNote').value;
			orderobj.items = [];
			var wildcard = false,
				curval;
			// iterate through order form for item descriptions
			for (var i = 0; i < ticketorder.var.orderrows + 1; i++) {
				var items = [];
				if (el(ticketorder.var.orderFields[core.var.selectedLanguage][0][0].replace(/\W/g, '') + i)) {
					for (var index = 0; index < ticketorder.var.orderFields[core.var.selectedLanguage].length; index++) {
						var field = ticketorder.var.orderFields[core.var.selectedLanguage][index]
						var id = value(el(ticketorder.var.orderFields[core.var.selectedLanguage][0][0].replace(/\W/g, '') + i).value);
						curval = value(el(field[0].replace(/\W/g, '') + i).value);
						if (!id || (id && index === 0) || (id && !field[2])) items.push(curval); // if item id exists skip disabled and conditional formfields to limit data usage
						if (ticketorder.var.apiTranslate.orderNumberWildcard && curval.indexOf(ticketorder.var.apiTranslate.orderNumberWildcard) > -1) wildcard = true;
					}
				}
				if (items.length) orderobj.items.push(items);
			}
			if (wildcard) {
				core.fn.popup(core.fn.lang('orderNumberWildcard', 'ticketorder'));
				return;
			}
			core.fn.setting.set('ticketorderDept', el('ordererDept').selectedIndex);
			core.fn.setting.set('ticketorderCostUnit', el('ordererCostUnit').selectedIndex);
			core.fn.setting.set('ticketorderContact', el('ordererContact').value);
			//this is a workaround for cookies (needed by ie) can not be larger than 4kb, so i have to split up the order list to individual orders
			var ordernum = core.fn.setting.get('ticketorderAwaitingOrders') || 0;
			if (core.fn.setting.set('ticketorderAwaitingOrder' + ++ordernum, JSON.stringify(orderobj), core.fn.lang('orderStorageError', 'ticketorder'))) {
				core.fn.setting.set('ticketorderAwaitingOrders', ordernum);
				core.fn.stdout('output', ticketorder.fn.currentorder.get());
				el('output').scrollTop = el('output').scrollHeight;
				core.fn.setting.unset('moduleExchangeTicketorder')
				if (el('deleteCart')) el('deleteCart').style.display = 'none';
			}
		},
		get: function () {
			var ordernum = core.fn.setting.get('ticketorderAwaitingOrders'),
				orders = '',
				output = '';
			if (ordernum) {
				for (var o = 0; o < ordernum; o++) {
					orders = (core.fn.setting.get('ticketorderAwaitingOrder' + (o + 1)) || '');
					if (orders.length) {
						// caution: order/table layout dependent of excel-file !!
						var orderobj = JSON.parse(orders);
						output += orderobj.subject + '<br /><br />';
						output += '<i>' + orderobj.type + '</i><br /><br />'
						Object.keys(orderobj).forEach(function (key) {
							if (['subject', 'type', 'items'].indexOf(key) === -1) {
								output += core.fn.lang(key, 'ticketorder') + ": " + orderobj[key] + '<br />';
							}
						});
						output += '<br /><table border=1 cellpadding=5 cellspacing=0><tr>';
						ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
							output += '<th';
							if (index < 1) output += ' style="display:none"'; // hide id
							output += '>' + field[0] + '</th>';
						});
						output += '</tr>';
						for (var i = 0; i < orderobj.items.length; i++) {
							output += '<tr>';
							var pos = 1;
							if (orderobj.items[i].length < ticketorder.var.orderFields[core.var.selectedLanguage].length) {
								ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
									var value;
									if (fieldindex in ticketorder.var.apiTranslate.fieldCorrelation) value = stocklist_data.content[orderobj.items[i][0]][ticketorder.var.apiTranslate.fieldCorrelation[fieldindex]];
									else if (fieldindex > 0) {
										value = orderobj.items[i][pos];
										pos++
									}
									output += '<td';
									if (fieldindex < 1) output += ' style="display:none"'; // hide id
									output += '>' + value + '</td>';
								});
							} else {
								for (var index = 0; index < orderobj.items[i].length; index++) {
									output += '<td';
									if (index < 1) output += ' style="display:none"'; // hide id
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
		clear: function () {
			var ordernum = core.fn.setting.get('ticketorderAwaitingOrders'),
				i;
			if (ordernum) {
				for (i = 0; i < ordernum; i++) {
					core.fn.setting.unset('ticketorderAwaitingOrder' + (i + 1));
				}
			}
			core.fn.setting.unset('ticketorderAwaitingOrders');
			core.fn.growlNotif(core.fn.lang('deleteCurrentOrderDeleted', 'ticketorder'));
		}
	},
	drm: {
		confirmform: function () {
			if (!core.fn.setting.get('ticketorderAwaitingOrders')) return;
			var form = '<form onsubmit="ticketorder.fn.drm.check(); return false;">' + core.fn.lang('settingKeyName') + '<br /><input type="text" id="orderconfirmname" autofocus /><br /><br />' +
				core.fn.lang('settingKeyPassword0').split(',')[0] + '<br /><input type="password" id="orderconfirmpassword0" /><br /><br />' +
				'<br /><input type="submit" value="' + core.fn.lang('drmConfirmationSubmit') + '" onclick="ticketorder.fn.drm.check()" />' +
				'<br /><br /><span id="keyresult"></span></form>';
			core.fn.popup(form);
		},
		check: function () {
			if (el('orderconfirmname').value && el('orderconfirmpassword0').value && core.fn.drm.searchHash(core.fn.drm.table('orderApproval'), core.fn.drm.createHash(el('orderconfirmname').value + el('orderconfirmpassword0').value))) {
				var token = core.fn.drm.encryptToken(ticketorder.var.newTicket, el('orderconfirmname').value, el('orderconfirmpassword0').value) || 'unauthorized';
				var confirmedOutput = '<i>' +
					core.fn.lang('orderConfirmed', 'ticketorder', [ticketorder.var.newTicket, token]) +
					'</i><br /><br />' + ticketorder.fn.currentorder.get();
				core.fn.stdout('output', confirmedOutput);
				el('mailto').href = 'javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'' + core.fn.lang('orderMailSubject', 'ticketorder') + el('ordererDept').value + ' | ' + el('orderer').value + '\')';
				el('output').scrollTop = 0;
				ticketorder.var.disableOutputSelect = false;
				core.fn.popup();
			} else {
				el('keyresult').innerHTML = core.fn.lang('drmConfirmationError');
			}
		},
		verifytoken: function () {
			var form = core.fn.lang('captionCheckTicket', 'ticketorder') + '<br /><input type="text" id="checkTicket" autofocus /><br /><br />' +
				core.fn.lang('captionCheckCode', 'ticketorder') + '<br /><input type="text" id="checkCode" /><br /><br />' +
				'<br /><input type="button" value="' + core.fn.lang('buttonVerifyToken', 'ticketorder') + '" onclick="' +
				'var decrypted=core.fn.drm.decryptToken(core.fn.drm.table(\'orderApproval\'), el(\'checkTicket\').value.trim(), el(\'checkCode\').value.trim());' +
				'if (!decrypted)' +
				'el(\'keycheckresult\').innerHTML=\'' + core.fn.lang('failureCheckCode', 'ticketorder') + '\';' +
				'else el(\'keycheckresult\').innerHTML=\'' +
				core.fn.lang('successCheckCode', 'ticketorder') + '\' + decrypted;' +
				'" />' +
				'<br /><br /><span id="keycheckresult"></span>';
			core.fn.popup(form);
		}
	},
	start: function (query) {
		if (typeof ticketorder_data !== 'undefined') {
			var input = '<form id="search" action="javascript:ticketorder.fn.search();">' +
				'<input type="text" pattern=".{3,}" required value="' + value(query).replace(/"/g, '&quot;') + '" placeholder="' + core.fn.lang('formErpInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search" />' +
				'<span onclick="ticketorder.fn.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
				core.fn.insert.select(ticketorder.fn.translate.returnselect(), 'ticketorderfilter', 'ticketorderfilter', (core.fn.setting.get('ticketorderfilter') || 'nofilter'), 'onchange="core.fn.setting.set(\'ticketorderfilter\',el(\'ticketorderfilter\').options[el(\'ticketorderfilter\').selectedIndex].value); ticketorder.fn.search();"') +
				core.fn.insert.icon('translate', 'bigger', false, 'title="' + core.fn.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"') +
				core.fn.insert.icon('key', 'bigger', false, 'title="' + core.fn.lang('buttonVerifyToken', 'ticketorder') + '" onclick="ticketorder.fn.drm.verifytoken();"') +
				'<input type="submit" id="name" value="' + core.fn.lang('formSubmit', 'ticketorder') + '" hidden="hidden" /> ' +
				'</form>';
		} else {
			var input = '<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.fn.lang('formInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
				'<span class="search">' + core.fn.insert.icon('search') + '</span> ' +
				core.fn.insert.icon('translate', 'bigger', false, 'title="' + core.fn.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"');
		}
		core.fn.stdout('input', input);
		core.fn.stdout('temp', ticketorder.fn.mkform());
		ticketorder.api.getShoppingCart();
		core.fn.stdout('output', this.currentorder.get());
		if (value(query) !== '') ticketorder.fn.search(value(query));
	},
	init: function (query) {
		el('moduleticketorder').checked = true; // highlight menu icon
		core.fn.loadScript(core.var.moduleDataDir + 'ticketorder.js', '');
		//import of stocklist for shopping cart
		core.fn.loadScript(core.var.moduleDataDir + 'stocklist.js', '');
		//delay build up until module.data is loaded
		setTimeout(function () {
			ticketorder.fn.start(value(query));
		}, core.fn.setting.get('settingVarPreloadTime') || 150);

		core.history.write(['ticketorder.fn.init(\'' + value(query) + '\')']);
		core.performance.stop('ticketorder.fn.init(\'' + value(query) + '\')');
	},
};