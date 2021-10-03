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
			core.fn.async.stdout('mailtoolgen', core.fn.static.insert.icon('refresh', 'bigger', false,
				'onclick="mailtools.fn.serialmailgen()" title="' + core.fn.static.lang('buttonGenTitle', 'mailtools') + '"'));
			core.fn.async.stdout('temp', '<input type="button" value="' + core.fn.static.lang('buttonTestCaption', 'mailtools') + '" title="' + core.fn.static.lang('buttonTestTitle', 'mailtools') + '" onclick="mailtools.fn.serialtest()" /><br /><br />' +
				core.fn.static.lang('formRecipientListCaption', 'mailtools') + ':<br /><textarea id="names" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="' + core.fn.static.lang('formRecipientListPlaceholder', 'mailtools') + '"></textarea> ' +
				'<textarea id="adresses" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="' + core.fn.static.lang('formRecipientMailPlaceholder', 'mailtools') + '"></textarea><br />' +
				core.fn.static.lang('formContentCaption', 'mailtools') + ':<br /><input type="text" style="width:98%" id="subject" placeholder="' + core.fn.static.lang('formSubjectPlaceholder', 'mailtools') + '"><br />' +
				'<textarea id="body" rows="10" style="width:98%;" placeholder="' + core.fn.static.lang('formBodyPlaceholder', 'mailtools') + '" onkeydown="core.fn.static.limitBar(core.fn.static.escapeHTML(this.value, true).length, core.var.directMailSize)"></textarea>' +
				core.fn.static.insert.limitBar(false, core.fn.static.lang('mailtoLimitBar')));
			core.fn.async.stdout('output', '');
			core.history.write('mailtools.fn.init(\'serialmail\')');
		},
		serialtest: function () {
			el('names').value = core.fn.static.lang('sampleNameValue', 'mailtools');
			el('adresses').value = core.fn.static.lang('sampleMailValue', 'mailtools');
			el('subject').value = core.fn.static.lang('sampleSubjectValue', 'mailtools');
			el('body').value = core.fn.static.lang('sampleBodyValue', 'mailtools');
		},
		serialmailgen: function () {
			let adresses,
				names,
				output = '';
			if (el('body').value.replace('\n', '<br />').length > core.var.directMailSize) {
				core.fn.static.popup(core.fn.static.lang('errorMailSizeExport'));
				return;
			}
			if (!el('names').value || !el('adresses').value || !el('body').value || !el('subject').value) core.fn.static.popup(core.fn.static.lang('errorNoContent', 'mailtools'));
			else {
				names = el('names').value.split(/\n/g),
					adresses = el('adresses').value.split(/\s/g);
				if (names.length !== adresses.length) core.fn.static.popup(core.fn.static.lang('errorMatchingRows', 'mailtools'));
				else {
					output = '';
					for (let i = 0; i < names.length; i++) {
						output += '<a href="javascript:core.fn.static.dynamicMailto(\'' + adresses[i] + '\',\'' + el('subject').value + '\',\'' + core.fn.static.lang('outputSalutation', 'mailtools', names[i]) + ' ' + names[i] + ',<br /><br />' + el('body').value.replace('\n', '<br />') + '\')">' + core.fn.static.lang('outputMailTo', 'mailtools') + ' ' + names[i] + ' &lt;' + adresses[i] + '&gt;</a><br />';
					}
					core.fn.async.stdout('output', output);
				}
				mailtools.var.disableOutputSelect = true;
			}
		},
		signatureinput: function () {
			core.fn.async.stdout('mailtoolgen', core.fn.static.insert.icon('refresh', 'bigger', false,
				'onclick="core.fn.async.stdout(\'output\', mailtools.data.signature[core.var.selectedLanguage]());" title="' + core.fn.static.lang('buttonGenTitle', 'mailtools') + '"'));
			core.fn.async.stdout('temp', mailtools.data.signature[core.var.selectedLanguage](1) +
				'<br /><br />' +
				core.fn.static.languageSelection('onchange="core.fn.async.stdout(\'output\', mailtools.data.signature[this.id]());"').join('<br />') +
				(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.static.insert.icon('outlook') + core.fn.static.lang('openOutlook', 'mailtools') + '</a>' : ''));
			core.fn.async.stdout('output', '');
			mailtools.var.disableOutputSelect = false;
			core.history.write('mailtools.fn.init(\'signature\')');
		},
		notavailableinput: function () {
			core.fn.async.stdout('mailtoolgen', core.fn.static.insert.icon('refresh', 'bigger', false,
				'onclick="mailtools.fn.notavailablegen()" title="' + core.fn.static.lang('buttonGenTitle', 'mailtools') + '"'));
			core.fn.async.stdout('temp', core.fn.static.lang('notavailableFrom', 'mailtools') + ':<br /><input type="date" id="notfrom" placeholder="DD.MM.YYYY" /><br /><br />' +
				core.fn.static.lang('notavailableTo', 'mailtools') + ':<br /><input type="date" id="notto" placeholder="DD.MM.YYYY" />' +
				(core.var.outlookWebUrl ? '<br /><br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.static.insert.icon('outlook') + core.fn.static.lang('openOutlook', 'mailtools') + '</a>' : ''));
			core.fn.async.stdout('output', '');
			core.history.write('mailtools.fn.init(\'notavailable\')');
		},
		notavailablegen: function () {
			//gets date inputs and sorts them to dd.mm.yyyy
			let from = el('notfrom').value.split(/\D/g),
				dates,
				to = el('notto').value.split(/\D/g);
			if (from[0].length > 2) from = new Array(from[2], from[1], from[0]);
			to = el('notto').value.split(/\D/g);
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
			let options = {
				'null': ['', core.fn.static.lang('selectSubmodule', 'mailtools')]
			};
			Object.keys(mailtools.var.submodules).forEach(function (key) {
				options[key] = [key, mailtools.var.submodules[key][core.var.selectedLanguage]];
			});
			await core.fn.async.stdout('input', core.fn.static.insert.select(options, 'mailtoolsselection', 'mailtoolsselection', query, ' onchange="mailtools.fn[this.options[this.selectedIndex].value+\'input\']()"') +
				'<span class="inline" id="mailtoolgen"></span>');
			if (query) eval('mailtools.fn.' + query + 'input()');
			else {
				core.fn.async.stdout('temp', core.fn.static.lang('useCaseDescription', 'mailtools'));
				core.history.write('mailtools.fn.init()');
			}
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'mailtools.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'mailtools.data.js');
		}
	}
};