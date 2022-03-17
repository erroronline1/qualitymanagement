//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for selecting random questions for audit planning
//
//  dependencies:	{core.var.moduleVarDir}regulatorytools.var.js
//					{core.var.moduleDataDir}regulatorytools.data.auditplanner.js
//					auditplanner.xlsm
//
//////////////////////////////////////////////////////////////

regulatorytools = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				searchobject = [];
			Object.keys(regulatorytools.var.submodules).forEach((key) => {
				searchobject.push([regulatorytools.var.submodules[key][core.var.selectedLanguage], key]);
			});
			found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
			found.forEach((value) => {
				display = '<a href="javascript:regulatorytools.fn.init(\'' + searchobject[value[0]][1] + '\')">' + searchobject[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('regulatorytools', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		auditplannerinput: async (query) => {
			let checked,
				list = '';
			let qnumOptions = {
					1: [1, 'max. 1 ' + core.fn.static.lang('selectOptionQuestion', 'regulatorytools')],
				},
				index = 0;
			while (Object.keys(qnumOptions).length < regulatorytools.var.maximumAuditQuestions) {
				index = Object.keys(qnumOptions).length + 1;
				qnumOptions[index] = [index, 'max. ' + index + ' ' + core.fn.static.lang('selectOptionQuestions', 'regulatorytools')];
			}
			qnumOptions[index + 1] = [regulatorytools.data.auditplanner.content[0].length, core.fn.static.lang('selectOptionAll', 'regulatorytools') + ' (' + regulatorytools.data.auditplanner.content[0].length + ')'];
			list+=
				core.fn.static.insert.select(qnumOptions, 'maxquestions', 'maxquestions', '3', 'onchange="regulatorytools.fn.auditplanneroutput()"') +
				core.fn.static.insert.icon('refreshall', 'bigger inline', false, 'onclick="regulatorytools.fn.auditplannerselect()" title="' + core.fn.static.lang('buttonAllTitle', 'regulatorytools') + '"') +
				core.fn.static.insert.icon('refreshnone', 'bigger inline', false, 'onclick="regulatorytools.fn.auditplannerselect(\'none\')" title="' + core.fn.static.lang('buttonNoneTitle', 'regulatorytools') + '"') +
				core.fn.static.insert.icon('shuffle', 'bigger inline', false, 'onclick="regulatorytools.fn.auditplannerselect(\'random\')" title="' + core.fn.static.lang('buttonShuffleTitle', 'regulatorytools') + '"') +
				"<br /><br />";

			if (regulatorytools.data.auditplanner !== undefined) {
				Object.keys(regulatorytools.data.auditplanner.content).forEach((key) => {
					if (key > 0) { //skip first item being header only
						checked = query == 'random' ? Math.random() >= 0.5 : (query == 'none' ? false : true);
						list += core.fn.static.insert.checkbox(regulatorytools.data.auditplanner.content[key][0] + ' ' + regulatorytools.data.auditplanner.content[key][1], 'ap' + key, checked, 'onchange="regulatorytools.fn.output()"', false) + '<br />';
					}
				});
				await core.fn.async.stdout('temp', '<span class="highlight">' + core.fn.static.lang('tableOfContents', 'regulatorytools') + ':</span><br />' + list);
			}
			regulatorytools.fn.auditplanneroutput();
		},
		auditplanneroutput: function () {
			regulatorytools.var.disableOutputSelect = false;
			let loops,
				output = '',
				question,
				questionarray;
			if (regulatorytools.data.auditplanner !== undefined) {
				Object.keys(regulatorytools.data.auditplanner.content).forEach((key) => {
					if (key > 0 && el('ap' + key).checked) { //skip first item being header only and not selected topics
						output += regulatorytools.data.auditplanner.content[key][0] + ' ' + regulatorytools.data.auditplanner.content[key][1] + ': ' + '<br />';
						//deep-copy line to new array
						questionarray = regulatorytools.data.auditplanner.content[key].slice(0);
						//cut out only questions without mutilating th original object
						questionarray = questionarray.splice(2, questionarray.length - 2);
						//strip empty elements from otherwise same length arrays
						while (questionarray.indexOf('') > -1) questionarray.splice(questionarray.indexOf(''), 1);
						//randomize array
						loops = questionarray.length,
							outputarray = [];
						for (let i = 0; i < loops; i++) {
							question = questionarray.splice(Math.floor(Math.random() * questionarray.length), 1)[0]
							if (question != undefined) outputarray.push(question);
						}
						if (questionarray[0] != undefined) outputarray.push(questionarray[0]);
						//select maximum number of questions
						outputarray = outputarray.splice(0, el('maxquestions').options[el('maxquestions').selectedIndex].value);
						outputarray.forEach(function (key) {
							output += '- ' + key + '<br /><br />';
						});
						output += '<br />';
					}
				});
				core.fn.async.stdout('output', output);
			}
		},
		imdrfinput: async(selectedAnnex = 'a')=>{
			regulatorytools.var.disableOutputSelect = true;
			let annex,
				annexOptions = {},
				annexCategories = {0: [null, core.fn.static.lang('selectTopic', 'regulatorytools')]},
				selection = '<a href="' + regulatorytools.var.imdrfurl + '" target="_blank">' + core.fn.static.lang('imdrfurl', 'regulatorytools') + '</a><br />';
			
			regulatorytools.var.imdrfAnnexes.forEach(async annex=>{
				annexOptions[annex] = [annex, "Annex "+ annex.toUpperCase()];
			});
			
			if (el('imdrfannex')) selectedAnnex = el('imdrfannex').options[el('imdrfannex').selectedIndex].value;
			annex = regulatorytools.data.imdrf.annex[selectedAnnex];
			Object.keys(annex).forEach(key=>{
				if (annex[key]['code'].length <= 3) annexCategories[annex[key]['code']] = [annex[key]['code'], annex[key]['term']];
			});
						
			selection += core.fn.static.insert.select(annexOptions, 'imdrfannex', 'imdrfannex', selectedAnnex, 'onchange="regulatorytools.fn.imdrfinput(this.options[this.selectedIndex].value); "') +
				core.fn.static.insert.select(annexCategories, 'imdrfannexcat', 'imdrfannexcat', false, 'onchange="regulatorytools.fn.imdrfoutput(this.options[this.selectedIndex].value); el(\'imdrffilter\').value=this.options[this.selectedIndex].value"') +
				'<input type="text" id="imdrffilter" placeholder="' + core.fn.static.lang('inputFilter', 'regulatorytools') + '" />' +
				'<input type="button" value="' + core.fn.static.lang('buttonFilter', 'regulatorytools') + '" onclick="regulatorytools.fn.imdrfoutput(el(\'imdrffilter\').value); if (el(\'imdrfannexcat\').options[el(\'imdrfannexcat\').selectedIndex].value != el(\'imdrffilter\').value) el(\'imdrfannexcat\').selectedIndex = 0" />';
			await core.fn.async.stdout('temp', selection);
			regulatorytools.fn.imdrfoutput();
		},
		imdrfoutput: function(filter = null){
			let annex = regulatorytools.data.imdrf.annex[el('imdrfannex').options[el('imdrfannex').selectedIndex].value],
				keep,
				output = '',
				temp = '';

			Object.keys(annex).forEach(key=>{
				//for the moment a quick and dirty filter because of current incompatibility to smartSearch
				keep = false,
				temp ='<div class="items items71" onclick="core.fn.static.toggleHeight(this)">' + core.fn.static.insert.expand();
				Object.keys(annex[key]).forEach(key2=>{
					if (!filter || annex[key][key2].toLowerCase().indexOf(filter.toLowerCase())>-1) keep = true;
					temp += '<p><span class="highlight">' + key2 + ':</span> ' + annex[key][key2] + '</p>';
				});
				temp += '</div>';
				if (keep) output += temp;
			});
			core.fn.async.stdout('output', output);
		},
		init: async (query = '') => {
			let options = {};
			Object.keys(regulatorytools.var.submodules).forEach(function (key) {
				options[key] = [key, regulatorytools.var.submodules[key][core.var.selectedLanguage]];
			});
			await core.fn.async.stdout('input',
				core.fn.static.insert.tabs(options, 'regulatorytoolsselection', query, 'onchange="regulatorytools.fn[core.fn.static.getTab(\'regulatorytoolsselection\')+\'input\']()"')
			);
			if (query) {
				core.fn.static.getTab('regulatorytoolsselection');
				eval('regulatorytools.fn.' + query + 'input()');
			} else regulatorytools.fn.auditplannerinput();
			core.history.write('regulatorytools.fn.init("' + query + '")');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'regulatorytools.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'regulatorytools.data.auditplanner.js');
			
			regulatorytools.var.imdrfAnnexes.forEach(async annex=>{
				await core.fn.async.loadScript(core.var.moduleDataDir + 'regulatorytools.data.imdrf.annex.' + annex + '.js');
			});
		}
	}
};