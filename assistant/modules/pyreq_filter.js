//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for filtering and processing csv-lists
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
				filtersets = {}
			presets = [];
			Object.keys(pyreq_filter.data.processfilter.sets).forEach(set => {
				filtersets[set] = [set, pyreq_filter.data.processfilter.sets[set].destination];
			})
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_filter.fn.processfiltersubmit()">' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterSrc', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'processfilterSrc\', [[\'csv files\',\'*.csv\']])" /><br /><input type="text" id="processfilterSrc" required />' +
				core.fn.static.insert.icon('advancedsetting', 'bigger', null, 'onclick="el(\'processfilterTrack\').value = prompt(core.fn.static.lang(\'labelprocessfilterTrack\',\'pyreq_filter\'), el(\'processfilterTrack\').value)"') + '<input type="hidden" id="processfilterTrack" />' +
				'<br /><br />' +
				core.fn.static.lang('labelprocessfilterMonth', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterMonth" value="' + (ts.getMonth() + 1) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterYear', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterYear" value="' + (ts.getFullYear()) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterSet', 'pyreq_filter') + ':<br />' +
				core.fn.static.insert.select(filtersets, 'processfilterSet', 'processfilterSet') +
				core.fn.static.insert.icon('info', 'bigger', null, 'onclick="core.fn.static.popup(pyreq_filter.data.processfilter.sets[el(\'processfilterSet\').selectedIndex].useCase + \'<br /><textarea readonly style=&quot;overflow:scroll; width:100%; height:15em;&quot;>\' + JSON.stringify(pyreq_filter.data.processfilter.sets[el(\'processfilterSet\').selectedIndex], null, 4) + \'</textarea>\')"') +
				'<br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterCompare', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'processfilterCompare\', [[\'csv files\',\'*.csv\']])" id="processfilterCompareButton" /><br /><input type="text" id="processfilterCompare" required /><br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterDestination', 'pyreq_filter') + '" onclick="core.fn.async.file.pickdir(\'processfilterDestination\')" id="processfilterDestinationButton" /><br /><input type="text" id="processfilterDestination" required /><br /><br />' +
				'<input type="submit" value="' + core.fn.static.lang('labelprocessfilterSubmit', 'pyreq_filter') + '" /><br /><br />' +
				'</form>' +
				core.fn.static.lang('processfilterInstruction', 'pyreq_filter'));
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_filter.fn.init(\'processfilter\')');
		},
		processfiltersubmit: async function () {
			// deepcopy settings and prepare arguments
			let fsettings = JSON.parse(JSON.stringify(pyreq_filter.data.processfilter.sets[el('processfilterSet').options[el('processfilterSet').selectedIndex].value])),
				farguments = {
					processedMonth: el('processfilterMonth').value,
					processedYear: el('processfilterYear').value,
					track: {
						column: null,
						values: null
					}
				};
			if (el('processfilterTrack').value.length) {
				let query = el('processfilterTrack').value.split(':');
				farguments.track.column = query[0];
				farguments.track.values = query[1].split(',');
			}

			fsettings.source = el('processfilterSrc').value.replaceAll(/\\/ig, '/');
			if ('concentrate' in fsettings) {
				for (let c = 0; c < fsettings.concentrate.length; c++) {
					if ('compare' in fsettings.concentrate[c]) fsettings.concentrate[c].compare.source = el('processfilterCompare').value.replaceAll(/\\/ig, '/');
				}
			}
			fsettings.destination = el('processfilterDestination').value.replaceAll(/\\/ig, '/') + '/' + fsettings.destination;
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
				(pyreq_filter.data.stocklistfilter.useCase ? core.fn.static.insert.icon('info', 'bigger', null, 'onclick="core.fn.static.popup(pyreq_filter.data.stocklistfilter.useCase)"') + '<br />' : '') +
				core.fn.static.lang('stocklistfilterInstruction', 'pyreq_filter'));
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_filter.fn.init(\'stocklistfilter\')');
		},
		stocklistfiltersubmit: async function () {
			let fsettings = pyreq_filter.data.stocklistfilter,
				farguments = true,
				module;
			for (let i = 0; i < document.getElementsByName('stocklistaction').length; i++) {
				let action = document.getElementsByName('stocklistaction')[i];
				if (action.checked) {
					module = action.id;
					break;
				}
			}
			if (module === 'split') {
				for (let i = 0; i < document.getElementsByName('exportformat').length; i++) {
					let action = document.getElementsByName('exportformat')[i];
					if (action.checked) {
						farguments = action.id;
						break;
					}
				}
			}
			fsettings.source = el('stocklistfilterSrc').value.replaceAll(/\\/ig, '/');
			console.log(module, farguments);
			document.body.style.cursor = 'wait';
			let result = await eel.translate_split(fsettings, module, farguments)();
			core.fn.async.stdout('output', result.replaceAll(/\n/ig, '<br />'));
			document.body.style.cursor = 'initial';
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