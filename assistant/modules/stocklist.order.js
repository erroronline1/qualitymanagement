//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  stocklist *submodule* for generating decent orders via email
//
//  dependencies:	{core.var.moduleVarDir}stocklist.var.js
//					{core.var.moduleDataDir}stocklist.js
//
//////////////////////////////////////////////////////////////

stocklist.fn.authorized = () => {
	const authorized = core.fn.static.drm.table('orderApproval');
	let out = [
		[core.var.eMailAddress.inventorycontrol.address, core.var.eMailAddress.inventorycontrol.display[core.var.selectedLanguage]]
	];
	Object.keys(authorized).forEach((key) => {
		out.push([authorized[key][0], key]);
	});
	return out;
}

stocklist.fn.orderform = async () => {
	let form = '<span class="highlight">' + core.fn.static.lang('newOrder', 'stocklist') + '</span>',
		ordererCostUnitList = stocklist.var.orderCostUnit.map(function (x) {
			return [x, x]
		}),
		ordererDeptList = stocklist.var.orderDept.map(function (x) {
			return [x, x]
		}),
		stocklistContact = await core.fn.async.memory.read('stocklistContact'),
		stocklistCostUnit = await core.fn.async.memory.read('stocklistCostUnit'),
		stocklistDept = await core.fn.async.memory.read('stocklistDept');

	stocklist.var.orderrows = -1;

	ordererDeptList.unshift(['', core.fn.static.lang('ordererDept', 'stocklist')]);
	ordererCostUnitList.unshift(['', core.fn.static.lang('ordererCostUnit', 'stocklist')]);
	form += '<form action="javascript:stocklist.fn.currentorder.add()">' +
		'<br style="clear:both" /><table id="ordertable"><tr>';
	stocklist.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
		form += '<td';
		if (field[1] == null) form += ' style="display:none"'; // hidden in form but not in output because of significance for inventory control
		form += '>' + field[0] + '</td>';
	});
	form += '</tr></table>' +
		'<input type="hidden" id="editOrder" value="" />' +
		'<input type="button" value="' + core.fn.static.lang('orderAdd', 'stocklist') + '" onclick="stocklist.fn.addrow()" />' +
		'<br /><br /><textarea id="orderNote" rows="5" style="width:90%" placeholder="' + core.fn.static.lang('orderNote', 'stocklist') + '"></textarea>' +
		'<br /><input type="text" id="orderer" required placeholder="' + core.fn.static.lang('orderer', 'stocklist') + '" title="' + core.fn.static.lang('orderer', 'stocklist') + '" /><br /><br />' +
		core.fn.static.insert.select(ordererDeptList, 'ordererDept', 'ordererDept', stocklistDept, 'required title="' + core.fn.static.lang('ordererDept', 'stocklist') + '"') + "<br /><br />" +
		core.fn.static.insert.select(ordererCostUnitList, 'ordererCostUnit', 'ordererCostUnit', stocklistCostUnit, 'required title="' + core.fn.static.lang('ordererCostUnit', 'stocklist') + '"') + "<br /><br />" +
		'<input type="text" id="ordererContact" required placeholder="' + core.fn.static.lang('ordererContact', 'stocklist') + '" title="' + core.fn.static.lang('ordererContact', 'stocklist') + '" value="' + (stocklistContact || '') + '" /> ' +
		'<br style="clear:both" />' +
		core.fn.static.insert.radio(core.fn.static.lang('notcommissioned', 'stocklist'), 'commissioned', 'notcommissioned', true, 'onclick="stocklist.fn.requirements(\'none\')"', '') + '<br />' +
		core.fn.static.insert.radio(core.fn.static.lang('commissioned', 'stocklist'), 'commissioned', 'commissioned', false, 'onclick="stocklist.fn.requirements(\'commissioned\')"', '') + '<br />' +
		'<div id="commissioned_required" class="items items0">' +
		'<input type="text" id="orderRcptName" placeholder="' + core.fn.static.lang('orderRcptName', 'stocklist') + '" title="' + core.fn.static.lang('orderRcptName', 'stocklist') + '" onchange="el(\'orderRcptDob\').required = el(\'orderRcptFlag\').required = Boolean(el(\'orderRcptName\').value.length);" />' +
		'<input type="text" onfocus="this.type=\'date\'" onblur="this.type=\'text\'" id="orderRcptDob" placeholder="' + core.fn.static.lang('orderRcptDob', 'stocklist') + '" title="' + core.fn.static.lang('orderRcptDob', 'stocklist') + '" />' +
		'<input type="text" id="orderRcptFlag" placeholder="' + core.fn.static.lang('orderRcptFlag', 'stocklist') + '" title="' + core.fn.static.lang('orderRcptFlag', 'stocklist') + '" />' +
		'</div>' +
		core.fn.static.insert.radio(core.fn.static.lang('retour', 'stocklist'), 'commissioned', 'retour', false, 'onclick="stocklist.fn.requirements(\'ticket\')"', '') + '<br />' +
		core.fn.static.insert.radio(core.fn.static.lang('service', 'stocklist'), 'commissioned', 'service', false, 'onclick="stocklist.fn.requirements(\'ticket\')"', '') +
		'<div id="ticket_required" class="items items0"><input type="text" id="orderReferralTicket" placeholder="' + core.fn.static.lang('orderReferralTicket', 'stocklist') + '" title="' + core.fn.static.lang('orderReferralTicket', 'stocklist') + '" /> ' +
		'</div>' +
		'<br style="clear:both" /><input type="text" onfocus="this.type=\'date\'" onblur="this.type=\'text\'" id="orderNeededBy" placeholder="' + core.fn.static.lang('orderNeededBy', 'stocklist') + '" title="' + core.fn.static.lang('orderNeededBy', 'stocklist') + '" /> ' +
		'<br style="clear:both" />' +
		'<input type="submit" id="tidyOrder" disabled value="' + core.fn.static.lang('tidyOrder', 'stocklist') + '" onclick="stocklist.var.displayOnly = true;" />' +
		'<br /><br /><input type="submit" id="submitOrder" disabled value="' + core.fn.static.lang('orderSubmit', 'stocklist') + '" />' +
		'<br /><br /><input type="button" id="deleteCart" value="' + core.fn.static.lang('deleteCart', 'stocklist') + '" onclick="core.fn.async.memory.delete(\'stocklistCart\'); this.value=\'' + core.fn.static.lang('deleteCartDeleted', 'stocklist') + '\'; this.disabled=true; core.fn.async.growlNotif(\'' + core.fn.static.lang('deleteCartDeleted', 'stocklist') + '\');" />' +
		'<br /><br /><a ' + await core.fn.async.file.link(stocklist.var.orderFormFile) + '>' +
		core.fn.static.insert.icon('pdf') + core.fn.static.lang('orderFormFile', 'stocklist') + '</a><br /><br />' +
		core.fn.static.insert.select(stocklist.fn.authorized(), 'authorizedOrderer', 'authorizedOrderer', false, 'onchange="el(\'mailto\').setAttribute(\'data-mail\', this.value)"') +
		'<a id="mailto" data-mail="' + core.var.eMailAddress.inventorycontrol.address + '" href="javascript:core.fn.static.dynamicMailto(el(\'mailto\').getAttribute(\'data-mail\'), core.fn.static.lang(\'orderMailSubject\', \'stocklist\') + el(\'ordererDept\').value + \' | \' + el(\'orderer\').value)">' +
		core.fn.static.insert.icon('email') + core.fn.static.lang('openMailApp', 'stocklist') + '</a>' +
		"</form>";
	return form;
}

