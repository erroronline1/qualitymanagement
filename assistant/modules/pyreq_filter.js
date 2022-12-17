//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for creating qr codes
//
//  dependencies:	{core.var.moduleVarDir}pyreq_filter.var.js
//					{core.var.moduleDataDir}pyreq_filter.data.js
////
//////////////////////////////////////////////////////////////

var pyreq_filter = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				searchobject = [];
			Object.keys(pyreq_filter.var.submodules).forEach((key) => {
				searchobject.push([pyreq_filter.var.submodules[key][core.var.selectedLanguage], key]);
			});
			found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
			found.forEach((value) => {
				display = '<a href="javascript:pyreq_filter.fn.init(\'' + searchobject[value[0]][1] + '\')">' + searchobject[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('pyreq_filter', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		processfilterinput: function () {
			let ts = new Date(),
			filtersets={};
			Object.keys(pyreq_filter.data.processfilter.sets).forEach(set=>{
				filtersets[set]=[set,pyreq_filter.data.processfilter.sets[set].destination];
			})
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_filter.fn.processfiltersubmit()">' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterSrc', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'processfilterSrc\')" /><br /><br /><input type="text" id="processfilterSrc" required /><br /><br />' +
				core.fn.static.lang('labelprocessfilterMonth', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterMonth" value="' + (ts.getMonth() + 1) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterYear', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterYear" value="' + (ts.getFullYear()) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterSet', 'pyreq_filter') + ':<br />' +
				core.fn.static.insert.select(filtersets, 'processfilterSet', 'processfilterSet') + '<br /><br />' +
				'<input type="submit" value="' + core.fn.static.lang('labelprocessfilterSubmit', 'pyreq_filter') + '" />' +
				'</form>' +
				core.fn.static.lang('processfilterInstruction', 'pyreq_filter'));
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_filter.fn.init(\'processfilter\')');
		},
		processfiltersubmit: async function () {
			let fsettings = pyreq_filter.data.processfilter.sets[el('processfilterSet').options[el('processfilterSet').selectedIndex].value],
				farguments = {
					processedMonth: el('processfilterMonth').value,
					processedYear: el('processfilterYear').value,
					track: {
						column: null,
						values: null
					}
				};
			fsettings.source = el('processfilterSrc').value.replaceAll(/\\/ig, '/');
			document.body.style.cursor = 'wait';
			let result = await eel.filter(fsettings, farguments)();
			core.fn.async.stdout('output', result.replaceAll(/\n/ig, '<br />'));
			document.body.style.cursor = 'initial';
		},


		stocklistfilterinput: function () {
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_filter.fn.stocklistfiltersubmit()">' +
				'<input type="button" value="' + core.fn.static.lang('labelstocklistfilterSrc', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'stocklistfilterSrc\')" /><br /><br /><input type="text" id="stocklistfilterSrc" required /><br /><br />' +
				core.fn.static.insert.radio(core.fn.static.lang('labelstocklistfilterTranslate', 'pyreq_filter'), 'stocklistaction', 'translate', 1) + '<br /><br />' +
				core.fn.static.insert.radio(core.fn.static.lang('labelstocklistfilterSplit', 'pyreq_filter'), 'stocklistaction', 'split', false) + '<br />' +
				core.fn.static.insert.radio(core.fn.static.lang('labelstocklistfilterSplitXLSX', 'pyreq_filter'), 'exportformat', 'x', 1) + '<br />' +
				core.fn.static.insert.radio(core.fn.static.lang('labelstocklistfilterSplitCSV', 'pyreq_filter'), 'exportformat', 'c', false) + '<br /><br />' +
				core.fn.static.lang('labelstocklistfilterSplitFactor', 'pyreq_filter') + ':<br />' +
				'<input type="text" disabled value="' + Object.keys(pyreq_filter.data.stocklistfilter.module.split.splitbycolumns).join(', ') + '" /><br /><br />' +
				'<input type="submit" value="' + core.fn.static.lang('labelstocklistfilterSubmit', 'pyreq_filter') + '" />' +
				'</form>' +
				core.fn.static.lang('stocklistfilterInstruction', 'pyreq_filter'));
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_filter.fn.init(\'stocklistfilter\')');
		},
		stocklistfiltersubmit: async function () {
			let fsettings = pyreq_filter.data.stocklistfilter,
				farguments = true,
				module;
			for (let i=0;i< document.getElementsByName('stocklistaction').length; i++){
				let action=document.getElementsByName('stocklistaction')[i];
				if (action.checked) {
					module=action.id;
					break;
				}
			}
			if (module==='split'){
				for (let i=0;i< document.getElementsByName('exportformat').length; i++){
					let action=document.getElementsByName('exportformat')[i];
					if (action.checked) {
						farguments=action.id;
						break;
					}
				}
			}
			fsettings.source = el('stocklistfilterSrc').value.replaceAll(/\\/ig, '/');
			console.log(module,farguments);
			document.body.style.cursor = 'wait';
			let result = await eel.translate_split(fsettings, module, farguments)();
			core.fn.async.stdout('output', result.replaceAll(/\n/ig, '<br />'));
			document.body.style.cursor = 'initial';
		},

		qrcodegen: async function (type) {
			let output = {
				hint: ''
			};
			if (type === 'appointment') {
				let date = el('appointmentdate').value.split(/\D/g).concat(el('appointmenttime').value.split(/\D/g)),
					cause = el('appointmentcause').value.trim(),
					details = el('appointmentdetails').value.trim(),
					duration = el('appointmentduration').value,
					dates;

				if (date.length < 5 || !cause.length) return;

				function leading0(number) {
					number = Number(number);
					return (number < 10 ? '0' + number : number).toString();
				}
				let start = new Date(date[0], date[1], date[2], date[3], date[4]),
					end = new Date();
				end.setTime(start.getTime() + duration * 3600000);
				end = [end.getFullYear().toString(), leading0(end.getMonth()), leading0(end.getDate()), leading0(end.getHours()), leading0(end.getMinutes())];
				dates = {
					start: date[0].toString() + leading0(date[1]) + leading0(date[2]) + 'T' + leading0(date[3]) + leading0(date[4]) + '00',
					end: end[0] + end[1] + end[2] + 'T' + end[3] + end[4] + '00',
					cause: cause,
					details: details
				};
				output.data = pyreq_filter.data.appointment[core.var.selectedLanguage](dates);
			} else if (type === 'labelling') {
				let dates = {
					name: el('labellingname').value.trim(),
					dob: el('labellingdob').value.trim(),
					aid: el('labellingaid').value.trim(),
					delivered: el('labellingdelivered').value.trim(),
					id: el('labellingpatientid').value.trim(),
					process: el('labellingprocessnumber').value.trim()
				};
				if (!dates.name || !dates.dob || !dates.aid || !dates.delivered) return;
				output.data = pyreq_filter.data.labelling[core.var.selectedLanguage](dates);
				output.hint = core.fn.static.lang('labellingWarning', 'pyreq_filter');
			} else if (type === 'open') {
				output.data = el('opentext').value.trim();
			}
			//creates and instantly opens with default shell commands
			await eel.createqrandopenwith(output, core.var.environment[core.var.selectedEnv].default.open, pyreq_filter.var.submodules[core.fn.static.getTab('pyreq_filterselection')][core.var.selectedLanguage])();

			core.fn.async.stdout('output', output.data.replaceAll('\n', '<br />') + (output.hint ? '<br /><br /><span class="highlight">' + output.hint + '</span>' : ''));
		},
		init: async (query = '') => {
			let options = {};
			Object.keys(pyreq_filter.var.submodules).forEach(function (key) {
				options[key] = [key, pyreq_filter.var.submodules[key][core.var.selectedLanguage]];
			});
			query = query ? query : 'processfilter';
			await core.fn.async.stdout('input',
				core.fn.static.insert.tabs(options, 'pyreq_filterselection', query, 'onchange="pyreq_filter.fn[core.fn.static.getTab(\'pyreq_filterselection\')+\'input\']()"')
			);
			core.fn.static.getTab('pyreq_filterselection');
			eval('pyreq_filter.fn.' + query + 'input()');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'pyreq_filter.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'pyreq_filter.data.js');
		}
	}
};