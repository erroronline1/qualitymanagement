//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for generating decent orders vie email
//
//  dependencies:	{core.var.moduleVarDir}ticketorder.var.js
//					{core.var.moduleDataDir}ticketorder.js
//					{core.var.moduleDataDir}stocklist.js
//
//////////////////////////////////////////////////////////////

if (typeof ticketorder === 'undefined') var ticketorder = {};

ticketorder.api = {
	available: function (search) {
		core.performance.stop('ticketorder.api.available(\'' + search + '\')');
		return;
	},
	getShoppingCart: function () {
		var cart=core.fn.setting.get('moduleExchangeTicketorder');
		if (cart) {
			cart=cart.split(',');
			cart.pop();
			var ticket=ticketorder.fn.translate.newTicket();
			cart.forEach(function(index){
				var lineindex=ticketorder.fn.addrow();
				ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, fieldindex) {
					var value;
					if (fieldindex<1) value = ticket;
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
		newTicket: function (){
			return new Date().getTime().toString(16)
		},
		ticketDate: function (ticket) {
			var timestamp=parseInt(ticket,16);
			if (timestamp<new Date(2020,1,1,0,0,0,0)) timestamp=NaN;
			var date = new Date(timestamp);
			prompt(core.fn.lang('ticketTranslate', 'ticketorder'), date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear() + ' - ' + date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes() + (isNaN(date.getDate())?' BATMAN!':''));
			return;
		},
	},
	mkform: function () {
		ticketorder.var.orderrows = -1;
		ticketorder.var.newTicket = ticketorder.fn.translate.newTicket();
		var form = core.fn.lang('newOrder', 'ticketorder'),
			ordererDeptList = ticketorder.var.orderDept.map(function (x) {
				return [x, x]
			});
		ordererDeptList.unshift(['', core.fn.lang('ordererDept', 'ticketorder')]);
		if (core.fn.setting.get('moduleExchangeTicketorder')) form += '<input type="button" style="float:right" value="' + core.fn.lang('deleteCart', 'ticketorder') + '" onclick="core.fn.setting.unset(\'moduleExchangeTicketorder\');" />';
		form += '<form action="javascript:ticketorder.fn.exportform()">';
		form += '<br /><input type="text" id="orderer" required placeholder="' + core.fn.lang('orderer', 'ticketorder') + '" /> ';
		form += core.fn.insert.select(ordererDeptList, 'ordererDept', 'ordererDept', core.fn.setting.get('ticketorderDept'), 'required');
		form += ' <input type="text" id="ordererContact" required placeholder="' + core.fn.lang('ordererContact', 'ticketorder') + '" value="' + (core.fn.setting.get('ticketorderContact') || '') + '" /> ';
		form += '<br style="clear:both" />';
		form += core.fn.insert.radio(core.fn.lang('notcommissioned', 'ticketorder'), 'commissioned', 'notcommissioned', true, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=el(\'orderReferralTicket\').required=false"', '') +'<br />';
		form += core.fn.insert.radio(core.fn.lang('commissioned', 'ticketorder'), 'commissioned', 'commissioned', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=true; el(\'orderReferralTicket\').required=false"', '') +'<br />';
		form += core.fn.insert.radio(core.fn.lang('retour', 'ticketorder'), 'commissioned', 'retour', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=false; el(\'orderReferralTicket\').required=true"', '');
		form += '<br /><input type="text" id="orderRcptName" placeholder="' + core.fn.lang('orderRcptName', 'ticketorder') + '" />' +
				'<input type="date" id="orderRcptDob" placeholder="' + core.fn.lang('orderRcptDob', 'ticketorder') + '" />' +
				'<input type="text" id="orderRcptFlag" placeholder="' + core.fn.lang('orderRcptFlag', 'ticketorder') + '" />';
		form += '<br style="clear:both" /><input type="text" id="orderReferralTicket" placeholder="' + core.fn.lang('orderReferralTicket', 'ticketorder') + '" /> ';
		form += '<br style="clear:both" /><table id="ordertable"><tr>';
		ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field) {
			form += '<td>' + field[0] + '</td>';
		});
		form += '</tr></table>';
		form += '<input type="button" value="' + core.fn.lang('orderAdd', 'ticketorder') + '" onclick="ticketorder.fn.addrow()" />' +
			'<br /><br /><textarea id="orderNote" rows="5" style="width:90%" placeholder="' + core.fn.lang('orderNote', 'ticketorder') + '"></textarea>' +
			'<br /><br /><input type="submit" id="submitOrder" disabled value="' + core.fn.lang('orderSubmit', 'ticketorder') + '" />' +
			'<br /><br /><a id="mailto" href="javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\')">' + core.fn.insert.icon('email') + core.fn.lang('openMailApp', 'ticketorder') + '</a><br /><br />';
		return form;
	},
	addrow: function () {
		var table = el('ordertable'),
			tr = document.createElement('tr');
		ticketorder.var.orderrows++;
		ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field, index) {
			var td = tr.appendChild(document.createElement('td'));
			td.style.cssText = 'width:' + field[1];
			var cellContent = '<input style="width:100%;" type="text" id="' + field[0].replace(/\W/g, '') + ticketorder.var.orderrows + '" required placeholder="' + field[0] + '" ';
			//prefill with ticket oder copy from former row
			if (index == 0) cellContent += 'value="' + ticketorder.var.newTicket + '" disabled'
			else if (ticketorder.var.orderrows > 0 && ticketorder.var.orderFieldsToCopy[core.var.selectedLanguage].indexOf(field[0]) > -1 && el(field[0].replace(/\W/g, '') + (ticketorder.var.orderrows - 1))) cellContent += 'value="' + el(field[0].replace(/\W/g, '') + (ticketorder.var.orderrows - 1)).value + '"';
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
	exportform: function () {
		// caution: order/table layout dependent of excel-file !!
		var output = '<table>', wildcard=false, curval;
		for (var i = 0; i < ticketorder.var.orderrows + 1; i++) {
			if (el(ticketorder.var.orderFields[core.var.selectedLanguage][0][0].replace(/\W/g, '') + i)) {
				output += '<tr>';
				ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field) {
					curval = value(el(field[0].replace(/\W/g, '') + i).value);
					output += '<td>' + curval + '</td>';
					if (curval.indexOf(ticketorder.var.apiTranslate.orderNumberWildcard)>-1) wildcard=true;
				});
				output += '<td>' + el('orderRcptName').value + '</td>';
				output += '<td>' + el('orderRcptDob').value + '</td>';
				output += '<td>' + el('orderer').value + '</td>';
				output += '<td>' + el('ordererDept').value + '</td>';
				output += '<td>' + el('ordererContact').value + '</td>';
				output += '<td>' + new Date().toUTCString() + '</td>';
				output += '</tr>';
			}
		}
		if (wildcard) { alert(core.fn.lang('orderNumberWildcard', 'ticketorder')); return; }
		output += '</table>';
		core.fn.setting.set('ticketorderDept', el('ordererDept').selectedIndex);
		core.fn.setting.set('ticketorderContact', el('ordererContact').value);

		var mailsubject;
		if (el('commissioned').checked || el('notcommissioned').checked) {
			mailsubject=core.fn.lang('orderMailSubject', 'ticketorder') + el('ordererDept').value;
		}
		else if (el('retour').checked) {
			mailsubject=core.fn.lang('retoureMailSubject', 'ticketorder') + el('orderReferralTicket').value;
			output=core.fn.lang('retoureMailSubject', 'ticketorder') + el('orderReferralTicket').value +'<br /><br />' + output;
		}
		if (el('orderNote').value) output += '<br />' + core.fn.lang('orderNote', 'ticketorder') + ':<br/>' + el('orderNote').value;

		el('mailto').href = 'javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'' + mailsubject + '\',\'' + output + '\')';
		core.fn.stdout('output', output);
		ticketorder.var.disableOutputSelect = false;
		core.fn.setting.unset('moduleExchangeTicketorder')
	},
	init: function (query) {
		el('moduleticketorder').checked = true; // highlight menu icon
		//import of stocklist for shopping cart
		core.fn.loadScript(core.var.moduleDataDir + 'stocklist.js','');
		
		var ordererDeptList = ticketorder.var.orderDept.map(function (x) {
			return [x.replace(/\W/g, ''), x]
		});
		ordererDeptList.unshift(['', core.fn.lang('ordererDept', 'ticketorder')]);

		core.fn.stdout('input',
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.fn.lang('formInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
			'<span class="search">' + core.fn.insert.icon('search') + '</span> ' +
			core.fn.insert.icon('translate', 'bigger', false, 'title="' + core.fn.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"') +
			'');
		core.fn.stdout('temp', ticketorder.fn.mkform());
		ticketorder.api.getShoppingCart();
		core.fn.stdout('output', '');
		core.performance.stop('ticketorder.fn.init(\'' + value(query) + '\')');
	},
};