stocklist.fn.requirements = (what) => {
	set = {
		'all': {
			required: ['orderRcptName', 'orderRcptDob', 'orderRcptFlag', 'orderReferralTicket'],
			displayed: ['commissioned_required', 'ticket_required']
		},
		'none': {
			required: [],
			displayed: []
		},
		'commissioned': {
			required: ['orderRcptName', 'orderRcptDob', 'orderRcptFlag'],
			displayed: ['commissioned_required']
		},
		'ticket': {
			required: ['orderReferralTicket'],
			displayed: ['ticket_required']
		}
	};
	set['all'].required.forEach(f => {
		el(f).required = set[what].required.includes(f);
	});
	set['all'].displayed.forEach(f => {
		core.fn.static.toggleHeight(el(f), set[what].displayed.includes(f));
	});
}

stocklist.fn.addrow = function (conditionalDisabled) {
	let cellContent,
		disabledPreset,
		table = el('ordertable'),
		td,
		tr = document.createElement('tr');
	stocklist.var.orderrows++;
	stocklist.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
		td = tr.appendChild(document.createElement('td'));
		td.style.cssText = 'width:' + field[1];
		if (field[1] == null) td.style.cssText += '; display:none'; // hidden in form but not in output becouse of significance for inventory control
		cellContent = '<input style="width:100%;" type="text" id="' + field[0].replace(/\W/g, '') + stocklist.var.orderrows + '" required placeholder="' + field[0] + '" ';
		//prefill with ticket or copy from former row, disable conditional
		disabledPreset = field[2];
		if (disabledPreset === true || (disabledPreset === 2 && conditionalDisabled)) cellContent += ' disabled'
		if (stocklist.var.orderrows > 0 && stocklist.var.orderFieldsToCopy[core.var.selectedLanguage].indexOf(field[0]) > -1 && el(field[0].replace(/\W/g, '') + (stocklist.var.orderrows - 1))) cellContent += ' value="' + el(field[0].replace(/\W/g, '') + (stocklist.var.orderrows - 1)).value + '"';
		cellContent += ' />';
		td.innerHTML = cellContent
	});
	td = tr.appendChild(document.createElement('td'));
	td.innerHTML = core.fn.static.insert.icon('delete', 'bigger rownumberingpseudoclass', false, 'lineexists' + (stocklist.var.orderrows) + ' onclick="stocklist.fn.deleterow(' + (stocklist.var.orderrows) + ')"');
	table.appendChild(tr);
	el('tidyOrder').disabled = false;
	if (el('submitOrder')) el('submitOrder').disabled = false;
	return stocklist.var.orderrows;
}

