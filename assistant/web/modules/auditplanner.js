﻿//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for selecting random questions for audit planning
//
//  dependencies:	{core.var.moduleVarDir}auditplanner.var.js
//					{core.var.moduleDataDir}auditplanner.js
//					auditplanner.xlsm
//
//////////////////////////////////////////////////////////////

if (typeof auditplanner === 'undefined') var auditplanner = {};

auditplanner.api = {
	available: function (search) {
		core.performance.stop('auditplanner.api.available(\'' + search + '\')');
		return;
	},
	currentStatus: function () {
		core.performance.stop('auditplanner.api.currentStatus()');
		return false;
	}
};
auditplanner.fn = {
	select: async (query) => {
		//query = query || el('auditplannerquery').value;
		core.performance.start('auditplanner.fn.select(\'' + value(query) + '\')'); //possible duplicate
		let checked,
			list = '';
		if (typeof auditplanner_data !== 'undefined') {
			Object.keys(auditplanner_data.content).forEach((key) => {
				if (key > 0) { //skip first item being header only
					checked = query == 'random' ? Math.random() >= 0.5 : (query == 'none' ? false : true);
					list += core.fn.static.insert.checkbox(auditplanner_data.content[key][0] + ' ' + auditplanner_data.content[key][1], 'ap' + key, checked, 'onchange="auditplanner.fn.output()"', false) + '<br />';
				}
			});
			await core.fn.async.stdout('temp', '<span class="highlight">' + core.fn.static.lang('tableOfContents', 'auditplanner') + ':</span><br />' + list);
		}
		core.performance.stop('auditplanner.fn.select(\'' + value(query) + '\')');
		auditplanner.fn.output();
	},
	output: function () {
		core.performance.start('auditplanner.fn.output()'); //possible duplicate
		let loops,
			output = '',
			question,
			questionarray;
		if (typeof auditplanner_data !== 'undefined') {
			Object.keys(auditplanner_data.content).forEach((key) => {
				if (key > 0 && el('ap' + key).checked) { //skip first item being header only and not selected topics
					output += auditplanner_data.content[key][0] + ' ' + auditplanner_data.content[key][1] + ': ' + '<br />';
					//deep-copy line to new array
					questionarray = auditplanner_data.content[key].slice(0);
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
		core.performance.stop('auditplanner.fn.output()');
	},
	start: async (query) => {
		let qnumOptions = {
				1: [1, 'max. 1 ' + core.fn.static.lang('selectOptionQuestion', 'auditplanner')],
			},
			index = 0;
		while (Object.keys(qnumOptions).length < auditplanner.var.maximumQuestions) {
			index = Object.keys(qnumOptions).length + 1;
			qnumOptions[index] = [index, 'max. ' + index + ' ' + core.fn.static.lang('selectOptionQuestions', 'auditplanner')];
		}
		qnumOptions[index + 1] = [auditplanner_data.content[0].length, core.fn.static.lang('selectOptionAll', 'auditplanner') + ' (' + auditplanner_data.content[0].length + ')'];
		await core.fn.async.stdout('input',
			core.fn.static.insert.select(qnumOptions, 'maxquestions', 'maxquestions', '3', 'onchange="auditplanner.fn.output()"') +
			core.fn.static.insert.icon('refreshall', 'bigger inline', false, 'onclick="auditplanner.fn.select()" title="' + core.fn.static.lang('buttonAllTitle', 'auditplanner') + '"') +
			core.fn.static.insert.icon('refreshnone', 'bigger inline', false, 'onclick="auditplanner.fn.select(\'none\')" title="' + core.fn.static.lang('buttonNoneTitle', 'auditplanner') + '"') +
			core.fn.static.insert.icon('shuffle', 'bigger inline', false, 'onclick="auditplanner.fn.select(\'random\')" title="' + core.fn.static.lang('buttonShuffleTitle', 'auditplanner') + '"')
		);
		auditplanner.fn.select(value(query));
	},
	init: async (query) => {
		await core.fn.async.loadScript(core.var.moduleDataDir + 'auditplanner.js', 'auditplanner.fn.start(\'' + value(query) + '\')');
		core.history.write(['auditplanner.fn.init(\'' + value(query) + '\')']);
		core.performance.stop('auditplanner.fn.init(\'' + value(query) + '\')');
	},
};