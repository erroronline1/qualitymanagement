//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for processing predefined text-blocks to have an
//  automated text according to selectable topics
//
//  dependencies:	data/correspondence_....js
//
//////////////////////////////////////////////////////////////

var correspondence = {
	var: {
		lang: {
			inputLoadSubmoduleDefault: {
				en: 'select department...',
				de: 'Bereich wählen...'
			},
			inputLoadTopicDefault: {
				en: 'select topic...',
				de: 'Thema wählen...'
			},
			inputPlaceholder: {
				en: 'first name / last name recipient',
				de: 'Vor-/ Nachname Adressat'
			},
			inputOptionMale: {
				en: 'male',
				de: 'männlich'
			},
			inputOptionFemale: {
				en: 'female',
				de: 'weiblich'
			},
			inputOptionFirstperson: {
				en: 'personally',
				de: 'persönlich'
			},
			inputOptionThirdperson: {
				en: 'for third prson',
				de: 'für dritten'
			},
			inputOptionFormal: {
				en: 'formal',
				de: 'förmlich'
			},
			inputOptionInformal: {
				en: 'informal',
				de: 'persönlich'
			},
		},
		submodules: {
			select: ['', ''],
			common: ['correspondence_common', 'common'],
			//extend with additional files. this makes for a clearer categorization. 
		},
		selectedModule: function () {
			return el('submodule').options[el('submodule').selectedIndex].value || this.presetModule;
		},
		selectedObject: function () {
			return eval(correspondence.var.selectedModule() + '_data');
		},
		disableOutputSelect: false,
	},
	api: {
		available: function (search) {
			//loop through registered submodules, load them individually and let processAfterImport add smartSearch-results to globalSearch
			Object.keys(correspondence.var.submodules).forEach(function (key) {
				if (correspondence.var.submodules[key][0] != '') {
					core.function.loadScript('data/' + correspondence.var.submodules[key][0] + '.js',
						'correspondence.api.processAfterImport(\'' + search + '\', \'' + correspondence.var.submodules[key][0] + '\', \'' + correspondence.var.submodules[key][0] + '_data\')');
				}
			});
			core.performance.stop('correspondence.api.available(\''+search+'\')');
		},
		processAfterImport: function (search, submodule, objectname) {
			var searchobject = [],
				display;
			object=eval(objectname);
			Object.keys(object).forEach(function (key) {
				searchobject.push([object[key]['title'], key]);
			});
			var found = core.function.smartSearch.lookup(search, searchobject, true);
			found.forEach(function (value) {
				display = '<a href="javascript:core.function.loadScript(\'modules/correspondence.js\',\'correspondence.function.init(\\\'' + submodule + '|' + searchobject[value[0]][1] + '\\\')\')">' + searchobject[value[0]][0] + '</a>';
					//add value and relevance
					globalSearch.contribute('correspondence', [display, value[1]]);
			});
			core.performance.stop('correspondence.api.processAfterImport(\''+search+'\', \''+submodule+'\', \''+objectname+'\')');
		}
	},
	function: {
		gen: function (query) { //create user output
			if (typeof (correspondence.var.selectedObject()) != 'undefined') {
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
				el("output").innerHTML = "";
				var index = 0;
				if (el('thirdperson').checked) index = 1;
				var output = '';
				Object.keys(contents).forEach(function (value) {
					output += contents[value][core.function.languageSynthesis.outputLanguage()][index].replace(/\$(\w+?)\$/ig, function (match, group1) {
						return core.function.languageSynthesis.output(group1)
					});
					//legacy code for opt-out of output-blocks
					//el('temp').innerHTML+=core.function.insert.checkbox(output.replace(/<br \/>/g,''), 'c'+value, checkbox[value]);
					//el('output').innerHTML+=(checkbox[value]==1?output+'<br />':'');
					output += '<br />';
				});
				el('output').innerHTML = output;
				el('mailto').href = 'mailto:?body=' + core.function.escapeHTML(el('output').innerHTML, true);

			} else core.function.popup(core.function.lang('errorSelectModules', 'correspondence'));
		},

		start: function (query) {
			if (typeof (correspondence.var.selectedObject()) != 'undefined') {
				var sel = new Object();
				Object.keys(correspondence.var.selectedObject()).forEach(function (key) {
					sel[key] = [key, correspondence.var.selectedObject()[key].title];
				});
				var output = core.function.insert.select(sel, 'textTheme', 'textTheme', query, 'onchange="correspondence.function.gen()"') +
					'<br /><br />' +
					'<input type="text" placeholder="' + core.function.lang('inputPlaceholder', 'correspondence') + '" id="name" onblur="correspondence.function.gen()" /> <span id="searchname" onclick="window.open(\'https://www.google.de/#q=\'+el(\'name\').value+\'+name\',\'_blank\');" title="' + core.function.lang('webSearchTitle', 'correspondence') + '">'+core.function.icon.insert('websearch')+'</span><br /><br />' +
					'<div class="inline">' +
					core.function.insert.radio(core.function.lang('inputOptionMale', 'correspondence'), 'sex', 'male', 1, 'onchange="correspondence.function.gen()"') + '<br />' +
					core.function.insert.radio(core.function.lang('inputOptionFemale', 'correspondence'), 'sex', 'female', false, 'onchange="correspondence.function.gen()"') + ' ' +
					'</div><div class="inline">' +
					core.function.insert.radio(core.function.lang('inputOptionFirstperson', 'correspondence'), 'person', 'firstperson', 1, 'onchange="correspondence.function.gen()"') + '<br />' +
					core.function.insert.radio(core.function.lang('inputOptionThirdperson', 'correspondence'), 'person', 'thirdperson', false, 'onchange="correspondence.function.gen()"') + ' ' +
					'</div><div class="inline">' +
					core.function.languageSelection('onchange="correspondence.function.gen()"').join('<br />') +
					'</div><div class="inline">' +
					core.function.insert.radio(core.function.lang('inputOptionFormal', 'correspondence'), 'age', 'adult', 1, 'onchange="correspondence.function.gen()"') + '<br />' +
					core.function.insert.radio(core.function.lang('inputOptionInformal', 'correspondence'), 'age', 'child', false, 'onchange="correspondence.function.gen()"') + '' +
					'</div>' +
					(typeof (additionalOptions) !== "undefined" && additionalOptions ? '<br />' + additionalOptions : '') +
					(core.var.letterTemplate ? '<br /><br /><a href="' + core.var.letterTemplate + '" target="_blank">' + core.function.icon.insert('word') + core.function.lang('openLetterTemplate', 'correspondence') + '</a><br /><small>' + core.function.lang('openLetterTemplateHint', 'correspondence') + '</small>' : '') +
					'<br /><br /><a id="mailto" href="mailto:">' + core.function.icon.insert('email') + core.function.lang('openMailApp', 'correspondence') + '</a>' +
					(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.function.icon.insert('outlook') + core.function.lang('openOutlook', 'correspondence') + '</a>' : '');
				el('temp').innerHTML = output;
				if (typeof query != 'undefined') correspondence.function.gen(query);
			} else core.function.popup(core.function.lang('errorSelectModules', 'correspondence'));
			core.performance.stop('correspondence.function.start(' + (typeof query != 'undefined' ? '\'' + query + '\'' : '') + ')');
		},

		init: function (query) {
			correspondence.var.submodules.select[1] = core.function.lang('inputLoadSubmoduleDefault', 'correspondence');
			if (typeof query != 'undefined') {
				preset = query.split('|');
			}
			el('input').innerHTML = core.function.insert.select(correspondence.var.submodules,
				'submodule', 'submodule', (typeof preset != 'undefined' ? preset[0].substring(preset[0].indexOf('_')+1) : null), 'onchange="core.function.loadScript(\'data/\' + this.options[this.selectedIndex].value + \'.js\',\'correspondence.function.start()\')"') +
				'<span style="float:right" onclick="correspondence.function.gen()" title="' + core.function.lang('buttonGenTitle', 'correspondence') + '" />'+core.function.icon.insert('refresh','bigger')+'</span>';
			el('temp').innerHTML = '';
			el('output').innerHTML = '';
			if (typeof query != 'undefined') {
				correspondence.var['presetModule'] = preset[0];
				core.function.loadScript('data/' + preset[0] + '.js', 'correspondence.function.start(\'' + preset[1] + '\')');
			}
			core.performance.stop('correspondence.function.init(' + (typeof query != 'undefined' ? '\'' + query + '\'' : '') + ')');
		}
	}
}
