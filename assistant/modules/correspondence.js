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
					searchobject.push([correspondence.data[m][s]['title'][core.var.selectedLanguage], s]);
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
		controls: function () {
			let contents,
				itemcount = 0,
				linebreak = '',
				query,
				selectBlocks;
			query = el('textTheme').options[el('textTheme').selectedIndex].value;
			contents = correspondence.data[correspondence.var.currentModule][query].contents;
			selectBlocks = correspondence.data[correspondence.var.currentModule][query].controls+"<div>";
			Object.keys(contents).forEach(function (key) {
				if (typeof contents[key] === 'object') {
					itemcount++;
					if (linebreak !== contents[key][core.var.selectedLanguage][0]) {
						if (itemcount > 2) selectBlocks += core.fn.static.insert.expand();
						selectBlocks += '</div><div class="items items23 expand" onclick="core.fn.static.toggleHeight(this)">';
						linebreak = contents[key][core.var.selectedLanguage][0];
						itemcount = 0;
					}
					selectBlocks += (itemcount > 1 && itemcount % 2 == 0 ? '<br />' : '') + '<label class="custominput itemalign" title="' + contents[key][core.var.selectedLanguage][1] + '">' + contents[key][core.var.selectedLanguage][1] + '<input type="checkbox" name="' + contents[key][core.var.selectedLanguage][0] + '" id="' + key + '" value="' + key + '" ' + (contents[key][core.var.selectedLanguage][2] ? 'checked="checked"' : '') + ' onchange="correspondence.fn.gen()" /><span class="checkmark"></span></label>';
				}
			});
			el('selectBlocks').innerHTML = selectBlocks;
		},
		gen: function (query='') { //create user output
			let contents,
				index = 3,
				inputs,
				output = '',
				wanted = [];
			//read selected checkboxes or set to default
			query = query || el('textTheme').options[el('textTheme').selectedIndex].value;
			contents = correspondence.data[correspondence.var.currentModule][query].contents;

			//limit output to selected topics
			inputs = document.getElementsByTagName('input');
			for (let i = 0; i < inputs.length; i++) {
				if (inputs[i].checked) wanted[i] = inputs[i].value;
			}
			//output
			if (el('thirdperson') && el('thirdperson').checked) index = 4;
			Object.keys(contents).forEach((value) => {
				if (wanted.indexOf(value) >= 0){
					output += contents[value][core.fn.languageSynthesis.outputLanguage()][index].replace(/\$(\w+?)\$/ig, function (match, group1) {
						return core.fn.languageSynthesis.output(group1)
					});
				output += '<br />';}
			});
			core.fn.async.stdout('output', output);
			core.fn.static.limitBar(core.fn.static.escapeHTML(output, true).length, core.var.directMailSize);
			//reassign variable value for mailto after actual output
			if (output.length > core.var.directMailSize) output = core.fn.static.lang('errorMailSizeExport');
			el('mailto').href = 'javascript:core.fn.static.dynamicMailto(\'\',\'\',\'' + output + '\')';
			core.history.write('correspondence.fn.init(\'' + correspondence.var.selectedModule() + '|' + query + '\')');
		},
		start: async (query = '') => {
			module = correspondence.data[correspondence.var.selectedModule()],
				output,
				sel = {};
			Object.keys(module).forEach((key) => {
				sel[key] = [key, module[key].title[core.var.selectedLanguage]];
			});
			output = core.fn.static.insert.select(sel, 'textTheme', 'textTheme', query, 'onchange="correspondence.fn.controls(); correspondence.fn.gen()"') +
				'<br /><br />' +
				'<input type="text" placeholder="' + core.fn.static.lang('inputPlaceholder', 'correspondence') + '" id="name" onblur="correspondence.fn.gen()" /> ' + core.fn.static.insert.icon('websearch', 'bigger', false, 'onclick="window.open(\'https://www.ecosia.org/search?q=\'+el(\'name\').value+\'+name\',\'_blank\');" title="' + core.fn.static.lang('webSearchTitle', 'correspondence') + '"') + '<br /><br />';

			output += '<div id="selectBlocks"></div>';

			output += (core.var.letterTemplate ? '<br /><br /><a ' + await core.fn.async.file.link(core.var.letterTemplate) + '>' + core.fn.static.insert.icon('word') + core.fn.static.lang('openLetterTemplate', 'correspondence') + '</a><br /><small>' + core.fn.static.lang('openLetterTemplateHint', 'correspondence') + '</small>' : '') +
				'<br /><br /><a id="mailto" href="javascript:core.fn.static.dynamicMailto()">' + core.fn.static.insert.icon('email') + core.fn.static.lang('openMailApp', 'correspondence') + '</a>' +
				core.fn.static.insert.limitBar('13em', core.fn.static.lang('mailtoLimitBar')) +
				(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.static.insert.icon('outlook') + core.fn.static.lang('openOutlook', 'correspondence') + '</a>' : '');
			await core.fn.async.stdout('temp', output);
			if (query) correspondence.fn.gen(query);
			correspondence.fn.controls();
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
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'correspondence.var.js');
			for (let m of Object.keys(correspondence.var.submodules)) {
				await core.fn.async.loadScript(core.var.moduleDataDir + 'correspondence.data.' + m + '.js');
			}
		}
	}
};