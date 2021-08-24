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

if (typeof correspondence === 'undefined') var correspondence = {};

correspondence.api = {
	available: function (search) {
		//loop through registered submodules, load them individually and let processAfterImport add smartSearch-results to globalSearch
		Object.keys(correspondence.var.submodules).forEach(function (key) {
			if (correspondence.var.submodules[key][0] !== '') {
				core.fn.loadScript(core.var.moduleDataDir + correspondence.var.submodules[key][0] + '.js',
					'correspondence.api.processAfterImport(\'' + search + '\', \'' + correspondence.var.submodules[key][0] + '\', \'' + correspondence.var.submodules[key][0] + '_data\')');
			}
		});
		core.performance.stop('correspondence.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search, submodule, objectname) {
		var searchobject = [],
			display;
		object = eval(objectname);
		Object.keys(object).forEach(function (key) {
			searchobject.push([object[key]['title'], key]);
		});
		var found = core.fn.smartSearch.lookup(search, searchobject, true);
		found.forEach(function (value) {
			display = '<a href="javascript:core.fn.loadScript(\'modules/correspondence.js\',\'correspondence.fn.init(\\\'' + submodule + '|' + searchobject[value[0]][1] + '\\\')\')">' + searchobject[value[0]][0] + '</a>';
			//add value and relevance
			globalSearch.contribute('correspondence', [display, value[1]]);
		});
		core.performance.stop('correspondence.api.processAfterImport(\'' + search + '\', \'' + submodule + '\', \'' + objectname + '\')');
	},
	currentStatus: function () {
		core.performance.stop('correspondence.api.currentStatus()');
		return false;
	}
};
correspondence.fn = {
	gen: function (query) { //create user output
		if (typeof correspondence.var.selectedObject() !== 'undefined') {
			//read selected checkboxes or set to default
			var checkbox = new Array();
			query = query || el('textTheme').options[el('textTheme').selectedIndex].value;
			var contents = correspondence.var.selectedObject()[query].contents;
			Object.keys(contents).forEach(function (value) {
				checkbox[value] = el('c' + value) ? (el('c' + value).checked ? 1 : 0) : 1;
			});
			//limit output to selected topics
			var inputs = document.getElementsByTagName('input'),
				wanted = new Array();
			for (var i = 0; i < inputs.length; i++) {
				if (inputs[i].checked) wanted[i] = inputs[i].value;
			}
			//output
			var index = 0;
			if (el('thirdperson').checked) index = 1;
			var output = '';
			Object.keys(contents).forEach(function (value) {
				output += contents[value][core.fn.languageSynthesis.outputLanguage()][index].replace(/\$(\w+?)\$/ig, function (match, group1) {
					return core.fn.languageSynthesis.output(group1)
				});
				//legacy code for opt-out of output-blocks
				//el('temp').innerHTML+=core.fn.insert.checkbox(output.replace(/<br \/>/g,''), 'c'+value, checkbox[value]);
				//el('output').innerHTML+=(checkbox[value]==1?output+'<br />':'');
				output += '<br />';
			});
			core.fn.stdout('output', output);
			core.fn.limitBar(core.fn.escapeHTML(output, true).length, core.var.directMailSize);
			//reassign variable value for mailto after actual output
			if (output.length > core.var.directMailSize) output = core.fn.lang('errorMailSizeExport');
			el('mailto').href = 'javascript:core.fn.dynamicMailto(\'\',\'\',\'' + output + '\')';
		} else core.fn.popup(core.fn.lang('errorSelectModules', 'correspondence'));
		core.history.write(['correspondence.fn.init(\'' + correspondence.var.selectedModule() + '|' + value(query) + '\')']);
	},

	start: function (query) {
		if (typeof correspondence.var.selectedObject() !== 'undefined') {
			var sel = new Object();
			Object.keys(correspondence.var.selectedObject()).forEach(function (key) {
				sel[key] = [key, correspondence.var.selectedObject()[key].title];
			});
			var output = core.fn.insert.select(sel, 'textTheme', 'textTheme', query, 'onchange="correspondence.fn.gen()"') +
				'<br /><br />' +
				'<input type="text" placeholder="' + core.fn.lang('inputPlaceholder', 'correspondence') + '" id="name" onblur="correspondence.fn.gen()" /> ' + core.fn.insert.icon('websearch', 'bigger', false, 'onclick="window.open(\'https://www.ecosia.org/search?q=\'+el(\'name\').value+\'+name\',\'_blank\');" title="' + core.fn.lang('webSearchTitle', 'correspondence') + '"') + '<br /><br />' +
				'<div class="inline">' +
				core.fn.insert.radio(core.fn.lang('inputOptionMale', 'correspondence'), 'sex', 'male', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
				core.fn.insert.radio(core.fn.lang('inputOptionFemale', 'correspondence'), 'sex', 'female', false, 'onchange="correspondence.fn.gen()"') + ' ' +
				'</div><div class="inline">' +
				core.fn.insert.radio(core.fn.lang('inputOptionFirstperson', 'correspondence'), 'person', 'firstperson', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
				core.fn.insert.radio(core.fn.lang('inputOptionThirdperson', 'correspondence'), 'person', 'thirdperson', false, 'onchange="correspondence.fn.gen()"') + ' ' +
				'</div><div class="inline">' +
				core.fn.languageSelection('onchange="correspondence.fn.gen()"').join('<br />') +
				'</div><div class="inline">' +
				core.fn.insert.radio(core.fn.lang('inputOptionFormal', 'correspondence'), 'age', 'adult', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
				core.fn.insert.radio(core.fn.lang('inputOptionInformal', 'correspondence'), 'age', 'child', false, 'onchange="correspondence.fn.gen()"') + '' +
				'</div>' +
				(typeof additionalOptions !== "undefined" && additionalOptions ? '<br />' + additionalOptions : '') +
				(core.var.letterTemplate ? '<br /><br /><a href="' + core.var.letterTemplate + '" target="_blank">' + core.fn.insert.icon('word') + core.fn.lang('openLetterTemplate', 'correspondence') + '</a><br /><small>' + core.fn.lang('openLetterTemplateHint', 'correspondence') + '</small>' : '') +
				'<br /><br /><a id="mailto" href="javascript:core.fn.dynamicMailto()">' + core.fn.insert.icon('email') + core.fn.lang('openMailApp', 'correspondence') + '</a>' +
				core.fn.insert.limitBar('13em', core.fn.lang('mailtoLimitBar')) +
				(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.fn.insert.icon('outlook') + core.fn.lang('openOutlook', 'correspondence') + '</a>' : '');
			core.fn.stdout('temp', output);
			if (value(query) !== '') correspondence.fn.gen(query);
		} else core.fn.popup(core.fn.lang('errorSelectModules', 'correspondence'));
		core.performance.stop('correspondence.fn.start(\'' + value(query) + '\')');
		core.history.write(['correspondence.fn.init(\'' + correspondence.var.selectedModule() + '|' + value(query) + '\')']);
	},
	init: function (query) {
		el('modulecorrespondence').checked = true; // highlight menu icon
		correspondence.var.submodules.select[1] = core.fn.lang('inputLoadSubmoduleDefault', 'correspondence');
		if (value(query) !== '') {
			preset = query.split('|');
		}
		core.fn.stdout('input', core.fn.insert.select(correspondence.var.submodules,
				'submodule', 'submodule', (typeof preset !== 'undefined' ? preset[0].substring(preset[0].indexOf('_') + 1) : null), 'onchange="core.fn.loadScript(\'' + core.var.moduleDataDir + '\' + this.options[this.selectedIndex].value + \'.js\',\'correspondence.fn.start()\')"') +
			core.fn.insert.icon('refresh', 'bigger', false, 'onclick="correspondence.fn.gen()" title="' + core.fn.lang('buttonGenTitle', 'correspondence') + '"'));
		core.fn.stdout('temp', core.fn.lang('useCaseDescription', 'correspondence'));
		if (value(query) !== '') {
			correspondence.var['presetModule'] = preset[0];
			core.fn.loadScript(core.var.moduleDataDir + preset[0] + '.js', 'correspondence.fn.start(\'' + preset[1] + '\')');
		}
		core.performance.stop('correspondence.fn.init(\'' + value(query) + '\')');
		core.history.write(['correspondence.fn.init(\'' + value(query) + '\')']);
	}
};