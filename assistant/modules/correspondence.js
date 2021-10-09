//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for processing predefined text-blocks to have an
//  automated text according to selectable topics
//
//  dependencies:	{core.var.moduleVarDir}correspondence.var.js
//					{core.var.moduleDataDir}correspondence_....js
//
//////////////////////////////////////////////////////////////

var correspondence = {
	additionalOptions: {},
	var: {},
	data: {},
	api: {
		available: async (search) => {
			//loop through registered submodules, load them individually and let processAfterImport add smartSearch-results to globalSearch
			let display,
				found,
				searchobject = [];
			for (let m of Object.keys(correspondence.var.submodules)) {
				for (let s of Object.keys(correspondence.data[m])) {
					searchobject.push([correspondence.data[m][s]['title'], s]);
				}
				found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
				found.forEach((value) => {
					display = '<a href="javascript:correspondence.fn.init(\'' + m + '|' + searchobject[value[0]][1] + '\')">' + searchobject[value[0]][0] + '</a>';
					//add value and relevance
					core.globalSearch.contribute('correspondence', [display, value[1]]);
				});
			}
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		gen: function (query) { //create user output
			let checkbox = [],
				contents,
				index = 0,
				inputs,
				output = '',
				wanted = [];
			//read selected checkboxes or set to default
			query = query || el('textTheme').options[el('textTheme').selectedIndex].value;
			contents = correspondence.data[correspondence.var.currentModule][query].contents;
			Object.keys(contents).forEach((value) => {
				checkbox[value] = el('c' + value) ? (el('c' + value).checked ? 1 : 0) : 1;
			});
			//limit output to selected topics
			inputs = document.getElementsByTagName('input');
			for (let i = 0; i < inputs.length; i++) {
				if (inputs[i].checked) wanted[i] = inputs[i].value;
			}
			//output
			if (el('thirdperson').checked) index = 1;
			Object.keys(contents).forEach((value) => {
				output += contents[value][core.fn.languageSynthesis.outputLanguage()][index].replace(/\$(\w+?)\$/ig, function (match, group1) {
					return core.fn.languageSynthesis.output(group1)
				});
				//legacy code for opt-out of output-blocks
				//el('temp').innerHTML+=core.fn.static.insert.checkbox(output.replace(/<br \/>/g,''), 'c'+value, checkbox[value]);
				//el('output').innerHTML+=(checkbox[value]==1?output+'<br />':'');
				output += '<br />';
			});
			core.fn.async.stdout('output', output);
			core.fn.static.limitBar(core.fn.static.escapeHTML(output, true).length, core.var.directMailSize);
			//reassign variable value for mailto after actual output
			if (output.length > core.var.directMailSize) output = core.fn.static.lang('errorMailSizeExport');
			el('mailto').href = 'javascript:core.fn.dynamicMailto(\'\',\'\',\'' + output + '\')';
			core.history.write('correspondence.fn.init(\'' + correspondence.var.selectedModule() + '|' + query + '\')');
		},
		start: async (query = '') => {
			let module = correspondence.data[correspondence.var.selectedModule()],
				output,
				sel = {};
			Object.keys(module).forEach((key) => {
				sel[key] = [key, module[key].title];
			});
			output = core.fn.static.insert.select(sel, 'textTheme', 'textTheme', query, 'onchange="correspondence.fn.gen()"') +
				'<br /><br />' +
				'<input type="text" placeholder="' + core.fn.static.lang('inputPlaceholder', 'correspondence') + '" id="name" onblur="correspondence.fn.gen()" /> ' + core.fn.static.insert.icon('websearch', 'bigger', false, 'onclick="window.open(\'https://www.ecosia.org/search?q=\'+el(\'name\').value+\'+name\',\'_blank\');" title="' + core.fn.static.lang('webSearchTitle', 'correspondence') + '"') + '<br /><br />' +
				'<div class="inline">' +
				core.fn.static.insert.radio(core.fn.static.lang('inputOptionMale', 'correspondence'), 'sex', 'male', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
				core.fn.static.insert.radio(core.fn.static.lang('inputOptionFemale', 'correspondence'), 'sex', 'female', false, 'onchange="correspondence.fn.gen()"') + ' ' +
				'</div><div class="inline">' +
				core.fn.static.insert.radio(core.fn.static.lang('inputOptionFirstperson', 'correspondence'), 'person', 'firstperson', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
				core.fn.static.insert.radio(core.fn.static.lang('inputOptionThirdperson', 'correspondence'), 'person', 'thirdperson', false, 'onchange="correspondence.fn.gen()"') + ' ' +
				'</div><div class="inline">' +
				core.fn.static.languageSelection('onchange="correspondence.fn.gen()"').join('<br />') +
				'</div><div class="inline">' +
				core.fn.static.insert.radio(core.fn.static.lang('inputOptionFormal', 'correspondence'), 'age', 'adult', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
				core.fn.static.insert.radio(core.fn.static.lang('inputOptionInformal', 'correspondence'), 'age', 'child', false, 'onchange="correspondence.fn.gen()"') + '' +
				'</div>' +
				(typeof correspondence.additionalOptions[correspondence.var.currentModule] !== "undefined" && correspondence.additionalOptions[correspondence.var.currentModule] ? '<br />' + correspondence.additionalOptions[correspondence.var.currentModule] : '') +
				(core.var.letterTemplate ? '<br /><br /><a ' + await core.fn.async.file.link(core.var.letterTemplate) + '>' + core.fn.static.insert.icon('word') + core.fn.static.lang('openLetterTemplate', 'correspondence') + '</a><br /><small>' + core.fn.static.lang('openLetterTemplateHint', 'correspondence') + '</small>' : '') +
				'<br /><br /><a id="mailto" href="javascript:core.fn.static.dynamicMailto()">' + core.fn.static.insert.icon('email') + core.fn.static.lang('openMailApp', 'correspondence') + '</a>' +
				core.fn.static.insert.limitBar('13em', core.fn.static.lang('mailtoLimitBar')) +
				(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.static.insert.icon('outlook') + core.fn.static.lang('openOutlook', 'correspondence') + '</a>' : '');
			await core.fn.async.stdout('temp', output);
			if (query) correspondence.fn.gen(query);
			core.history.write('correspondence.fn.init(\'' + correspondence.var.selectedModule() + '|' + query + '\')');
		},
		init: async (query = '') => {
			let preset,
				selection = {};
			//prepare selection
			Object.keys(correspondence.var.submodules).forEach((key) => {
				selection[key] = [key, correspondence.var.submodules[key][core.var.selectedLanguage]];
			});
			if (query) {
				preset = query.split('|');
			}
			await core.fn.async.stdout('input', core.fn.static.insert.select(selection,
					'submodule', 'submodule', (typeof preset !== 'undefined' ? preset[0] : null), 'onchange="correspondence.var.currentModule = this.options[this.selectedIndex].value; correspondence.fn.start()"') +
				core.fn.static.insert.icon('refresh', 'bigger', false, 'onclick="correspondence.fn.gen()" title="' + core.fn.static.lang('buttonGenTitle', 'correspondence') + '"'));
			correspondence.var.currentModule = query ? preset[0] : correspondence.var.selectedModule();
			correspondence.fn.start(query ? preset[1] : '');
			core.history.write('correspondence.fn.init(\'' + query + '\')');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'correspondence.var.js');
			for (let m of Object.keys(correspondence.var.submodules)) {
				await core.fn.async.loadScript(core.var.moduleDataDir + 'correspondence_' + m + '.data.js');
			}
		}
	}
};