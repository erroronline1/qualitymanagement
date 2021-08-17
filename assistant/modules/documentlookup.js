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

if (typeof documentlookup === 'undefined') var documentlookup = {};

documentlookup.api = {
	available: function (search) {
		Object.keys(documentlookup.var.submodules).forEach(function (key) {
			core.fn.loadScript(core.var.moduleDataDir + key + '.js',
				'documentlookup.api.processAfterImport(\'' + search + '\', \'' + key + '_data\')');
		});
		core.performance.stop('documentlookup.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search, objectname) {
		var display = '';
		if (typeof objectname !== 'undefined') {
			object = eval(objectname);
			var found = core.fn.smartSearch.lookup(search, object.content, true);
			found.forEach(function (value) {
				display = documentlookup.fn.linkfile([object.content[value[0]][0], object.content[value[0]][1]], false, (object.content[value[0]][2] ? core.fn.lang('searchTitle', 'documentlookup') + object.content[value[0]][2] : false));
				//add value and relevance
				globalSearch.contribute('documentlookup', [display, value[1]]);
			});
		}
		core.performance.stop('documentlookup.api.processAfterImport(\'' + search + '\', \'' + objectname + '\')', found);
	}
};
documentlookup.fn = {
	linkfile: function (url, track, title, favourite) {
		var title = value(title) !== '' ? ' title="' + title + '" ' : '';
		var displayName = (url[1] ? url[1] : url[0].substring(url[0].lastIndexOf('/'), url[0].lastIndexOf('.')).substring(1))
		if (value(favourite) !== '') return '<span class="singlefavouritehandler"><a href="' + url[0] + '" ' + title + ' onclick="documentlookup.fn.favouriteHandler.set(\'' + documentlookup.fn.favouriteHandler.prepare(url[0]) + '\'); return;" target="_blank">' + displayName + '</a>' + core.fn.insert.icon('delete', false, false, 'onclick="documentlookup.fn.favouriteHandler.set(\':' + documentlookup.fn.favouriteHandler.prepare(url[0]) + '\'); return;"') + '</span>';
		else if (track) return '<a href="' + url[0] + '" ' + title + ' onclick="documentlookup.fn.favouriteHandler.set(\'' + documentlookup.fn.favouriteHandler.prepare(url[0]) + '\'); return;" target="_blank">' + displayName + '</a>';
		return '<a href="' + url[0] + '" ' + title + ' target="_blank">' + displayName + '</a>';
	},
	favouriteHandler: {
		prepare: function (value) {
			return value.substring(value.lastIndexOf('/'), value.lastIndexOf('.')).substring(1).replace(/[^a-z0-9]/gi, '');
		},
		set: function (value) {
			var output = core.fn.setting.get('favouritedocs'),
				deleteValue = false;
			if (value.indexOf(':') == 0) { //if preceded by : the value will be deleted from the favourite list
				deleteValue = true
				value = value.substring(1);
			}
			if (output) {
				if (output.indexOf(value) > -1) {
					var tfav = output.split(','),
						favourites = new Array();
					//create two dimensional array and add sighting if neccessary
					for (var i = 0; i < tfav.length; i += 2) {
						if (!(deleteValue && tfav[i] === value)) favourites.push(new Array(tfav[i], parseInt(tfav[i + 1]) + (tfav[i] === value ? 1 : 0)));
					}
					favourites.sort(core.fn.sortBySecondColumn);
					//reduce two dimensional array after sorting
					for (i = 0; i < favourites.length; i++) {
						favourites[i] = favourites[i].join(',');
					}
					//reduce to flat
					output = favourites.join(',');
				} else output += ',' + value + ',1';
			} else output = value + ',1';
			core.fn.setting.set('favouritedocs', output);
			core.fn.stdout('favourites', documentlookup.fn.favouriteHandler.get());
		},
		get: function () {
			var output = core.fn.setting.get('favouritedocs');
			if (output) {
				var tfav = tfav2 = new Array();
				//bring selected object into scope to avoid method callbacks in loops for performance reasons
				var interimobject = documentlookup.var.selectedObject().content;
				//assign link to index as favourite handler
				Object.keys(interimobject).forEach(function (key) {
					tfav[documentlookup.fn.favouriteHandler.prepare(interimobject[key][0])] = documentlookup.fn.linkfile([interimobject[key][0], interimobject[key][1]], true, interimobject[key][2], 1);
				});
				var tfav2 = output.split(',');
				output = '<br />' + core.fn.lang('favouriteCaption', 'documentlookup') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
					core.fn.insert.icon('delete', 'bigger', false, 'title="' + core.fn.lang('favouriteDeleteTitle', 'documentlookup') + '" onclick="documentlookup.fn.favouriteHandler.reset(\'\')"') +
					core.fn.insert.icon('clipboard', 'bigger', false, 'title="' + core.fn.lang('favouriteDefaultTitle', 'documentlookup') + '" onclick="documentlookup.fn.favouriteHandler.reset(\'' + documentlookup.var.defaultFavourites + '\')"') +
					core.fn.insert.icon('refresh', 'bigger', false, 'title="' + core.fn.lang('favouriteRestoreTitle', 'documentlookup') + '" onclick="documentlookup.fn.favouriteHandler.reset(\'' + core.fn.setting.get('customfavouritedocs') + '\')"') +
					core.fn.insert.icon('save', 'bigger', false, 'title="' + core.fn.lang('favouriteSaveTitle', 'documentlookup') + '" onclick="documentlookup.fn.favouriteHandler.customreset()"') +
					'</span><br /><br />';
				for (var i = 0; i < tfav2.length; i += 2) {
					if (tfav[tfav2[i]] !== undefined) output += tfav[tfav2[i]] + '<br />';
				}
			}
			return output || '';
		},
		reset: function (output) {
			core.fn.setting.set('favouritedocs', output);
			core.fn.growlNotif(core.fn.lang('favouriteRestoreConfirm', 'documentlookup'));
		},
		customreset: function () {
			core.fn.setting.set('customfavouritedocs', core.fn.setting.get('favouritedocs'));
			core.fn.growlNotif(core.fn.lang('favouriteSaveConfirm', 'documentlookup'));
		}
	},
	search: function (query) {
		query = query || el('documentname').value;
		core.performance.start('documentlookup.fn.search(\'' + value(query) + '\')'); //possible duplicate
		var list = '';
		if (typeof documentlookup.var.selectedObject() !== 'undefined') {
			//bring selected object into scope to avoid method callbacks in loops for performance reasons
			var interimobject = documentlookup.var.selectedObject().content;
			//list all items for overview
			Object.keys(interimobject).forEach(function (key) {
				list += documentlookup.fn.linkfile([interimobject[key][0], interimobject[key][1]], true) + '<br />';
			});
			core.fn.stdout('temp', list);
			if (value(query) !== '') {
				var found = core.fn.smartSearch.lookup(query, interimobject, true);

				// check if search matches item-list and display result
				if (found.length > 0) {
					list = '<span class="highlight">' + core.fn.lang('generalThirdTypeHint', 'documentlookup') + '</span><br /><br />';
					core.fn.smartSearch.relevance.init();
					found.forEach(function (value) {
						list += core.fn.smartSearch.relevance.nextstep(value[1]);
						list += documentlookup.fn.linkfile([interimobject[value[0]][0], interimobject[value[0]][1]], true, (interimobject[value[0]][2] ? core.fn.lang('searchTitle', 'documentlookup') + interimobject[value[0]][2] : false)) + '<br />';
					});
					core.fn.stdout('output', list);
					list = '';
				} else core.fn.stdout('output', core.fn.lang('errorNothingFound', 'documentlookup', query));
			} else core.fn.stdout('output', '<div id="favourites">' + (documentlookup.fn.favouriteHandler.get() || '') + '</div>');
		}
		core.performance.stop('documentlookup.fn.search(\'' + value(query) + '\')', found);
		core.history.write(['documentlookup.fn.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('moduledocumentlookup').checked = true; // highlight menu icon
		core.fn.loadScript(core.var.moduleDataDir + documentlookup.var.selectedModule() + '.js', 'documentlookup.fn.search(\'' + value(query) + '\')');
		//prepare selection
		var selection = {};
		Object.keys(documentlookup.var.submodules).forEach(function (key) {
			selection[key] = [key, documentlookup.var.submodules[key][core.var.selectedLanguage]];
		});
		core.fn.stdout('input',
			'<form id="search" action="javascript:documentlookup.fn.search();">' +
			'<input type="text" pattern=".{3,}" required id="documentname" placeholder="' + core.fn.lang('searchPlaceholder', 'documentlookup') + '" class="search" value="' + value(query).replace(/"/g, '&quot;') + '" />' +
			'<span onclick="documentlookup.fn.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
			core.fn.insert.select(selection, 'lookup', 'lookup', (core.fn.setting.get('lookup_bundle') || false), 'onchange="this.selectedIndex == 0 ? core.fn.setting.unset(\'lookup_bundle\') : core.fn.setting.set(\'lookup_bundle\',this.options[this.selectedIndex].value); core.fn.loadScript(\'' + core.var.moduleDataDir + '\' + this.options[this.selectedIndex].value+ \'.js\',\'documentlookup.fn.search()\');"') +
			'<input type="submit" id="submit" value="' + core.fn.lang('formSubmit', 'documentlookup') + '" hidden="hidden" /> ' +
			'<a href="file://' + documentlookup.var.thirdDocumentCategoryPath + '" target="thirdDocumentCategory">' + core.fn.insert.icon('fileexplorer', 'bigger', false, 'title="' + core.fn.lang('optionThirdType', 'documentlookup') + '"') + '</a>' +
			'</form>');
		el('documentname').focus();
		core.performance.stop('documentlookup.fn.init(\'' + value(query) + '\')');
	},
};