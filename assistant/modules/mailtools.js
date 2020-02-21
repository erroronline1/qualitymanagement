//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for creating a list of mailto-links to retrieve
// 	semi-personalized emails with the same content but
//  different salutation and recipients address, creating signatures
//  and not-available-messages
//
//  dependencies:	{core.var.moduleVarDir}mailtools.var.js
//
// in this case you will have to customize the modules directly
//
//////////////////////////////////////////////////////////////

if (typeof mailtools === 'undefined') var mailtools = {};

mailtools.api = {
	available: function (search) {
		var searchobject = [],
			display;
		Object.keys(mailtools.var.submodules).forEach(function (key) {
			searchobject.push([mailtools.var.submodules[key][core.var.selectedLanguage], key]);
		});
		var found = core.fn.smartSearch.lookup(search, searchobject, true);
		found.forEach(function (value) {
			display = '<a href="javascript:core.fn.loadScript(\'modules/mailtools.js\',\'mailtools.fn.init(\\\'' + searchobject[value[0]][1] + '\\\')\')">' + searchobject[value[0]][0] + '</a>';
			//add value and relevance
			globalSearch.contribute('mailtools', [display, value[1]]);
		});
		core.performance.stop('mailtools.api.available(\'' + search + '\')');
	},
};
mailtools.fn = {
	serialmailinput: function () {
		core.fn.stdout('mailtoolgen', core.fn.insert.icon('refresh', 'bigger', false,
			'onclick="mailtools.fn.serialmailgen()" title="' + core.fn.lang('buttonGenTitle', 'mailtools') + '"'));
		core.fn.stdout('temp', '<input type="button" value="' + core.fn.lang('buttonTestCaption', 'mailtools') + '" title="' + core.fn.lang('buttonTestTitle', 'mailtools') + '" onclick="mailtools.fn.serialtest()" /><br /><br />' +
			core.fn.lang('formRecipientListCaption', 'mailtools') + ':<br /><textarea id="names" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="' + core.fn.lang('formRecipientListPlaceholder', 'mailtools') + '"></textarea> ' +
			'<textarea id="adresses" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="' + core.fn.lang('formRecipientMailPlaceholder', 'mailtools') + '"></textarea><br />' +
			core.fn.lang('formContentCaption', 'mailtools') + ':<br /><input type="text" style="width:98%" id="subject" placeholder="' + core.fn.lang('formSubjectPlaceholder', 'mailtools') + '"><br />' +
			'<textarea id="body" rows="10" style="width:98%;" placeholder="' + core.fn.lang('formBodyPlaceholder', 'mailtools') + '" onkeydown="core.fn.mailtoLimit(this.value)"></textarea>' +
			core.fn.insert.mailtoLimit());
			core.fn.stdout('output', '');
		core.history.write(['mailtools.fn.init(\'serialmail\')']);
	},
	serialtest: function () {
		el('names').value = core.fn.lang('sampleNameValue', 'mailtools');
		el('adresses').value = core.fn.lang('sampleMailValue', 'mailtools');
		el('subject').value = core.fn.lang('sampleSubjectValue', 'mailtools');
		el('body').value = core.fn.lang('sampleBodyValue', 'mailtools');
	},
	serialmailgen: function () {
		if (el('body').value.replace('\n', '<br />').length > core.var.directMailSize) {
			alert(core.fn.lang('errorMailSizeExport'));
			return;
		}
		
		if (!el('names').value || !el('adresses').value || !el('body').value || !el('subject').value) core.fn.popup(core.fn.lang('errorNoContent', 'mailtools'));
		else {
			var names = el('names').value.split(/\n/g),
				adresses = el('adresses').value.split(/\s/g);
			if (names.length !== adresses.length) core.fn.popup(core.fn.lang('errorMatchingRows', 'mailtools'));
			else {
				var output = '';
				for (var i = 0; i < names.length; i++) {
					output += '<a href="javascript:core.fn.dynamicMailto(\'' + adresses[i] + '\',\'' + el('subject').value + '\',\'' + core.fn.lang('outputSalutation', 'mailtools', names[i]) + ' ' + names[i] + ',<br /><br />' + el('body').value.replace('\n', '<br />') + '\')">' + core.fn.lang('outputMailTo', 'mailtools') + ' ' + names[i] + ' &lt;' + adresses[i] + '&gt;</a><br />';
				}
				disableOutputSelect = true;
				core.fn.stdout('output', output);
			}
			mailtools.var.disableOutputSelect = true;
		}
	},
	signatureinput: function () {
		core.fn.stdout('mailtoolgen', core.fn.insert.icon('refresh', 'bigger', false,
			'onclick="core.fn.stdout(\'output\', mailtools_data.signature[core.var.selectedLanguage]());" title="' + core.fn.lang('buttonGenTitle', 'mailtools') + '"'));
		core.fn.stdout('temp', mailtools_data.signature[core.var.selectedLanguage](1) +
			'<br /><br />' +
			core.fn.languageSelection('onchange="core.fn.stdout(\'output\', mailtools_data.signature[this.id]());"').join('<br />') +
			(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.insert.icon('outlook') + core.fn.lang('openOutlook', 'mailtools') + '</a>' : ''));
		core.fn.stdout('output', '');
		mailtools.var.disableOutputSelect = false;
		core.history.write(['mailtools.fn.init(\'signature\')']);
	},
	notavailableinput: function () {
		core.fn.stdout('mailtoolgen', core.fn.insert.icon('refresh', 'bigger', false,
			'onclick="mailtools.fn.notavailablegen()" title="' + core.fn.lang('buttonGenTitle', 'mailtools') + '"'));
		core.fn.stdout('temp', core.fn.lang('notavailableFrom', 'mailtools') + ':<br /><input type="date" id="notfrom" placeholder="DD.MM.YYYY" /><br /><br />' +
			core.fn.lang('notavailableTo', 'mailtools') + ':<br /><input type="date" id="notto" placeholder="DD.MM.YYYY" />' +
			(core.var.outlookWebUrl ? '<br /><br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.insert.icon('outlook') + core.fn.lang('openOutlook', 'mailtools') + '</a>' : ''));
		core.fn.stdout('output', '');
		core.history.write(['mailtools.fn.init(\'notavailable\')']);
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
		core.fn.stdout('output', mailtools_data.notavailableResponse['de'](dates) +
			mailtools_data.notavailableResponse['en'](dates));
	},
	init: function (query) {
		if (typeof mailtools_data === 'undefined') core.fn.loadScript(core.var.moduleDataDir + 'mailtools.js');
		el('modulemailtools').checked = true; // highlight menu icon
		var options = new Object();
		options['null'] = ['', core.fn.lang('selectSubmodule', 'mailtools')];
		Object.keys(mailtools.var.submodules).forEach(function (key) {
			options[key] = [key, mailtools.var.submodules[key][core.var.selectedLanguage]];
		});
		core.fn.stdout('input', core.fn.insert.select(options, 'mailtoolsselection', 'mailtoolsselection', query, ' onchange="mailtools.fn[this.options[this.selectedIndex].value+\'input\']()"') +
			'<span class="inline" id="mailtoolgen"></span>');
		if (value(query) !== '') eval('mailtools.fn.' + query + 'input()');
		else core.fn.stdout('temp', core.fn.lang('useCaseDescription', 'mailtools'));
		core.performance.stop('mailtools.fn.init(\'' + value(query) + '\')');
		core.history.write(['mailtools.fn.init(\'' + value(query) + '\')']);
	},

};