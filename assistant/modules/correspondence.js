//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for processing predefined text-blocks to have an
//  automated text according to selectable topics
//
//  dependencies:	data/correspondence_....js
//
//////////////////////////////////////////////////////////////

var module = {
	var: {
		submodules: {
			wahl: ['', ''],
			allgemein: ['data/correspondence_common.js', 'common'],
			//extend with additional files. this makes for a clearer categorization. 
		},
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
		}
	},
	function: {
		gen: function () { //create user output
			if (typeof (JSONDATA) != 'undefined') {
				//read selected checkboxes or set to default
				var checkbox = new Array();
				var contents = JSONDATA[el('textTheme').options[el('textTheme').selectedIndex].value].contents;
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

			} else core.function.popup(core.function.lang('errorSelectModules'));
		},

		start: function () {
			if (typeof (JSONDATA) != 'undefined') {

				var sel = new Object();
				Object.keys(JSONDATA).forEach(function (key) {
					sel[key] = [key, JSONDATA[key].title];
				});

				var output = core.function.insert.select(sel, 'textTheme', 'textTheme', null, 'onchange="module.function.gen()"') +
					'<br /><br />' +
					'<input type="text" placeholder="' + core.function.lang('inputPlaceholder') + '" id="name" onblur="module.function.gen()" /> <input type="button" id="searchname" value="' + core.function.lang('webSearch') + '" onclick="window.open(\'https://www.google.de/#q=\'+el(\'name\').value+\'+name\',\'_blank\');" title="' + core.function.lang('webSearchTitle') + '" /><br /><br />' +
					'<div class="inline">' +
					core.function.insert.radio(core.function.lang('inputOptionMale'), 'sex', 'male', 1, 'onchange="module.function.gen()"') + '<br />' +
					core.function.insert.radio(core.function.lang('inputOptionFemale'), 'sex', 'female', false, 'onchange="module.function.gen()"') + ' ' +
					'</div><div class="inline">' +
					core.function.insert.radio(core.function.lang('inputOptionFirstperson'), 'person', 'firstperson', 1, 'onchange="module.function.gen()"') + '<br />' +
					core.function.insert.radio(core.function.lang('inputOptionThirdperson'), 'person', 'thirdperson', false, 'onchange="module.function.gen()"') + ' ' +
					'</div><div class="inline">' +
					core.function.languageSelection('onchange="module.function.gen()"').join('<br />') +
					'</div><div class="inline">' +
					core.function.insert.radio(core.function.lang('inputOptionFormal'), 'age', 'adult', 1, 'onchange="module.function.gen()"') + '<br />' +
					core.function.insert.radio(core.function.lang('inputOptionInformal'), 'age', 'child', false, 'onchange="module.function.gen()"') + '' +
					'</div>' +
					(core.var.letterTemplate ? '<br /><br /><a href="' + core.var.letterTemplate + '">' + core.function.icon.insert('word') + core.function.lang('openLetterTemplate') + '</a><br /><small>' + core.function.lang('openLetterTemplateHint') + '</small>' : '') +
					'<br /><br /><a id="mailto" href="mailto:">' + core.function.icon.insert('email') + core.function.lang('openMailApp') + '</a>' +
					(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' + core.function.icon.insert('outlook') + core.function.lang('openOutlook') + '</a>' : '');
				if (typeof (additionalOptions) !== "undefined" && additionalOptions) output += '<br />' + additionalOptions;
				el('temp').innerHTML = output;
			} else core.function.popup(core.function.lang('errorSelectModules'));
		},

		correspondence: function () {
			module.var.submodules.wahl[1] = core.function.lang('inputLoadSubmoduleDefault');
			el('input').innerHTML = core.function.insert.select(module.var.submodules,
					'submodule', 'submodule', null, 'onchange="core.function.loadScript(this.options[this.selectedIndex].value,\'module.function.start\')"') +
				'<span style="float:right"><input type="button" onclick="module.function.gen()" value="' + core.function.lang('buttonGenCaption') + '" title="' + core.function.lang('buttonGenTitle') + '" /></span>';
			el('temp').innerHTML = '';
			el('output').innerHTML = '';
		}

	}
}

var disableOutputSelect = false;
module.function.correspondence();