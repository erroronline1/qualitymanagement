//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching document-files in a static database
//
//  dependencies:	{core.var.moduleVarDir}documentlookup.var.js
//					{core.var.moduleDataDir}documentlookup_int.js,
//					{core.var.moduleDataDir}documentlookup_ext.js,
//					documents.xlsm,
//					external_dokuments.xlsm
//
//////////////////////////////////////////////////////////////

if (typeof documentlookup === 'undefined') var documentlookup = {};

documentlookup.api = {
	available: function (search) {
		Object.keys(documentlookup.var.submodules).forEach(function (key) {
			core.function.loadScript(core.var.moduleDataDir + key + '.js',
				'documentlookup.api.processAfterImport(\'' + search + '\', \'' + key + '_data\')');
		});
		core.performance.stop('documentlookup.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search, objectname) {
		var display = '';
		if (typeof objectname !== 'undefined') {
			object = eval(objectname);
			var found = core.function.smartSearch.lookup(search, object.content, true);
			found.forEach(function (value) {
				if (typeof object.content[value[0]] === 'object') display = documentlookup.function.linkfile(object.content[value[0]][0], core.function.lang('searchTitle', 'documentlookup') + object.content[value[0]][1]);
				else display = documentlookup.function.linkfile(object.content[value[0]]);
				//add value and relevance
				globalSearch.contribute('documentlookup', [display, value[1]]);
			});
		}
		core.performance.stop('documentlookup.api.processAfterImport(\'' + search + '\', \'' + objectname + '\')', found);
	}
};
documentlookup.function = {
	linkfile: function (url, title) {
		title = value(title) !== '' ? ' title="' + title + '" ' : '';
		// bad filename or dynamic url
		if (typeof url === 'object') {
			return '<a href="' + url[0] + '" ' + title + ' target="_blank">' + url[1] + '</a>';
		}
		// url with quality filename
		else return '<a href="' + url + '" ' + title + ' onclick="documentlookup.function.favouriteHandler.set(\'' + documentlookup.function.favouriteHandler.prepare(url) + '\'); return;" target="_blank">' + url.substring(url.lastIndexOf('/'), url.lastIndexOf('.')).substring(1) + '</a>';
	},
	favouriteHandler: {
		prepare: function (value) {
			return value.substring(value.lastIndexOf('/'), value.lastIndexOf('.')).substring(1).replace(/[^a-z0-9]/gi, '');
		},
		set: function (value) {
			var output = core.function.setting.get('favouritedocs');
			if (output) {
				if (output.indexOf(value) > -1) {
					var tfav = output.split(','),
						favourites = new Array();
					//create two dimensional array and add sighting if neccessary
					for (var i = 0; i < tfav.length; i += 2) {
						favourites.push(new Array(tfav[i], parseInt(tfav[i + 1]) + (tfav[i] === value ? 1 : 0)));
					}
					favourites.sort(core.function.sortBySecondColumn);
					//reduce two dimensional array after sorting
					for (i = 0; i < favourites.length; i++) {
						favourites[i] = favourites[i].join(',');
					}
					//reduce to flat
					output = favourites.join(',');
				} else output += ',' + value + ',1';
			} else output = value + ',1';
			core.function.setting.set('favouritedocs', output);
		},
		get: function () {
			var output = core.function.setting.get('favouritedocs');
			if (output) {
				var tfav = tfav2 = new Array();
				//bring selected object into scope to avoid method callbacks in loops for performance reasons
				var interimobject=documentlookup.var.selectedObject().content;
				//assign link to index as favourite handler
				Object.keys(interimobject).forEach(function (key) {
					if (typeof interimobject[key] === 'object')
						tfav[documentlookup.function.favouriteHandler.prepare(interimobject[key][0])] = documentlookup.function.linkfile(interimobject[key][0]);
					else tfav[documentlookup.function.favouriteHandler.prepare(interimobject[key])] = documentlookup.function.linkfile(interimobject[key]);
				});

				var tfav2 = output.split(',');
				output = '<br />' + core.function.lang('favouriteCaption', 'documentlookup') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
					core.function.insert.icon('delete', 'bigger', false, 'title="' + core.function.lang('favouriteDeleteTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.reset(\'\')"') +
					core.function.insert.icon('clipboard', 'bigger', false, 'title="' + core.function.lang('favouriteDefaultTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.reset(\'' + documentlookup.var.defaultFavourites + '\')"') +
					core.function.insert.icon('refresh', 'bigger', false, 'title="' + core.function.lang('favouriteRestoreTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.reset(\'' + core.function.setting.get('customfavouritedocs') + '\')"') +
					core.function.insert.icon('save', 'bigger', false, 'title="' + core.function.lang('favouriteSaveTitle', 'documentlookup') + '" onclick="documentlookup.function.favouriteHandler.customreset()"') +
					'</span><br /><br />';
				for (var i = 0; i < tfav2.length; i += 2) {
					if (tfav[tfav2[i]] !== undefined) output += tfav[tfav2[i]] + '<br />';
				}
			}
			return output || '';
		},
		reset: function (output) {
			core.function.setting.set('favouritedocs', output);
			alert(core.function.lang('favouriteRestoreConfirm', 'documentlookup'));
		},
		customreset: function () {
			core.function.setting.set('customfavouritedocs', core.function.setting.get('favouritedocs'));
			alert(core.function.lang('favouriteSaveConfirm', 'documentlookup'));
		}
	},
	search: function (query) {
		query = query || el('documentname').value;
		core.performance.start('documentlookup.function.search(\'' + value(query) + '\')'); //possible duplicate
		var list = '';
		if (typeof documentlookup.var.selectedObject() !== 'undefined') {
			//bring selected object into scope to avoid method callbacks in loops for performance reasons
			var interimobject=documentlookup.var.selectedObject().content;
			//list all items for overview
			Object.keys(interimobject).forEach(function (key) {
				if (typeof interimobject[key] === 'object') list += documentlookup.function.linkfile(interimobject[key][0]) + '<br />';
				else list += documentlookup.function.linkfile(interimobject[key]) + '<br />';
			});
			core.function.stdout('temp', list);

			if (value(query) !== '') {
				var found = core.function.smartSearch.lookup(query, interimobject, true);

				// check if search matches item-list and display result
				if (found.length > 0) {
					list = '';
					core.function.smartSearch.relevance.init();
					found.forEach(function (value) {
						list += core.function.smartSearch.relevance.nextstep(value[1]);
						if (typeof interimobject[value[0]] === 'object') list += documentlookup.function.linkfile(interimobject[value[0]][0], (interimobject[value[0]][1] ? core.function.lang('searchTitle', 'documentlookup') + interimobject[value[0]][1] : false)) + '<br />';
						else list += documentlookup.function.linkfile(interimobject[value[0]]) + '<br />';
					});
					core.function.stdout('output', list);
					list = '';
				} else core.function.stdout('output', core.function.lang('errorNothingFound', 'documentlookup', query));
			} else core.function.stdout('output', documentlookup.function.favouriteHandler.get() || '');
		}
		core.performance.stop('documentlookup.function.search(\'' + value(query) + '\')', found);
		core.history.write(['documentlookup.function.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('moduledocumentlookup').checked = true; // highlight menu icon
		core.function.loadScript(core.var.moduleDataDir + documentlookup.var.selectedModule() + '.js', 'documentlookup.function.search(\'' + value(query) + '\')');
		//prepare selection
		var selection = {};
		Object.keys(documentlookup.var.submodules).forEach(function (key) {
			selection[key] = [key, documentlookup.var.submodules[key][core.var.selectedLanguage]];
		});
		core.function.stdout('input',
			'<form id="search" action="javascript:documentlookup.function.search();">' +
			'<input type="text" pattern=".{3,}" required id="documentname" placeholder="' + core.function.lang('searchPlaceholder', 'documentlookup') + '" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + ' />' +
			'<span onclick="documentlookup.function.search();" class="search">' + core.function.insert.icon('search') + '</span> ' +
			core.function.insert.select(selection, 'lookup', 'lookup', (core.function.setting.get('lookup_bundle') || false), 'onchange="core.function.setting.set(\'lookup_bundle\',this.options[this.selectedIndex].value); core.function.loadScript(\'' + core.var.moduleDataDir + '\' + this.options[this.selectedIndex].value+ \'.js\',\'documentlookup.function.search()\');"') +
			'<input type="submit" id="submit" value="' + core.function.lang('formSubmit', 'documentlookup') + '" hidden="hidden" /> ' +
			'<a href="file://' + documentlookup.var.thirdDocumentCategoryPath + '" >' + core.function.insert.icon('fileexplorer', 'bigger', false, 'title="' + core.function.lang('optionThirdType', 'documentlookup') + '"') + '</a>' +
			'</form>');
		el('documentname').focus();
		core.performance.stop('documentlookup.function.init(\'' + value(query) + '\')');
	},
};