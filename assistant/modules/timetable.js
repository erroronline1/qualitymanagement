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
		var queryString = search.split(/\s/),
			searchTerms = timetable.var.searchTerms[core.var.selectedLanguage],
			found = false;
		if (typeof searchTerms !== 'undefined') {
			var termsFound = core.fn.smartSearch.lookup(search, searchTerms, true);
			termsFound.forEach(function (value) {
				found = true;
			});
		}
		if (found) {
			queryString.shift();
			for (var i = 0; i < queryString.length; i++) {
				queryString[i] = queryString[i][0].toUpperCase() + queryString[i].slice(1);
			} //ucfirst
			display = '<a href="javascript:core.fn.loadScript(\'modules/timetable.js\',\'timetable.fn.init(\\\'' + queryString.join(' ') + '\\\')\')">' + core.var.modules.timetable.display[core.var.selectedLanguage] + (queryString.length > 0 ? core.fn.lang('apiFound', 'timetable') + queryString.join(' ') : '') + '</a>';
			//add value and relevance
			globalSearch.contribute('timetable', [display, 1]);
		}
		core.performance.stop('timetable.api.available(\'' + search + '\')');
	},
};
timetable.fn = {
	open: function (name, js){
	if (typeof js === 'undefined')
		return core.fn.lang('legalReminder', 'timetable') + 
			timetable.fn.linkfile(name) + 
			core.fn.insert.checkbox(core.fn.lang('favouriteAdd', 'timetable'), 'favouriteAdd', this.favouriteHandler.stored(name), false, core.fn.lang('favouriteAdd', 'timetable'));
		else
		return core.fn.lang('legalReminder', 'timetable').replace(/"/g, '&quot;') + 
			timetable.fn.linkfile(name).replace(/"/g, '&quot;').replace(/\'/g, "\\\'") + 
			core.fn.insert.checkbox(core.fn.lang('favouriteAdd', 'timetable'), 'favouriteAdd', this.favouriteHandler.stored(name), false, core.fn.lang('favouriteAdd', 'timetable')).replace(/"/g, '&quot;').replace(/\'/g, "\\\'");
	},
	search: function (query) {
		query = query || el('timetablequery').value;
		core.performance.start('timetable.fn.input(\'' + value(query) + '\')'); //possible duplicate
		if (value(query) !== '') {
			core.fn.popup(this.open(query));
		}
		core.performance.stop('timetable.fn.input(\'' + value(query) + '\')');
		core.history.write(['timetable.fn.init(\'\')']);
	},
	linkfile: function (name, favourite) {
		name = name.split(' '); //split to array
		for (var i = 0; i < name.length; i++) {
			name[i] = name[i][0].toUpperCase() + name[i].slice(1);
		} //ucfirst
		name = name.join(' '); //rejoin to string
		var link = '<a href="' + timetable.var.path + name.toLowerCase() + '.xlsm" onclick="timetable.fn.favouriteHandler.set(\'' + name + '\'); return;" target="_blank">' + core.fn.lang('linkTitle', 'timetable') + name + '</a> ';
		if (value(favourite) !== '') link = '<span class="singlefavouritehandler"><a href="javascript:core.fn.popup(\'' + this.open(name, true) + '\')">' + name + '</a> ' + core.fn.insert.icon('delete', false, false, 'onclick="timetable.fn.favouriteHandler.set(\':' + name + '\'); return;"') + '</span>';
		return link;
	},
	favouriteHandler: {
		set: function (value) {
			var output = core.fn.setting.get('favouritetimetable'),
				deleteValue = false;
			if (value.indexOf(':') == 0) { //if preceded by : the value will be deleted from the favourite list
				deleteValue = true;
				value = value.substring(1);
			}
			else if (!el('favouriteAdd').checked)
				deleteValue = true;
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
			} else if (!deleteValue) output = value + ',1';
			if (output) core.fn.setting.set('favouritetimetable', output);
			else core.fn.setting.unset('favouritetimetable')
			core.fn.stdout('favourites', timetable.fn.favouriteHandler.get());
		},
		get: function () {
			var output = core.fn.setting.get('favouritetimetable');
			if (output) {

				var tfav2 = output.split(',');
				output = '<br />' + core.fn.lang('favouriteCaption', 'timetable') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
					core.fn.insert.icon('delete', 'bigger', false, 'title="' + core.fn.lang('favouriteDeleteTitle', 'timetable') + '" onclick="timetable.fn.favouriteHandler.reset(\'\')"') +
					'</span><br /><br />';
				for (var person = 0; person < tfav2.length; person += 2) {
					var favName = tfav2[person];
					output += timetable.fn.linkfile(favName, true) + '<br />';
				}
			}
			return output || '';
		},
		stored: function(name){
			name = name.split(' '); //split to array
			for (var i = 0; i < name.length; i++) {
				name[i] = name[i][0].toUpperCase() + name[i].slice(1);
			} //ucfirst
			name = name.join(' '); //rejoin to string
			if (core.fn.setting.get('favouritetimetable')) return core.fn.setting.get('favouritetimetable').indexOf(name) > -1;
			else return false;
		},
		reset: function (output) {
			core.fn.setting.set('favouritetimetable', output);
			core.fn.growlNotif(core.fn.lang('favouriteResetConfirm', 'timetable'));
		},
	},
	init: function (query) {
		el('moduletimetable').checked = true; // highlight menu icon
		core.fn.stdout('input',
			'<form id="search" action="javascript:timetable.fn.search();">' +
			'<input type="text" pattern=".{3,}" required value="' + value(query).replace(/"/g,'&quot;') + '" placeholder="' + core.fn.lang('formInputPlaceholder', 'timetable') + '" id="timetablequery" class="search" />' +
			'<span onclick="timetable.fn.search();" class="search">' + core.fn.insert.icon('search') + '</span> ' +
			'<input type="submit" id="name" value="' + core.fn.lang('formSubmit', 'timetable') + '" hidden="hidden" /> ' +
			'</form>');
		el('timetablequery').focus();
		core.fn.stdout('temp', core.fn.lang('explanation', 'timetable') + '<br />');
		core.fn.stdout('output', '<div id="favourites">' + timetable.fn.favouriteHandler.get() + '</div>');
		if (value(query) !== '') timetable.fn.search(value(query));
		core.performance.stop('timetable.fn.init(\'' + value(query) + '\')');
	},
};