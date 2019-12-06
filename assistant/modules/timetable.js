//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for accessing central excel timetables for all coworkers
//
//  dependencies:	{core.var.moduleVarDir}timetable.var.js
//					{core.var.moduleDataDir}timetable.js
//
//////////////////////////////////////////////////////////////

if (typeof timetable === 'undefined') var timetable = {};

timetable.api = {
	available: function (search) {
		var queryString=search.split(/\W/),
			searchTerms=timetable.var.searchTerms[core.var.selectedLanguage],
			found=false;
		for (var i = 0 ; i < searchTerms.length; i++){
			console.log (queryString);
			if (searchTerms[i].toLowerCase().indexOf(queryString[0].toLowerCase()) > -1) {
				found=true;
				break;
			}
		}
		if (found) {
			queryString.shift();
			display='<a href="javascript:core.function.loadScript(\'modules/timetable.js\',\'timetable.function.init(\\\'' + queryString.join(' ') + '\\\')\')">' + core.var.modules.timetable.display[core.var.selectedLanguage] + (queryString.length>0 ? core.function.lang('apiFound', 'timetable') + queryString.join(' '):'') + '</a>';
			//add value and relevance
			globalSearch.contribute('timetable', [display, 1]);
		}
		core.performance.stop('timetable.api.available(\'' + search + '\')');
	},
};
timetable.function = {
	search: function (query) {
		query = query || el('timetablequery').value;
		core.performance.start('timetable.function.input(\'' + value(query) + '\')'); //possible duplicate
		if (value(query) !== '') {
			//see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
			//core.function.stdout('output', '<a href="'+timetable.var.path + window.btoa(unescape(encodeURIComponent(query.toLowerCase()))) + '.xlsm" target="wh">zur Tabelle von ' + query + '</a>');
			core.function.stdout('output', timetable.function.linkfile(query));
		}
		core.performance.stop('timetable.function.input(\'' + value(query) + '\')');
		core.history.write(['timetable.function.init(\'\')']);
	},
	linkfile: function (name) {
		return '<a href="'+timetable.var.path + name.toLowerCase() + '.xlsm"  onclick="timetable.function.favouriteHandler.set(\'' + timetable.function.favouriteHandler.prepare(name) + '\'); return;" target="_blank">' + core.function.lang('linkTitle','timetable') + name + '</a>';
	},
	favouriteHandler: {
		prepare: function (value) {
			return encodeURI(value.toLowerCase());
		},
		set: function (value) {
			var output = core.function.setting.get('favouritetimetable');
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
			core.function.setting.set('favouritetimetable', output);
		},
		get: function () {
			var output = core.function.setting.get('favouritetimetable');
			if (output) {

				var tfav2 = output.split(',');
				output = '<br />' + core.function.lang('favouriteCaption', 'timetable') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
					core.function.insert.icon('delete', 'bigger', false, 'title="' + core.function.lang('favouriteDeleteTitle', 'timetable') + '" onclick="timetable.function.favouriteHandler.reset(\'\')"') +
					'</span><br /><br />';
				for (var person = 0; person < tfav2.length; person += 2) {
					var favName=decodeURI(tfav2[person]).split(' ');
					console.log(favName);
					for (var name = 0; name < favName.length; name++){ favName[name]=favName[name][0].toUpperCase() + favName[name].slice(1);}
					
					output += timetable.function.linkfile(favName.join(' ')) + '<br />';
				}
			}
			return output || '';
		},
		reset: function (output) {
			core.function.setting.set('favouritetimetable', output);
			alert(core.function.lang('favouriteResetConfirm', 'timetable'));
		},
	},
	init: function (query) {
		el('moduletimetable').checked = true; // highlight menu icon
		core.function.stdout('input',
			'<form id="search" action="javascript:timetable.function.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.function.lang('formInputPlaceholder', 'timetable') + '" id="timetablequery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
			'<span onclick="timetable.function.search();" class="search">' + core.function.insert.icon('search') + '</span> ' +
			'<input type="submit" id="name" value="' + core.function.lang('formSubmit', 'timetable') + '" hidden="hidden" /> ' +
			'</form>');
		el('timetablequery').focus();
		core.function.stdout('temp', core.function.lang('explanation', 'timetable') + '<br />' + timetable.function.favouriteHandler.get());
		core.function.stdout('output','');
		if (value(query) !=='') timetable.function.search(value(query));
		core.performance.stop('timetable.function.init(\'' + value(query) + '\')');
	},
};