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
		required: {
			// filter analyzer 
			filter_by_comparison_file: function (filter, selection) {
				//comparison file not required if no comparison filter specified
				let set = filter.sets[selection.selectedIndex||0];
				if (set.hasOwnProperty('filter')) {
					for (let i = 0; i < set.filter.length; i++) {
						if (set.filter[i].apply == "filter_by_comparison_file" && set.filter[i].filesetting.source != "SELF") return set.filter[i].filesetting.source
					}
				}
				return false
			},
			export_directory: function (filter, selection) {
				// export directory disabled if specified in filter settings
				let set = filter.sets[selection.selectedIndex||0];
				if (set.filesetting.destination.match(/\\|\//gmi)) return false
				return true
			},
			// submodule requests and presets
			requirements: function (filter) {
				el(filter + "Src").placeholder = pyreq_filter.data[filter].sets[el(filter + 'Set').selectedIndex].filesetting.source;
				if (el(filter + 'CompareButton') && el(filter + 'Compare')) {
					let filterfile = this.filter_by_comparison_file(pyreq_filter.data[filter], el(filter + 'Set'));
					el(filter + 'CompareButton').disabled = el(filter + 'Compare').disabled = !Boolean(filterfile);
					el(filter + 'Compare').required = Boolean(filterfile);
					el(filter + 'Compare').placeholder = filterfile;
					el(filter + 'Compare').value = '';
				}
				if (el(filter + 'DestinationButton') && el(filter + 'Destination')) {
					let destination = this.export_directory(pyreq_filter.data[filter], el(filter + 'Set'));
					el(filter + 'DestinationButton').disabled = el(filter + 'Destination').disabled = !Boolean(destination);
					el(filter + 'Destination').required = Boolean(destination);
					el(filter + 'Destination').value = '';
				}
			}
		},
		processfilterinput: async function () {
			let ts = new Date(),
				filtersets = {};
			Object.keys(pyreq_filter.data.processfilter.sets).forEach(set => {
				filtersets[set] = [set, pyreq_filter.data.processfilter.sets[set].filesetting.destination];
			})
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_filter.fn.processfilterprepare()">' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterSrc', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'processfilterSrc\', [[\'csv files\',\'*.csv\']])" /><br /><input type="text" id="processfilterSrc" required />' +
				core.fn.static.insert.icon('advancedsetting', 'bigger', null, 'onclick="el(\'processfilterTrack\').value = prompt(core.fn.static.lang(\'labelprocessfilterTrack\',\'pyreq_filter\'), el(\'processfilterTrack\').value)"') + '<input type="hidden" id="processfilterTrack" />' +
				'<br /><br />' +
				core.fn.static.lang('labelprocessfilterMonth', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterMonth" value="' + (ts.getMonth() + 1) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterYear', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterYear" value="' + (ts.getFullYear()) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterSet', 'pyreq_filter') + ':<br />' +
				core.fn.static.insert.select(filtersets, 'processfilterSet', 'processfilterSet', null, 'onchange="pyreq_filter.fn.required.requirements(\'processfilter\')"') +
				core.fn.static.insert.icon('info', 'bigger', null, 'onclick="core.fn.static.popup(pyreq_filter.data.processfilter.sets[el(\'processfilterSet\').selectedIndex].useCase + \'<br /><textarea readonly style=&quot;overflow:scroll; width:100%; height:15em;&quot;>\' + JSON.stringify(pyreq_filter.data.processfilter.sets[el(\'processfilterSet\').selectedIndex], null, 4) + \'</textarea>\')"') +
				'<br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterCompare', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'processfilterCompare\', [[\'csv files\',\'*.csv\']])" id="processfilterCompareButton" /><br /><input type="text" id="processfilterCompare" required /><br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterDestination', 'pyreq_filter') + '" onclick="core.fn.async.file.pickdir(\'processfilterDestination\')" id="processfilterDestinationButton" /><br /><input type="text" id="processfilterDestination" required /><br /><br />' +
				'<input type="submit" id="submitprocessfilter" value="' + core.fn.static.lang('labelprocessfilterSubmit', 'pyreq_filter') + '" /><br /><br />' +
				'</form>');
			await core.fn.async.stdout('output', '');
			pyreq_filter.fn.required.requirements('processfilter');
			core.history.write('pyreq_filter.fn.init(\'processfilter\')');
		},
		processfilterprepare: async function () {
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

			fsettings['translations'] = 'translations' in pyreq_filter.data.processfilter ? JSON.parse(JSON.stringify(pyreq_filter.data.processfilter.translations)) : null;
			if (el('processfilterTrack').value.length) {
				let query = el('processfilterTrack').value.split(':');
				farguments.track.column = query[0];
				farguments.track.values = query[1].split(',');
			}

			fsettings.filesetting.source = el('processfilterSrc').value.replaceAll(/\\/ig, '/');
			if ('filter' in fsettings) {
				for (let c = 0; c < fsettings.filter.length; c++) {
					if (fsettings.filter[c].apply === "filter_by_comparison_file" && fsettings.filter[c].filesetting.source !== "SELF") fsettings.filter[c].filesetting.source = el('processfilterCompare').value.replaceAll(/\\/ig, '/');
				}
			}
			let selectedDestination = el('processfilterDestination').value.replaceAll(/\\/ig, '/');
			fsettings.filesetting.destination = (selectedDestination.length ? selectedDestination + '/' : '') + fsettings.filesetting.destination;
			this.filtersubmit('processfilter', fsettings, farguments);
		},

		stocklistfilterinput: async function () {
			let filtersets = {};
			Object.keys(pyreq_filter.data.stocklistfilter.sets).forEach(set => {
				filtersets[set] = [set, pyreq_filter.data.stocklistfilter.sets[set].filesetting.destination];
			})
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_filter.fn.stocklistfilterprepare()">' +
				'<input type="button" value="' + core.fn.static.lang('labelstocklistfilterSrc', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'stocklistfilterSrc\', [[\'csv files\',\'*.csv\']])" /><br /><input type="text" id="stocklistfilterSrc" required /><br /> <br />' +
				core.fn.static.lang('labelprocessfilterSet', 'pyreq_filter') + ':<br />' +
				core.fn.static.insert.select(filtersets, 'stocklistfilterSet', 'stocklistfilterSet', null, 'onchange="pyreq_filter.fn.required.requirements(\'stocklistfilter\')"') +
				core.fn.static.insert.icon('info', 'bigger', null, 'onclick="core.fn.static.popup(pyreq_filter.data.stocklistfilter.sets[el(\'stocklistfilterSet\').selectedIndex].useCase + \'<br /><textarea readonly style=&quot;overflow:scroll; width:100%; height:15em;&quot;>\' + JSON.stringify(pyreq_filter.data.stocklistfilter.sets[el(\'stocklistfilterSet\').selectedIndex], null, 4) + \'</textarea>\')"') +
				'<br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterDestination', 'pyreq_filter') + '" onclick="core.fn.async.file.pickdir(\'stocklistfilterDestination\')" id="stocklistfilterDestinationButton" /><br /><input type="text" id="stocklistfilterDestination" required /><br /><br />' +
				'<input type="submit" id="submitstocklistfilter" value="' + core.fn.static.lang('labelstocklistfilterSubmit', 'pyreq_filter') + '" /><br /><br />' +
				'</form>');
			await core.fn.async.stdout('output', '');
			pyreq_filter.fn.required.requirements('stocklistfilter')
			core.history.write('pyreq_filter.fn.init(\'stocklistfilter\')');
		},
		stocklistfilterprepare: async function () {
			// deepcopy settings and prepare arguments
			let fsettings = JSON.parse(JSON.stringify(pyreq_filter.data.stocklistfilter.sets[el('stocklistfilterSet').options[el('stocklistfilterSet').selectedIndex].value]));
			fsettings['translations'] = 'translations' in pyreq_filter.data.stocklistfilter ? JSON.parse(JSON.stringify(pyreq_filter.data.stocklistfilter.translations)) : null;

			fsettings.filesetting.source = el('stocklistfilterSrc').value.replaceAll(/\\/ig, '/');
			let selectedDestination = el('stocklistfilterDestination').value.replaceAll(/\\/ig, '/');
			fsettings.filesetting.destination = (selectedDestination.length ? selectedDestination + '/' : '') + fsettings.filesetting.destination;
			this.filtersubmit('stocklistfilter', fsettings);
		},
		filtersubmit: async function (filter, fsettings, farguments = null) {
			document.body.style.cursor = 'wait';
			el("submit" + filter).disabled = "disabled"
			core.fn.async.stdout('output', '');
			core.eel.interface.destination = [el("output"), "innerHTML"];
			core.eel.interface.append = true;
			let result = await eel.filter(fsettings, farguments)();
			core.fn.async.stdout('output', result.replaceAll(/\n/ig, '<br />'));
			el("submit" + filter).disabled = null
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