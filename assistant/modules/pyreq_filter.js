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
				let set = filter.sets[selection.selectedIndex || 0];
				if (set.hasOwnProperty('filter')) {
					for (let i = 0; i < set.filter.length; i++) {
						if (set.filter[i].apply == "filter_by_comparison_file" && set.filter[i].filesetting.source != "SELF") return set.filter[i].filesetting.source
					}
				}
				return false
			},
			export_directory: function (filter, selection) {
				// export directory disabled if specified in filter settings
				let set = filter.sets[selection.selectedIndex || 0];
				if (set.filesetting.destination.match(/\\|\//gmi)) return false
				return true
			},
			// submodule requests and presets
			requirements: function (filter) {
				(filter + "Src").element().placeholder = pyreq_filter.data[filter].sets[(filter + 'Set').element().selectedIndex].filesetting.source;
				if ((filter + 'CompareButton'.element()) && (filter + 'Compare').element()) {
					let filterfile = this.filter_by_comparison_file(pyreq_filter.data[filter], (filter + 'Set').element());
					(filter + 'CompareButton').element().disabled = (filter + 'Compare').element().disabled = !Boolean(filterfile);
					(filter + 'Compare').element().required = Boolean(filterfile);
					(filter + 'Compare').element().placeholder = filterfile;
					(filter + 'Compare').element().value = '';
				}
				if ((filter + 'DestinationButton').element() && (filter + 'Destination').element()) {
					let destination = this.export_directory(pyreq_filter.data[filter], (filter + 'Set').element());
					(filter + 'DestinationButton').element().disabled = (filter + 'Destination').element().disabled = !Boolean(destination);
					(filter + 'Destination').element().required = Boolean(destination);
					(filter + 'Destination').element().value = '';
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
				core.fn.static.insert.icon('advancedsetting', 'bigger', null, 'onclick="\'processfilterTrack\'.element().value = prompt(core.fn.static.lang(\'labelprocessfilterTrack\',\'pyreq_filter\'), \'processfilterTrack\'.element().value)"') + '<input type="hidden" id="processfilterTrack" />' +
				'<br /><br />' +
				core.fn.static.lang('labelprocessfilterMonth', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterMonth" value="' + (ts.getMonth() + 1) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterYear', 'pyreq_filter') + ':<br />' +
				'<input type="text" id="processfilterYear" value="' + (ts.getFullYear()) + '" required disabled /><br /><br />' +
				core.fn.static.lang('labelprocessfilterSet', 'pyreq_filter') + ':<br />' +
				core.fn.static.insert.select(filtersets, 'processfilterSet', 'processfilterSet', null, 'onchange="pyreq_filter.fn.required.requirements(\'processfilter\')"') +
				core.fn.static.insert.icon('info', 'bigger', null, 'onclick="core.fn.static.popup(pyreq_filter.data.processfilter.sets[\'processfilterSet\'.element().selectedIndex].useCase + \'<br /><textarea readonly style=&quot;overflow:scroll; width:100%; height:15em;&quot;>\' + JSON.stringify(pyreq_filter.data.processfilter.sets[\'processfilterSet\'.element().selectedIndex], null, 4) + \'</textarea>\')"') +
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
			let fsettings = JSON.parse(JSON.stringify(pyreq_filter.data.processfilter.sets['processfilterSet'.element().options['processfilterSet'.element().selectedIndex].value])),
				farguments = {
					processedMonth: 'processfilterMonth'.element().value,
					processedYear: 'processfilterYear'.element().value,
					track: {
						column: null,
						values: null
					}
				};

			fsettings['translations'] = 'translations' in pyreq_filter.data.processfilter ? JSON.parse(JSON.stringify(pyreq_filter.data.processfilter.translations)) : null;
			if ('processfilterTrack'.element().value.length) {
				let query = 'processfilterTrack'.element().value.split(':');
				farguments.track.column = query[0];
				farguments.track.values = query[1].split(',');
			}

			fsettings.filesetting.source = 'processfilterSrc'.element().value.replaceAll(/\\/ig, '/');
			if ('filter' in fsettings) {
				for (let c = 0; c < fsettings.filter.length; c++) {
					if (fsettings.filter[c].apply === "filter_by_comparison_file" && fsettings.filter[c].filesetting.source !== "SELF") fsettings.filter[c].filesetting.source = 'processfilterCompare'.element().value.replaceAll(/\\/ig, '/');
				}
			}
			let selectedDestination = 'processfilterDestination'.element().value.replaceAll(/\\/ig, '/');
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
				core.fn.static.insert.icon('info', 'bigger', null, 'onclick="core.fn.static.popup(pyreq_filter.data.stocklistfilter.sets[\'stocklistfilterSet\'.element().selectedIndex].useCase + \'<br /><textarea readonly style=&quot;overflow:scroll; width:100%; height:15em;&quot;>\' + JSON.stringify(pyreq_filter.data.stocklistfilter.sets[\'stocklistfilterSet\'.element().selectedIndex], null, 4) + \'</textarea>\')"') +
				'<br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterCompare', 'pyreq_filter') + '" onclick="core.fn.async.file.load(\'stocklistfilterCompare\', [[\'csv files\',\'*.csv\']])" id="stocklistfilterCompareButton" disabled /><br /><input type="text" id="stocklistfilterCompare" disabled /><br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelprocessfilterDestination', 'pyreq_filter') + '" onclick="core.fn.async.file.pickdir(\'stocklistfilterDestination\')" id="stocklistfilterDestinationButton" /><br /><input type="text" id="stocklistfilterDestination" required /><br /><br />' +
				'<input type="submit" id="submitstocklistfilter" value="' + core.fn.static.lang('labelstocklistfilterSubmit', 'pyreq_filter') + '" /><br /><br />' +
				'</form>');
			await core.fn.async.stdout('output', '');
			pyreq_filter.fn.required.requirements('stocklistfilter')
			core.history.write('pyreq_filter.fn.init(\'stocklistfilter\')');
		},
		stocklistfilterprepare: async function () {
			// deepcopy settings and prepare arguments
			let fsettings = JSON.parse(JSON.stringify(pyreq_filter.data.stocklistfilter.sets['stocklistfilterSet'.element().options['stocklistfilterSet'.element().selectedIndex].value]));
			fsettings['translations'] = 'translations' in pyreq_filter.data.stocklistfilter ? JSON.parse(JSON.stringify(pyreq_filter.data.stocklistfilter.translations)) : null;

			fsettings.filesetting.source = 'stocklistfilterSrc'.element().value.replaceAll(/\\/ig, '/');
			if ('filter' in fsettings) {
				for (let c = 0; c < fsettings.filter.length; c++) {
					if (fsettings.filter[c].apply === "filter_by_comparison_file" && fsettings.filter[c].filesetting.source !== "SELF") fsettings.filter[c].filesetting.source = 'stocklistfilterCompare'.element().value.replaceAll(/\\/ig, '/');
				}
			}
			let selectedDestination = 'stocklistfilterDestination'.element().value.replaceAll(/\\/ig, '/');
			fsettings.filesetting.destination = (selectedDestination.length ? selectedDestination + '/' : '') + fsettings.filesetting.destination;
			this.filtersubmit('stocklistfilter', fsettings);
		},
		filtersubmit: async function (filter, fsettings, farguments = null) {
			document.body.style.cursor = 'wait';
			("submit" + filter).element().disabled = "disabled"
			core.fn.async.stdout('output', '');
			core.eel.interface.destination = ["output".element(), "innerHTML"];
			core.eel.interface.append = true;
			let result = await eel.csvfilter(fsettings, farguments)();
			core.fn.async.stdout('output', result.replaceAll(/\n/ig, '<br />'));
			("submit" + filter).element().disabled = null
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