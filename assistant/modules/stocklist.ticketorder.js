//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  stocklist *submodule* for check current order states if provided
//
//  dependencies:	{core.var.moduleVarDir}stocklist.var.js
//					{core.var.moduleDataDir}ticketorder.js
//
//////////////////////////////////////////////////////////////

stocklist.fn.ticketqueryform = async () => {
	let input = '<span class="highlight">' + core.fn.static.lang('ticketorder', 'stocklist') + '</span><br /><br style="clear:both" />',
		ticketorderfilter = await core.fn.async.memory.read('stocklistticketorderfilter');
	if (ticketorder.data !== undefined) {
		input += '<form id="searchtickets" action="javascript:stocklist.fn.ticketsearch();">' +
			'<input type="text" pattern=".{3,}" required  placeholder="' + core.fn.static.lang('formErpInputPlaceholder', 'stocklist') + '" id="ticketorderquery" class="search" />' +
			'<span onclick="stocklist.fn.ticketsearch();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
			core.fn.static.insert.select(stocklist.fn.translate.returnselect2(), 'ticketorderfilter', 'ticketorderfilter', (ticketorderfilter || 'nofilter'), 'onchange="core.fn.async.memory.write(\'stocklistticketorderfilter\',el(\'ticketorderfilter\').options[el(\'ticketorderfilter\').selectedIndex].value); stocklist.fn.ticketsearch();"') +
			core.fn.static.insert.icon('translate', 'bigger', false, 'title="' + core.fn.static.lang('buttonTranslate', 'stocklist') + '" onclick="stocklist.fn.translate.ticketDate(el(\'ticketorderquery\').value);"') +
			'<input type="submit" id="name2" value="' + core.fn.static.lang('formSubmit', 'stocklist') + '" hidden="hidden" /> ' +
			'</form>';
	} else {
		input += '<input type="text" pattern=".{3,}" required placeholder="' + core.fn.static.lang('formInputPlaceholder', 'ticketorder') + '" id="ticketorderquery" class="search" />' +
			'<span class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
			core.fn.static.insert.icon('translate', 'bigger', false, 'title="' + core.fn.static.lang('buttonTranslate', 'stocklist') + '" onclick="stocklist.fn.translate.ticketDate(el(\'ticketorderquery\').value);"');
	}
	return input;
}

stocklist.fn.ticketsearch = async (query = '') => {
	query = query || el('ticketorderquery').value;
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
				stocklist.var.filter.tickets()[el('ticketorderfilter').options[el('ticketorderfilter').selectedIndex].value][2]);
			// check if search matches item-list
			if (found.length > 0) {
				core.fn.async.smartSearch.relevance.init();
				//reminder: keep these kind of assignments out of loops for performance reasons!
				maillanguage = {
					queryMailSubject: core.fn.static.lang('queryMailSubject', 'stocklist'),
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
						'<a title="' + subject + '" href="javascript:core.fn.static.dynamicMailto(\'' + core.var.eMailAddress.inventorycontrol.address + '\',\'' + subject + '\',\'' + mailbody + '\')">' + subject + '</a> ' +
						'</div>';
				});
			} else list = core.fn.static.lang('errorNothingFound', 'stocklist', query);
			core.fn.async.stdout('output', list);
		} else {
			return ticketorder.data.content.length - 1;
		}
	}
	stocklist.var.disableOutputSelect = true;
}