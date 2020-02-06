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
			if (searchTerms[i].toLowerCase().indexOf(queryString[0].toLowerCase()) > -1) {
				found=true;
				break;
			}
		}
		if (found) {
			queryString.shift();
			display='<a href="javascript:core.fn.loadScript(\'modules/timetable.js\',\'timetable.function.init(\\\'' + queryString.join(' ') + '\\\')\')">' + core.var.modules.timetable.display[core.var.selectedLanguage] + (queryString.length>0 ? core.fn.lang('apiFound', 'timetable') + queryString.join(' '):'') + '</a>';
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
			//core.fn.stdout('output', '<a href="'+timetable.var.path + window.btoa(unescape(encodeURIComponent(query.toLowerCase()))) + '.xlsm" target="wh">zur Tabelle von ' + query + '</a>');
			core.fn.stdout('output', timetable.function.linkfile(query));
		}
		core.performance.stop('timetable.function.input(\'' + value(query) + '\')');
		core.history.write(['timetable.function.init(\'\')']);
	},
	linkfile: function (name, favourite) {
		var link='<a href="'+timetable.var.path + name.toLowerCase() + '.xlsm" onclick="timetable.function.favouriteHandler.set(\'' + timetable.function.favouriteHandler.prepare(name) + '\'); return;" target="_blank">' + core.fn.lang('linkTitle','timetable') + name + '</a> ';
		if (value(favourite)==='') return link;
		else return '<span class="singlefavouritehandler">' + link + core.fn.insert.icon('delete', false, false, 'onclick="timetable.function.favouriteHandler.set(\':' + timetable.function.favouriteHandler.prepare(name) + '\'); return;"') + '</span>';
	},
	favouriteHandler: {
		prepare: function (value) {
			return encodeURI(value.toLowerCase());
		},
		set: function (value) {
			var output = core.fn.setting.get('favouritetimetable'),
				deleteValue=false;
			if (value.indexOf(':')==0){ //if preceded by : the value will be deleted from the favourite list
				deleteValue=true
				value=value.substring(1);
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
			core.fn.setting.set('favouritetimetable', output);
			core.fn.stdout('favourites', timetable.function.favouriteHandler.get());
		},
		get: function () {
			var output = core.fn.setting.get('favouritetimetable');
			if (output) {

				var tfav2 = output.split(',');
				output = '<br />' + core.fn.lang('favouriteCaption', 'timetable') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
					core.fn.insert.icon('delete', 'bigger', false, 'title="' + core.fn.lang('favouriteDeleteTitle', 'timetable') + '" onclick="timetable.function.favouriteHandler.reset(\'\')"') +
					'</span><br /><br />';
				for (var person = 0; person < tfav2.length; person += 2) {
					var favName=decodeURI(tfav2[person]).split(' ');
					for (var name = 0; name < favName.length; name++){ favName[name]=favName[name][0].toUpperCase() + favName[name].slice(1);}
					
					output += timetable.function.linkfile(favName.join(' '), true) + '<br />';
				}
			}
			return output || '';
		},
		reset: function (output) {
			core.fn.setting.set('favouritetimetable', output);
			alert(core.fn.lang('favouriteResetConfirm', 'timetable'));
		},
	},
	init: function (query) {
		el('moduletimetable').checked = true; // highlight menu icon
		core.fn.stdout('input',
			'<form id="search" action="javascript:timetable.function.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query) + '" placeholder="' + core.fn.lang('formInputPlaceholder', 'timetable') + '" id="timetablequery" class="search"  ' + (value(query) !== '' ? 'value="' + query + '"' : '') + '  />' +
			'<span onclick="timetable.function.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
			'<input type="submit" id="name" value="' + core.fn.lang('formSubmit', 'timetable') + '" hidden="hidden" /> ' +
			'</form>');
		el('timetablequery').focus();
		core.fn.stdout('temp', core.fn.lang('explanation', 'timetable') + '<br /><div id="favourites">' + timetable.function.favouriteHandler.get() + '</div>');
		core.fn.stdout('output','');
		if (value(query) !=='') timetable.function.search(value(query));
		core.performance.stop('timetable.function.init(\'' + value(query) + '\')');
	},
};