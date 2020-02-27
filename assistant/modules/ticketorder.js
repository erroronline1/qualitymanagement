//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for generating decent orders via email
//
//  dependencies:	{core.var.moduleVarDir}ticketorder.var.js
//					{core.var.moduleDataDir}ticketorder.js
//					{core.var.moduleDataDir}stocklist.js
//					optional administrative ticketorder.xlsm
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
			var data_without_header=JSON.parse(JSON.stringify(ticketorder_data));
			data_without_header.content[0]=new Array(data_without_header.content[0].length);
			var found = core.fn.smartSearch.lookup(search, data_without_header.content, true);
			//the following would return the found items, but i decided otherwise in this case
			//found.forEach(function (value) {
			//	display=display:ticketorder_data.content[value[0]][1] + ' ' +ticketorder_data.content[value[0]][2] + ' '+ ticketorder_data.content[value[0]][3];
			//	globalSearch.contribute('ticketorder', display);
			//});
			if (found.length) {
				display = '<a href="javascript:core.fn.loadScript(\'modules/ticketorder.js\',\'ticketorder.fn.init(\\\'' + search + '\\\')\')">' + found.length + core.fn.lang('apiItemsFound', 'ticketorder') + '</a>';
				//add value and relevance
				globalSearch.contribute('ticketorder', [display, 1]);
			}
			core.performance.stop('ticketorder.api.processAfterImport(\'' + search + '\')');
		}
	},
	getShoppingCart: function () {
		var cart=core.fn.setting.get('moduleExchangeTicketorder');
		if (cart) {
			cart=cart.split(',');
			cart.pop();
			var ticket=ticketorder.var.newTicket;
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
		returnselect: function () {
			var output = new Object();
			Object.keys(ticketorder.var.filter()).forEach(function (key) {
				output[key] = [ticketorder.var.filter()[key][0], ticketorder.var.filter()[key][1]];
			});
			return output;
		},
		newTicket: function (){
			return new Date().getTime().toString(36)
		},
		ticketDate: function (ticket) {
			var timestamp=parseInt(ticket,36);
			if (timestamp<new Date(2020,1,1,0,0,0,0)) timestamp=NaN;
			var date = new Date(timestamp);
			prompt(core.fn.lang('ticketTranslate', 'ticketorder'), date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear() + ' - ' + date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes() + (isNaN(date.getDate())?' BATMAN!':''));
			return;
		},
	},
	search: function (query) {
		query = query || el('ticketorderquery').value;
		var filter = el('ticketorderfilter').selectedIndex || core.fn.setting.get('ticketorderfilter')
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
		ticketorder.var.newTicket = ticketorder.fn.translate.newTicket();
		var form = core.fn.lang('newOrder', 'ticketorder'),
			ordererDeptList = ticketorder.var.orderDept.map(function (x) {
				return [x, x]
			}),
			ordererCostUnitList = ticketorder.var.orderCostUnit.map(function (x) {
				return [x, x]
			});
		ordererDeptList.unshift(['', core.fn.lang('ordererDept', 'ticketorder')]);
		ordererCostUnitList.unshift(['', core.fn.lang('ordererCostUnit', 'ticketorder')]);
		if (core.fn.setting.get('moduleExchangeTicketorder')) form += '<input type="button" id="deleteCart" style="float:right" value="' + core.fn.lang('deleteCart', 'ticketorder') + '" onclick="core.fn.setting.unset(\'moduleExchangeTicketorder\');" />';
		form += '<form action="javascript:ticketorder.fn.exportform()">';
		form += '<br /><input type="text" id="orderer" required placeholder="' + core.fn.lang('orderer', 'ticketorder') + '" title="' + core.fn.lang('orderer', 'ticketorder') + '" /> ';
		form += core.fn.insert.select(ordererDeptList, 'ordererDept', 'ordererDept', core.fn.setting.get('ticketorderDept'), 'required title="' + core.fn.lang('ordererDept', 'ticketorder') +'"');
		form += core.fn.insert.select(ordererCostUnitList, 'ordererCostUnit', 'ordererCostUnit', core.fn.setting.get('ticketorderCostUnit'), 'required title="' + core.fn.lang('ordererCostUnit', 'ticketorder') +'"');
		form += ' <input type="text" id="ordererContact" required placeholder="' + core.fn.lang('ordererContact', 'ticketorder') + '" title="' + core.fn.lang('ordererContact', 'ticketorder') + '" value="' + (core.fn.setting.get('ticketorderContact') || '') + '" /> ';
		form += '<br style="clear:both" />';
		form += core.fn.insert.radio(core.fn.lang('notcommissioned', 'ticketorder'), 'commissioned', 'notcommissioned', true, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=el(\'orderReferralTicket\').required=false"', '') +'<br />';
		form += core.fn.insert.radio(core.fn.lang('commissioned', 'ticketorder'), 'commissioned', 'commissioned', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=true; el(\'orderReferralTicket\').required=false"', '') +'<br />';
		form += core.fn.insert.radio(core.fn.lang('retour', 'ticketorder'), 'commissioned', 'retour', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=false; el(\'orderReferralTicket\').required=true"', '') +'<br />';
		form += core.fn.insert.radio(core.fn.lang('service', 'ticketorder'), 'commissioned', 'service', false, 'onclick="el(\'orderRcptName\').required=el(\'orderRcptDob\').required=el(\'orderRcptFlag\').required=false; el(\'orderReferralTicket\').required=true"', '');
		form += '<br /><input type="text" id="orderRcptName" placeholder="' + core.fn.lang('orderRcptName', 'ticketorder') + '" title="' + core.fn.lang('orderRcptName', 'ticketorder') + '" />' +
				'<input type="date" id="orderRcptDob" placeholder="' + core.fn.lang('orderRcptDob', 'ticketorder') + '" title="' + core.fn.lang('orderRcptDob', 'ticketorder') + '" />' +
				'<input type="text" id="orderRcptFlag" placeholder="' + core.fn.lang('orderRcptFlag', 'ticketorder') + '" title="' + core.fn.lang('orderRcptFlag', 'ticketorder') + '" />';
		form += '<br style="clear:both" /><input type="text" id="orderReferralTicket" placeholder="' + core.fn.lang('orderReferralTicket', 'ticketorder') + '" title="' + core.fn.lang('orderReferralTicket', 'ticketorder') + '" /> ';
		form += '<br style="clear:both" /><input type="date" id="orderNeededBy" placeholder="' + core.fn.lang('orderNeededBy', 'ticketorder') + '" title="' + core.fn.lang('orderNeededBy', 'ticketorder') + '" /> ';
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
		var output = '', wildcard=false, curval, mailsubject;
		if (el('commissioned').checked || el('notcommissioned').checked) {
			mailsubject=core.fn.lang('orderMailSubject', 'ticketorder') + el('ordererDept').value + ' | ' + el('orderer').value + ' | ' +
				' ' + ticketorder.var.orderFields[core.var.selectedLanguage][0][0] + ' ' + ticketorder.var.newTicket;
		}
		else if (el('retour').checked) {
			mailsubject=core.fn.lang('retoureMailSubject', 'ticketorder') + el('orderReferralTicket').value + ' | ' + el('ordererDept').value + ' | ' + el('orderer').value;
		}
		else if (el('service').checked) {
			mailsubject=core.fn.lang('serviceMailSubject', 'ticketorder') + el('orderReferralTicket').value + ' | ' + el('ordererDept').value + ' | ' + el('orderer').value;
		}
	
		output = mailsubject + '<br /><br />';
		['orderRcptName','orderRcptDob','orderRcptFlag','orderer','ordererDept','ordererCostUnit','ordererContact','orderNeededBy'].forEach(function(field){
			if (el(field).value) output += core.fn.lang(field, 'ticketorder') + ': ' + el(field).value + '<br />';
		});
		
		
		output += '<br /><table border=1 cellpadding=5 cellspacing=0><tr>';
		ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field) {
			output += '<th>' + field[0] + '</th>';
		});
		output += '</tr>';
		for (var i = 0; i < ticketorder.var.orderrows + 1; i++) {
			if (el(ticketorder.var.orderFields[core.var.selectedLanguage][0][0].replace(/\W/g, '') + i)) {
				output += '<tr>';
				ticketorder.var.orderFields[core.var.selectedLanguage].forEach(function (field) {
					curval = value(el(field[0].replace(/\W/g, '') + i).value);
					output += '<td>' + curval + '</td>';
					if (curval.indexOf(ticketorder.var.apiTranslate.orderNumberWildcard)>-1) wildcard=true;
				});
				output += '</tr>';
			}
		}
		if (wildcard) { alert(core.fn.lang('orderNumberWildcard', 'ticketorder')); return; }
		output += '</table>';
		core.fn.setting.set('ticketorderDept', el('ordererDept').selectedIndex);
		core.fn.setting.set('ticketorderCostUnit', el('ordererCostUnit').selectedIndex);
		core.fn.setting.set('ticketorderContact', el('ordererContact').value);


		if (el('orderNote').value) output += '<br />' + core.fn.lang('orderNote', 'ticketorder') + ':<br/>' + el('orderNote').value;

		// no output here, because tables will not be exported formatted, has to be copy and paste to be passed properly
		el('mailto').href = 'javascript:core.fn.dynamicMailto(\'' + ticketorder.var.inventoryControl + '\',\'' + mailsubject + '\')';
		core.fn.stdout('output', output);
		ticketorder.var.disableOutputSelect = false;
		core.fn.setting.unset('moduleExchangeTicketorder')
		el('deleteCart').style.display='none';
	},
	start: function(query){
		if (typeof ticketorder_data !== 'undefined') {
			var input = '<form id="search" action="javascript:ticketorder.fn.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.fn.lang('formErpInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
			'<span onclick="ticketorder.fn.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
			core.fn.insert.select(ticketorder.fn.translate.returnselect(), 'ticketorderfilter', 'ticketorderfilter', (core.fn.setting.get('ticketorderfilter') || 'nofilter'), 'onchange="core.fn.setting.set(\'ticketorderfilter\',el(\'ticketorderfilter\').options[el(\'ticketorderfilter\').selectedIndex].value); ticketorder.fn.search();"') +
			core.fn.insert.icon('translate', 'bigger', false, 'title="' + core.fn.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"') +
			'<input type="submit" id="name" value="' + core.fn.lang('formSubmit', 'ticketorder') + '" hidden="hidden" /> ' +
			'</form>';
		}
		else {
			var input = '<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.fn.lang('formInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
			'<span class="search">' + core.fn.insert.icon('search') + '</span> ' +
			core.fn.insert.icon('translate', 'bigger', false, 'title="' + core.fn.lang('buttonTranslate', 'ticketorder') + '" onclick="ticketorder.fn.translate.ticketDate(el(\'ticketorderquery\').value);"');
		}
		core.fn.stdout('input', input);
		core.fn.stdout('temp', ticketorder.fn.mkform());
		ticketorder.api.getShoppingCart();
		core.fn.stdout('output', '');
		if (value(query) !== '') ticketorder.fn.search(value(query));
	},
	init: function (query) {
		el('moduleticketorder').checked = true; // highlight menu icon
		core.fn.loadScript(core.var.moduleDataDir + 'ticketorder.js', '');
		//import of stocklist for shopping cart
		core.fn.loadScript(core.var.moduleDataDir + 'stocklist.js','');
		//delay build up until module.data is loaded
		setTimeout(function () {
			ticketorder.fn.start(value(query));
		}, core.fn.setting.get('settingVarPreloadTime') || 50);
		
		core.history.write(['ticketorder.fn.init(\'' + value(query) + '\')']);
		core.performance.stop('ticketorder.fn.init(\'' + value(query) + '\')');
	},
};