stocklist.fn.deleterow = function (itemindex) {
	let rows = document.getElementsByClassName('rownumberingpseudoclass');
	for (var i = 0; i < rows.length; i++) {
		if (rows[i].hasAttribute('lineexists' + itemindex)) {
			el('ordertable').deleteRow(i + 1);
			break;
		}
	}
}

stocklist.fn.getShoppingCart = async (updateLast = false) => {
	let cart = await core.fn.async.memory.read('stocklistCart'),
		lineindex,
		value;
	if (cart) {
		cart = cart.split(',');
		cart.pop(); // remove last empty element
		if (updateLast) cart = [cart.pop()]; // select only last element
		cart.forEach(function (index) {
			lineindex = stocklist.fn.addrow(true);
			stocklist.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
				if (fieldindex in stocklist.var.apiTranslate.fieldCorrelation) value = stocklist.data.stocklist.content[index][stocklist.var.apiTranslate.fieldCorrelation[fieldindex]];
				else value = '';
				el(field[0].replace(/\W/g, '') + lineindex).value = value;
			});
		});
	}
}

stocklist.fn.currentorder = {
	add: async () => {
		//prepare order object, add properties according to form fields and language chunks
		let curval,
			field,
			items,
			ordernum,
			orderobj = {},
			neworder,
			wildcard = false;
		orderobj.subject = core.fn.static.lang('orderMailSubject', 'stocklist') + el('ordererDept').value + ' | ' + el('orderer').value;
		// same fields as in getting peculiar order, change on both ends
		['notcommissioned', 'commissioned', 'retour', 'service'].forEach(function (field) {
			if (el(field).checked) orderobj.type = core.fn.static.lang(field, 'stocklist');
		});
		['orderRcptName', 'orderRcptDob', 'orderRcptFlag', 'orderer', 'ordererDept', 'ordererCostUnit', 'ordererContact', 'orderNeededBy', 'orderNote', 'orderReferralTicket'].forEach(function (field) {
			if (el(field).value) orderobj[field] = el(field).value;
		});
		orderobj.items = [];
		// iterate through order form for item descriptions
		for (var i = 0; i < stocklist.var.orderrows + 1; i++) {
			items = [];
			if (el(stocklist.var.apiTranslate.idField().replace(/\W/g, '') + i)) {
				for (let index = 0; index < stocklist.var.orderFields[core.var.selectedLanguage].length; index++) {
					field = stocklist.var.orderFields[core.var.selectedLanguage][index]
					curval = el(field[0].replace(/\W/g, '') + i).value || '';
					items.push(curval);
					if (stocklist.var.apiTranslate.orderNumberWildcard && curval.indexOf(stocklist.var.apiTranslate.orderNumberWildcard) > -1) wildcard = true;
				}
			}
			if (items.length) orderobj.items.push(items);
		}
		if (wildcard) {
			core.fn.static.popup(core.fn.static.lang('orderNumberWildcard', 'stocklist'));
			return;
		}

		core.fn.async.memory.write('stocklistDept', el('ordererDept').selectedIndex);
		core.fn.async.memory.write('stocklistCostUnit', el('ordererCostUnit').selectedIndex);
		core.fn.async.memory.write('stocklistContact', el('ordererContact').value);
		if (!stocklist.var.displayOnly) {
			ordernum = await core.fn.async.memory.read('stocklistAwaitingOrders');
			ordernum = el('editOrder').value || eval(ordernum) + 1;
			neworder = await core.fn.async.memory.write('stocklistAwaitingOrder' + ordernum, JSON.stringify(orderobj), core.fn.static.lang('orderStorageError', 'stocklist'));
			if (neworder && !el('editOrder').value) {
				core.fn.async.memory.write('stocklistAwaitingOrders', ordernum);
				core.fn.async.memory.delete('stocklistCart')
				if (el('deleteCart')) el('deleteCart').style.display = 'none';
			} else core.fn.async.memory.write('stocklistAwaitingOrders', ordernum);
			core.fn.async.stdout('currentorders', await stocklist.fn.currentorder.get());
		} else {
			core.fn.async.stdout('output', await stocklist.fn.currentorder.get(JSON.stringify(orderobj)));
			el('output').scrollTop = el('output').scrollHeight;
		}
		stocklist.var.displayOnly = false;
	},
	get: async (temporaryCart = null, particularOrder = null) => {
		let ordernum = await core.fn.async.memory.read('stocklistAwaitingOrders'),
			orders,
			output = '';

		stocklist.var.disableOutputSelect = true; // (re-)set in case a cart has been displayed

		function displayOrder(orderobj) {
			let output = '';
			orderobj = JSON.parse(orderobj);
			output = orderobj.subject + '<br /><br />';
			output += '<i>' + orderobj.type + '</i><br /><br />'
			output += core.fn.static.lang('captionCheckTicket', 'stocklist') + ': ' + stocklist.fn.translate.newTicket() + '<br />';
			Object.keys(orderobj).forEach(function (key) {
				if (['subject', 'type', 'items'].indexOf(key) === -1) {
					output += core.fn.static.lang(key, 'stocklist') + ": " + orderobj[key] + '<br />';
				}
			});
			output += '<br /><table border=1 cellpadding=5 cellspacing=0><tr>';
			stocklist.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
				output += '<th';
				output += '>' + field[0] + '</th>';
			});
			output += '</tr>';
			for (let i = 0; i < orderobj.items.length; i++) {
				output += '<tr>';
				let pos = 0,
					value;
				if (orderobj.items[i].length < stocklist.var.orderFields[core.var.selectedLanguage].length) {
					stocklist.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
						// caution: set field correlation accordingly to order/table layout dependent of excel-file or stocklist.py-erp-dump in stocklist.var.js!!
						if (fieldindex in stocklist.var.apiTranslate.fieldCorrelation) value = stocklist.data.stocklist.content[orderobj.items[i][0]][stocklist.var.apiTranslate.fieldCorrelation[fieldindex]];
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
			return output;
		}

		async function importOrder(order) {
			let cart = await core.fn.async.memory.read('stocklistAwaitingOrder' + order),
				lineindex;
			if (cart) {
				core.fn.async.stdout('temp', core.fn.static.lang('useCaseDescription', 'stocklist') + '<br /><br />' +
					'<div class="items items23 expand" id="stocklistOrderForm" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + await stocklist.fn.orderform() + '</div>' +
					'<div id="currentorders"></div>' +
					'<div class="items items23" id="stocklistOrderForm" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() + await stocklist.fn.ticketqueryform() + '</div>');
				core.fn.async.stdout('currentorders', await stocklist.fn.currentorder.get());

				cart = JSON.parse(cart);

				// same fields as in adding order, change on both ends
				['notcommissioned', 'commissioned', 'retour', 'service'].forEach(function (field) {
					el(field).checked = cart.type === core.fn.static.lang(field, 'stocklist');
				});
				['orderRcptName', 'orderRcptDob', 'orderRcptFlag', 'orderer', 'ordererDept', 'ordererCostUnit', 'ordererContact', 'orderNeededBy', 'orderNote'].forEach(function (field) {
					el(field).value = cart[field] || '';
				});
				cart.items.forEach(function (article) {
					lineindex = stocklist.fn.addrow(true);
					stocklist.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
						el(field[0].replace(/\W/g, '') + lineindex).value = article[fieldindex];
					});
				});
			}
			el('editOrder').value = order;
			el('deleteCart').value = core.fn.static.lang('deleteCurrentOrder', 'stocklist');
			el('deleteCart').onclick = function () {
				stocklist.fn.currentorder.delete(order);
				el('deleteCart').value = core.fn.static.lang('deleteCartDeleted', 'stocklist');
				el('deleteCart').disabled = true;
				core.fn.async.growlNotif(core.fn.static.lang('deleteCartDeleted', 'stocklist'));
			}
		}

		if (temporaryCart) {
			output = displayOrder(temporaryCart);
			stocklist.var.disableOutputSelect = false;
			core.fn.async.growlNotif(core.fn.static.lang('deletionReminder', 'stocklist'));
		} else if (particularOrder) {
			await importOrder(particularOrder);
			el('temp').scrollTo(0, 0);
		} else if (ordernum) {
			for (let o = 0; o < ordernum; o++) {
				orders = await core.fn.async.memory.read('stocklistAwaitingOrder' + (o + 1))
				orders = orders || '';
				if (orders.length) {
					output += '<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand() +
						displayOrder(orders) +
						'<input type="button" value="' + core.fn.static.lang('editOrder', 'stocklist') + '" onclick="stocklist.fn.currentorder.get(null,' + (o + 1) + ')" />' +
						'<br /><br /><input type="button" value="' + core.fn.static.lang('deleteCurrentOrder', 'stocklist') + '" onclick="stocklist.fn.currentorder.delete(' + (o + 1) + ')" />' +
						'</div>';
				}
			}
		}
		return output;
	},
	delete: async (order) => {
		await core.fn.async.memory.delete('stocklistAwaitingOrder' + (order))
		core.fn.async.stdout('currentorders', await stocklist.fn.currentorder.get());
	},
}