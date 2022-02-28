//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching document-files in a static database
//
//  dependencies:	{core.var.moduleVarDir}documentlookup.var.js
//					{core.var.moduleDataDir}documentlookup_int.js,
//					{core.var.moduleDataDir}documentlookup_ext.js,
//					internal documents in force.xlsm,
//					external documents in force.xlsm
//
//////////////////////////////////////////////////////////////

var documentlookup = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display = '',
				found,
				object = [];
			for (let key of Object.keys(documentlookup.data)) {
				if (documentlookup.data[key].type == 'list') object = object.concat(documentlookup.data[key].content);
			};
			found = await core.fn.async.smartSearch.lookup(search, object, true);
			for (let value of found) {
				display = await documentlookup.fn.linkfile([object[value[0]][0], object[value[0]][1]], false, (object[value[0]][2] ? core.fn.static.lang('searchTitle', 'documentlookup') + object[value[0]][2] : false));
				//add value and relevance
				core.globalSearch.contribute('documentlookup', [display, value[1]]);
			};
		},
		currentStatus: async () => {
			let display = await documentlookup.fn.favouriteHandler.get();
			if (display) core.globalSearch.contribute('documentlookup', [display, 1]);
		}
	},
	fn: {
		linkfile: async (url, track, title = '', favourite = '') => {
			let displayName = (url[1] ? url[1] : url[0].substring(url[0].lastIndexOf('/'), url[0].lastIndexOf('.')).substring(1))
			title = title ? ' title="' + title + '" ' : '';
			if (favourite) return '<span class="singlefavouritehandler"><a ' + await core.fn.async.file.link(url[0], 'documentlookup.fn.favouriteHandler.set(\'' + documentlookup.fn.favouriteHandler.prepare(url[0]) + '\'); return;') + title + '>' + displayName + '</a>' + core.fn.static.insert.icon('delete', false, false, 'onclick="documentlookup.fn.favouriteHandler.set(\':' + documentlookup.fn.favouriteHandler.prepare(url[0]) + '\'); return;"') + '</span>';
			else if (track) return '<a ' + await core.fn.async.file.link(url[0], 'documentlookup.fn.favouriteHandler.set(\'' + documentlookup.fn.favouriteHandler.prepare(url[0]) + '\'); return;') + title + '>' + displayName + '</a>';
			return '<a ' + await core.fn.async.file.link(url[0]) + title + '>' + displayName + '</a>';
		},
		favouriteHandler: {
			prepare: (value) => {
				return value.substring(value.lastIndexOf('/'), value.lastIndexOf('.')).substring(1).replace(/[^a-z0-9]/gi, '');
			},
			set: async (value) => {
				let deleteValue = false,
					favourites = [],
					favOutput,
					output = await core.fn.async.memory.read('documentlookupFav'),
					tfav;
				if (value.indexOf(':') == 0) { //if preceded by : the value will be deleted from the favourite list
					deleteValue = true
					value = value.substring(1);
				}
				if (output) {
					if (output.indexOf(value) > -1) {
						tfav = output.split(',');
						//create two dimensional array and add sighting if neccessary
						for (let i = 0; i < tfav.length; i += 2) {
							if (!(deleteValue && tfav[i] === value)) favourites.push(new Array(tfav[i], parseInt(tfav[i + 1]) + (tfav[i] === value ? 1 : 0)));
						}
						favourites.sort(core.fn.sortBySecondColumn);
						//reduce two dimensional array after sorting
						for (let i = 0; i < favourites.length; i++) {
							favourites[i] = favourites[i].join(',');
						}
						//reduce to flat
						output = favourites.join(',');
					} else output += ',' + value + ',1';
				} else output = value + ',1';
				core.fn.async.memory.write('documentlookupFav', output);
				favOutput = await documentlookup.fn.favouriteHandler.get('withtools')
				core.fn.async.stdout('favourites', favOutput);
			},
			get: async (tools) => {
				let interimobject = [],
					filter,
					output = await core.fn.async.memory.read('documentlookupFav'),
					tfav = [],
					tfav2 = [];

				if (output) {
					Object.keys(documentlookup.data).forEach((key) => {
						if (documentlookup.data[key].type == 'list') {
							interimobject = interimobject.concat(documentlookup.data[key].content);
						}
					});
					//assign link to index as favourite handler
					for (let key of Object.keys(interimobject)) {
						tfav[documentlookup.fn.favouriteHandler.prepare(interimobject[key][0])] = await documentlookup.fn.linkfile([interimobject[key][0], interimobject[key][1]], true, interimobject[key][2], 1);
					};
					tfav2 = output.split(',');
					output = (tools !== undefined) ? '<br />' + core.fn.static.lang('favouriteCaption', 'documentlookup') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
						core.fn.static.insert.icon('delete', 'bigger', false, 'title="' + core.fn.static.lang('favouriteDeleteTitle', 'documentlookup') + '" onclick="core.fn.async.memory.delete(\'documentlookupFav\'); core.fn.async.growlNotif(core.fn.static.lang(\'favouriteRestoreConfirm\', \'documentlookup\'))"') +
						'</span><br /><br />' : '';
					for (let i = 0; i < tfav2.length; i += 2) {
						if (tfav[tfav2[i]] !== undefined) output += tfav[tfav2[i]] + '<br />';
					}
				}
				return output || '';
			}
		},
		search: async (query = '') => {
			query = query || el('documentname').value;
			// set filter for next use
			let selectedFilter = core.fn.static.getTab('filter');
			if (!selectedFilter) await core.fn.async.memory.delete('documentlookupFilter');
			else await core.fn.async.memory.write('documentlookupFilter', selectedFilter);
			let drop,
				e,
				favourites,
				found,
				fullobject = [],
				i,
				interimobject = [],
				list = '',
				filter = await core.fn.async.memory.read('documentlookupFilter');
			if (!filter) {
				for (let key of Object.keys(documentlookup.data)) {
					if (documentlookup.data[key].type == 'list') fullobject = fullobject.concat(documentlookup.data[key].content);
				};
			} else if (documentlookup.data[filter].type == 'list') fullobject = documentlookup.data[filter].content;

			for (i = 0; i < fullobject.length; i++) {
				drop = false;
				for (e = 0; e < documentlookup.var.filter.length; e++) {
					if (RegExp(documentlookup.var.filter[e]).test(fullobject[i][0])) drop = true;
				}
				if (!drop) interimobject.push(fullobject[i]);
			}

			if (interimobject.length) {
				//list all items for overview
				for (let key of Object.keys(interimobject)) {
					list += await documentlookup.fn.linkfile([interimobject[key][0], interimobject[key][1]], true) + '<br />';
				};
				core.fn.async.stdout('temp', list);
				if (query) {
					found = await core.fn.async.smartSearch.lookup(query, interimobject, true);

					// check if search matches item-list and display result
					if (found.length > 0) {
						list = '';
						core.fn.async.smartSearch.relevance.init();
						for (let value of found) {
							list += core.fn.async.smartSearch.relevance.nextstep(value[1]);
							list += await documentlookup.fn.linkfile([interimobject[value[0]][0], interimobject[value[0]][1]], true, (interimobject[value[0]][2] ? core.fn.static.lang('searchTitle', 'documentlookup') + interimobject[value[0]][2] : false)) + '<br />';
						};
						await core.fn.async.stdout('output', list);
					} else core.fn.async.stdout('output', core.fn.static.lang('errorNothingFound', 'documentlookup', query));
				} else {
					favourites = await documentlookup.fn.favouriteHandler.get('withtools');
					core.fn.async.stdout('output', '<div id="favourites">' + (favourites || '') + '</div>');
				}
			} else {
				// must be dir...
				core.fn.async.stdout('temp', '<a href="file://' + documentlookup.data[filter].content + '" target="documentDir">' + core.fn.static.lang('openDir', 'documentlookup') + documentlookup.data[filter].name + '</a>');
			}
			core.history.write('documentlookup.fn.init(\'' + query + '\')');
		},
		init: async (query = '') => {
			let documentlookupFilter,
				filter = {
					all: [false, core.fn.static.lang('filterNone', 'documentlookup')]
				};
			//prepare filter
			Object.keys(documentlookup.data).forEach((key) => {
				filter[key] = [key, documentlookup.data[key].name];
			});
			documentlookupFilter = await core.fn.async.memory.read('documentlookupFilter');
			await core.fn.async.stdout('input',
				'<form id="search" action="javascript:documentlookup.fn.search();">' +
				'<input type="text" pattern=".{3,}" required id="documentname" placeholder="' + core.fn.static.lang('searchPlaceholder', 'documentlookup') + '" class="search" value="' + query.replace(/"/g, '&quot;') + '" />' +
				'<span onclick="documentlookup.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
				core.fn.static.insert.tabs(filter, 'filter', (documentlookupFilter || false), 'onchange="documentlookup.fn.search();"') +
				'<input type="submit" id="submit" value="' + core.fn.static.lang('formSubmit', 'documentlookup') + '" hidden="hidden" /> ' +
				'</form>');
			el('documentname').focus();
			documentlookup.fn.search(query);
		},
		load: async () => {
			let list;
			await core.fn.async.loadScript(core.var.moduleVarDir + 'documentlookup.var.js');
			for (let m of documentlookup.var.lists) {
				await core.fn.async.loadScript(m);
			}
			for (let m of documentlookup.var.dirs) {
				try {
					list = await eel.file_readdir(m.path)();
					documentlookup.data[m.id] = {
						name: m[core.var.selectedLanguage],
						type: 'list',
						content: list
					};
				} catch {
					/* eel-object undefined */
					documentlookup.data[m.id] = {
						name: m[core.var.selectedLanguage],
						type: 'dir',
						content: m.path
					};
				}
			}
		}
	}
};