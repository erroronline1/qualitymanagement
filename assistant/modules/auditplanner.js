//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for selecting random questions for audit planning
//
//  dependencies:	{core.var.moduleVarDir}auditplanner.var.js
//					{core.var.moduleDataDir}auditplanner.js
//
//////////////////////////////////////////////////////////////

if (typeof auditplanner === 'undefined') var auditplanner = {};

auditplanner.api = {
	available: function (search) {
		core.performance.stop('auditplanner.api.available(\'' + search + '\')');
		return;
	}
};
auditplanner.function = {
	select: function (query) {
		//query = query || el('auditplannerquery').value;
		core.performance.start('auditplanner.function.select(\'' + value(query) + '\')'); //possible duplicate
		if (typeof auditplanner_data !== 'undefined') {
			var list = '';
			Object.keys(auditplanner_data.content).forEach(function (key) {
				var checked = query == 'random' ? Math.random() >= 0.5 : true;
				list += core.function.insert.checkbox(auditplanner_data.content[key][1], 'ap' + key, checked, 'onchange="auditplanner.function.output()"', false) + '<br />';
			});
			core.function.stdout('temp', '<span class="highlight">' + core.function.lang('tableOfContents', 'auditplanner') + ':</span><br />' + list);
		}
		core.performance.stop('auditplanner.function.select(\'' + value(query) + '\')');
		core.history.write(['auditplanner.function.select(\'' + value(query) + '\')']);
		auditplanner.function.output();
	},
	output: function () {
		core.performance.start('auditplanner.function.output()'); //possible duplicate
		if (typeof auditplanner_data !== 'undefined') {
			var output = '';
			Object.keys(auditplanner_data.content).forEach(function (key) {
				if (el('ap' + key).checked) {
					output += auditplanner_data.content[key][0] + ' ' + auditplanner_data.content[key][1] + ': ' + '<br />';

					//deep-copy line to new array
					var questionarray = auditplanner_data.content[key].slice(0);
					//cut out only questions without mutilating th original object
					questionarray = questionarray.splice(2, questionarray.length - 2);
					//strip empty elements from otherwise same length arrays
					while (questionarray.indexOf('') > -1) questionarray.splice(questionarray.indexOf(''), 1);
					//randomize array
					var loops = questionarray.length,
						outputarray = [];
					for (var i = 0; i < loops; i++) {
						var question = questionarray.splice(Math.floor(Math.random() * questionarray.length), 1)[0]
						if (question != undefined) outputarray.push(question);
					}
					if (questionarray[0] != undefined) outputarray.push(questionarray[0]);
					//select maximum number of questions
					outputarray = outputarray.splice(0, el('maxquestions').options[el('maxquestions').selectedIndex].value);
					outputarray.forEach(function (key) {
						output += key + '<br />';
					});
					output += '<br />';
				}

			});
			core.function.stdout('output', output);
		}
		core.performance.stop('auditplanner.function.output()');
	},
	init: function (query) {
		el('moduleauditplanner').checked = true; // highlight menu icon
		core.function.loadScript(core.var.moduleDataDir + 'auditplanner.js', 'auditplanner.function.select(\'' + value(query) + '\')');
		
		qnumOptions={1: [1, 'max. 1 ' + core.function.lang('selectOptionQuestion', 'auditplanner')],}
		while (Object.keys(qnumOptions).length<auditplanner.var.maximumQuestions) {
			var index=Object.keys(qnumOptions).length+1;
			qnumOptions[index]= [index, 'max. ' + index + ' ' + core.function.lang('selectOptionQuestions', 'auditplanner')];
		}
		core.function.stdout('input',
			core.function.insert.select(qnumOptions, 'maxquestions', 'maxquestions', false, 'onchange="auditplanner.function.output()"') +
			core.function.insert.icon('refresh', 'bigger inline', false, 'onclick="auditplanner.function.select()" title="' + core.function.lang('buttonAllTitle', 'auditplanner') + '"') +
			core.function.insert.icon('shuffle', 'bigger inline', false, 'onclick="auditplanner.function.select(\'random\')" title="' + core.function.lang('buttonShuffleTitle', 'auditplanner') + '"')
		);
		core.performance.stop('auditplanner.function.init(\'' + value(query) + '\')');
	},
};