//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for creating a list of mailto-links to retrieve
// 	semi-personalized emails with the same content but
//  different salutation and recipients address, creating signatures
//  and not-available-messages
//
//  dependencies:	data/mailtools.var.js
//
// in this case you will have to customize the modules directly
//
//////////////////////////////////////////////////////////////

if (typeof mailtools == 'undefined') var mailtools = {};

mailtools.api = {
	available: function (search) {
		var searchobject = [],
			display;
		Object.keys(mailtools.var.submodules).forEach(function (key) {
			searchobject.push([mailtools.var.submodules[key][core.var.selectedLanguage], key]);
		});
		var found = core.function.smartSearch.lookup(search, searchobject, true);
		found.forEach(function (value) {
			display = '<a href="javascript:core.function.loadScript(\'modules/mailtools.js\',\'mailtools.function.init(\\\'' + searchobject[value[0]][1] + '\\\')\')">' + searchobject[value[0]][0] + '</a>';
			//add value and relevance
			globalSearch.contribute('mailtools', [display, value[1]]);
		});
		core.performance.stop('mailtools.api.available(\'' + search + '\')');
	},
};
mailtools.function = {
	serialmailinput: function () {
		el('mailtoolgen').innerHTML = core.function.insert.icon('refresh', 'bigger', false,
			'onclick="mailtools.function.serialmailgen()" title="' + core.function.lang('buttonGenTitle', 'mailtools') + '"');
		el('temp').innerHTML = '<input type="button" value="' + core.function.lang('buttonTestCaption', 'mailtools') + '" title="' + core.function.lang('buttonTestTitle', 'mailtools') + '" onclick="mailtools.function.serialtest()" /><br /><br />' +
			core.function.lang('formRecipientListCaption', 'mailtools') + ':<br /><textarea id="names" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="' + core.function.lang('formRecipientListPlaceholder', 'mailtools') + '"></textarea> ' +
			'<textarea id="adresses" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="' + core.function.lang('formRecipientMailPlaceholder', 'mailtools') + '"></textarea><br />' +
			core.function.lang('formContentCaption', 'mailtools') + ':<br /><input type="text" style="width:98%" id="subject" placeholder="' + core.function.lang('formSubjectPlaceholder', 'mailtools') + '"><br />' +
			'<textarea id="body" rows="10" style="width:98%;" placeholder="' + core.function.lang('formBodyPlaceholder', 'mailtools') + '"></textarea>';
		el('output').innerHTML = '';
		core.history.write(['mailtools.function.init(\'serialmail\')']);
	},
	serialtest: function () {
		el('names').value = core.function.lang('sampleNameValue', 'mailtools');
		el('adresses').value = core.function.lang('sampleMailValue', 'mailtools');
		el('subject').value = core.function.lang('sampleSubjectValue', 'mailtools');
		el('body').value = core.function.lang('sampleBodyValue', 'mailtools');
	},
	serialmailgen: function () {
		if (!el('names').value || !el('adresses').value || !el('body').value || !el('subject').value) core.function.popup(core.function.lang('errorNoContent', 'mailtools'));
		else {
			var names = el('names').value.split(/\n/g),
				adresses = el('adresses').value.split(/\s/g);
			if (names.length != adresses.length) core.function.popup(core.function.lang('errorMatchingRows', 'mailtools'));
			else {
				var output = '';
				for (var i = 0; i < names.length; i++) {
					output += '<a href="mailto:' + adresses[i] + '?subject=' + el('subject').value + '&body=' + core.function.lang('outputSalutation', 'mailtools', names[i]) + '%20' + encodeURI(names[i]) + ',%0A%0A' + encodeURI(el('body').value) + '">' + core.function.lang('outputMailTo', 'mailtools') + ' ' + names[i] + ' &lt;' + adresses[i] + '&gt;</a><br />';
				}
				disableOutputSelect = true;
				el('output').innerHTML = output;
			}
			mailtools.var.disableOutputSelect = true;
		}
	},
	signatureinput: function () {
		el('mailtoolgen').innerHTML = core.function.insert.icon('refresh', 'bigger', false,
			'onclick="el(\'output\').innerHTML=mailtools_data.signature[core.var.selectedLanguage]()" title="' + core.function.lang('buttonGenTitle', 'mailtools') + '"');
		el('temp').innerHTML = mailtools_data.signature[core.var.selectedLanguage](1) +
			'<br /><br />' +
			core.function.languageSelection('onchange="el(\'output\').innerHTML=mailtools_data.signature[this.id]()"').join('<br />') +
			(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.function.insert.icon('outlook') + core.function.lang('openOutlook', 'mailtools') + '</a>' : '');
		el('output').innerHTML = '';
		mailtools.var.disableOutputSelect = false;
		core.history.write(['mailtools.function.init(\'signature\')']);
	},
	notavailableinput: function () {
		el('mailtoolgen').innerHTML = core.function.insert.icon('refresh', 'bigger', false,
			'onclick="mailtools.function.notavailablegen()" title="' + core.function.lang('buttonGenTitle', 'mailtools') + '"');
		el('temp').innerHTML = core.function.lang('notavailableFrom', 'mailtools') + ':<br /><input type="date" id="notfrom" placeholder="DD.MM.YYYY" /><br /><br />' +
			core.function.lang('notavailableTo', 'mailtools') + ':<br /><input type="date" id="notto" placeholder="DD.MM.YYYY" />' +
			(core.var.outlookWebUrl ? '<br /><br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.function.insert.icon('outlook') + core.function.lang('openOutlook', 'mailtools') + '</a>' : '');
		el('output').innerHTML = '';
		core.history.write(['mailtools.function.init(\'notavailable\')']);
	},
	notavailablegen: function () {
		//gets date inputs and sorts them to dd.mm.yyyy
		from = el('notfrom').value.split(/\D/g);
		if (from[0].length > 2) from = new Array(from[2], from[1], from[0]);
		to = el('notto').value.split(/\D/g);
		if (to[0].length > 2) to = new Array(to[2], to[1], to[0]);
		var dates = {
			from: from,
			to: to
		};
		mailtools.var.disableOutputSelect = false;
		el('output').innerHTML = mailtools_data.notavailableResponse['de'](dates) +
			mailtools_data.notavailableResponse['en'](dates);
	},
	init: function (query) {
		if (typeof mailtools_data == 'undefined') core.function.loadScript('data/mailtools.js', 'mailtools.function.init(\'' + value(query) + '\')');
		el('modulemailtools').checked = true; // highlight menu icon
		var options = new Object();
		options['null'] = ['', core.function.lang('selectSubmodule', 'mailtools')];
		Object.keys(mailtools.var.submodules).forEach(function (key) {
			options[key] = [key, mailtools.var.submodules[key][core.var.selectedLanguage]];
		});
		el('input').innerHTML = core.function.insert.select(options, 'mailtoolsselection', 'mailtoolsselection', query, ' onchange="mailtools.function[this.options[this.selectedIndex].value+\'input\']()"') +
			'<span class="inline" id="mailtoolgen"></span>';
		el('temp').innerHTML = el('output').innerHTML = '';
		if (value(query) != '') eval('mailtools.function.' + query + 'input()');
		core.performance.stop('mailtools.function.init(\'' + value(query) + '\')');
		core.history.write(['mailtools.function.init(\'' + value(query) + '\')']);
	},

};