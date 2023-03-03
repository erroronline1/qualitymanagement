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

var mailtools = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				searchobject = [];
			Object.keys(mailtools.var.submodules).forEach((key) => {
				searchobject.push([mailtools.var.submodules[key][core.var.selectedLanguage], key]);
			});
			found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
			found.forEach((value) => {
				display = '<a href="javascript:mailtools.fn.init(\'' + searchobject[value[0]][1] + '\')">' + searchobject[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('mailtools', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		serialmailinput: function () {
			core.fn.async.stdout('temp', '<input type="button" value="' + core.fn.static.lang('buttonTestCaption', 'mailtools') + '" title="' + core.fn.static.lang('buttonTestTitle', 'mailtools') + '" onclick="mailtools.fn.serialtest()" /><br /><br />' +
				core.fn.static.lang('formRecipientListCaption', 'mailtools') + ':<br /><textarea id="names" rows="10" style="width:calc(50% - .25em);" wrap="soft" placeholder="' + core.fn.static.lang('formRecipientListPlaceholder', 'mailtools') + '"></textarea> ' +
				'<textarea id="adresses" rows="10" style="width:calc(50% - .25em);" wrap="soft" placeholder="' + core.fn.static.lang('formRecipientMailPlaceholder', 'mailtools') + '"></textarea><br />' +
				core.fn.static.lang('formContentCaption', 'mailtools') + ':<br /><input type="text" style="width:98%" id="subject" placeholder="' + core.fn.static.lang('formSubjectPlaceholder', 'mailtools') + '"><br />' +
				'<textarea id="body" rows="10" style="width:100%;" placeholder="' + core.fn.static.lang('formBodyPlaceholder', 'mailtools') + '" onkeydown="core.fn.static.limitBar(core.fn.static.escapeHTML(this.value, true).length, core.var.directMailSize)"></textarea>' +
				core.fn.static.insert.limitBar(false, core.fn.static.lang('mailtoLimitBar')) +
				'<br /><input type="button" value="' + core.fn.static.lang('buttonGenTitle', 'mailtools') + '" title="' + core.fn.static.lang('buttonGenTitle', 'mailtools') + '" onclick="mailtools.fn.serialmailgen()" />');
			core.fn.async.stdout('output', '');
			core.history.write('mailtools.fn.init(\'serialmail\')');
		},
		serialtest: function () {
			'names'.element().value = core.fn.static.lang('sampleNameValue', 'mailtools');
			'adresses'.element().value = core.fn.static.lang('sampleMailValue', 'mailtools');
			'subject'.element().value = core.fn.static.lang('sampleSubjectValue', 'mailtools');
			'body'.element().value = core.fn.static.lang('sampleBodyValue', 'mailtools');
		},
		serialmailgen: function () {
			let adresses,
				names,
				output = '';
			if ('body'.element().value.replace('\n', '<br />').length > core.var.directMailSize) {
				core.fn.static.popup(core.fn.static.lang('errorMailSizeExport'));
				return;
			}
			if (!'names'.element().value || !'adresses'.element().value || !'body'.element().value || !'subject'.element().value) core.fn.static.popup(core.fn.static.lang('errorNoContent', 'mailtools'));
			else {
				names = 'names'.element().value.split(/\n/g),
					adresses = 'adresses'.element().value.split(/\s/g);
				if (names.length !== adresses.length) core.fn.static.popup(core.fn.static.lang('errorMatchingRows', 'mailtools'));
				else {
					output = '';
					for (let i = 0; i < names.length; i++) {
						output += '<a href="javascript:core.fn.static.dynamicMailto(\'' + adresses[i] + '\',\'' + 'subject'.element().value + '\',\'' + core.fn.static.lang('outputSalutation', 'mailtools', names[i]) + ' ' + names[i] + ',<br /><br />' + 'body'.element().value.replace('\n', '<br />') + '\')">' + core.fn.static.lang('outputMailTo', 'mailtools') + ' ' + names[i] + ' &lt;' + adresses[i] + '&gt;</a><br />';
					}
					core.fn.async.stdout('output', output);
				}
				mailtools.var.disableOutputSelect = true;
			}
		},
		signatureinput: function () {
			core.fn.async.stdout('temp', mailtools.data.signature[core.var.selectedLanguage](1) +
				'<br /><br />' +
				core.fn.static.languageSelection('onchange="core.fn.async.stdout(\'output\', mailtools.data.signature[this.id]());"').join('<br />') +
				(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.static.insert.icon('outlook') + core.fn.static.lang('openOutlook', 'mailtools') + '</a>' : ''));
			core.fn.async.stdout('output', '');
			mailtools.var.disableOutputSelect = false;
			core.history.write('mailtools.fn.init(\'signature\')');
		},
		notavailableinput: function () {
			core.fn.async.stdout('temp', core.fn.static.lang('notavailableFrom', 'mailtools') + ':<br /><input type="date" id="notfrom" placeholder="DD.MM.YYYY" onchange="mailtools.fn.notavailablegen()" /><br /><br />' +
				core.fn.static.lang('notavailableTo', 'mailtools') + ':<br /><input type="date" id="notto" placeholder="DD.MM.YYYY" onchange="mailtools.fn.notavailablegen()" />' +
				(core.var.outlookWebUrl ? '<br /><br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.static.insert.icon('outlook') + core.fn.static.lang('openOutlook', 'mailtools') + '</a>' : ''));
			core.fn.async.stdout('output', '');
			core.history.write('mailtools.fn.init(\'notavailable\')');
		},
		notavailablegen: function () {
			//gets date inputs and sorts them to dd.mm.yyyy
			let from = 'notfrom'.element().value.split(/\D/g),
				dates,
				to = 'notto'.element().value.split(/\D/g);
			if (from[0].length > 2) from = new Array(from[2], from[1], from[0]);
			to = 'notto'.element().value.split(/\D/g);
			if (to[0].length > 2) to = new Array(to[2], to[1], to[0]);
			dates = {
				from: from,
				to: to
			};
			mailtools.var.disableOutputSelect = false;
			core.fn.async.stdout('output', mailtools.data.notavailableResponse['de'](dates) +
				mailtools.data.notavailableResponse['en'](dates));
		},
		init: async (query = '') => {
			core.var.currentScope = 'mailtools';
			let options = {};
			Object.keys(mailtools.var.submodules).forEach(function (key) {
				options[key] = [key, mailtools.var.submodules[key][core.var.selectedLanguage]];
			});
			query = query ? query : 'notavailable';
			await core.fn.async.stdout('input',
				core.fn.static.insert.tabs(options, 'mailtoolsselection', query, 'onchange="mailtools.fn[core.fn.static.getTab(\'mailtoolsselection\')+\'input\']()"')
			);
			core.fn.static.getTab('mailtoolsselection');
			eval('mailtools.fn.' + query + 'input()');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'mailtools.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'mailtools.data.js');
		}
	}
};