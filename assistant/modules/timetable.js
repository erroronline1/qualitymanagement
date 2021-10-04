//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for accessing central excel timetables for all coworkers
//
//  dependencies:	{core.var.moduleVarDir}timetable.var.js
//					{core.var.moduleDataDir}timetable.js
//					actual timetables
//
//////////////////////////////////////////////////////////////

var timetable = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let found = false,
				queryString = search.split(/\s/),
				searchTerms = timetable.var.searchTerms[core.var.selectedLanguage],
				termsFound;
			if (typeof searchTerms !== 'undefined') {
				termsFound = await core.fn.async.smartSearch.lookup(search, searchTerms, true);
				termsFound.forEach((value) => {
					// if smartsearch returns strict or fuzzy matches 
					found = true;
				});
			}
			if (found) {
				queryString.shift();
				for (let i = 0; i < queryString.length; i++) {
					queryString[i] = queryString[i][0].toUpperCase() + queryString[i].slice(1);
				} //ucfirst
				display = '<a href="javascript:timetable.fn.init(\'' + queryString.join(' ') + '\')">' + core.var.modules.timetable.display[core.var.selectedLanguage] + (queryString.length > 0 ? core.fn.static.lang('apiFound', 'timetable') + queryString.join(' ') : '') + '</a>';
				//add value and relevance
				core.globalSearch.contribute('timetable', [display, 1]);
			}
		},
		currentStatus: async () => {
			let display = await timetable.fn.favouriteHandler.get();
			if (display) core.globalSearch.contribute('timetable', [display, 1]);
		}
	},
	fn: {
		open: async (name, js) => {
			let favouriteNameStored = await timetable.fn.favouriteHandler.stored(name),
				linkfile = await timetable.fn.linkfile(name);
			if (typeof js === 'undefined')
				return core.fn.static.lang('legalReminder', 'timetable') +
					linkfile +
					core.fn.static.insert.checkbox(core.fn.static.lang('favouriteAdd', 'timetable'), 'favouriteAdd', favouriteNameStored, false, core.fn.static.lang('favouriteAdd', 'timetable'));
			else
				return core.fn.static.lang('legalReminder', 'timetable').replace(/"/g, '&quot;') +
					linkfile.replace(/"/g, '&quot;').replace(/\'/g, "\\\'") +
					core.fn.static.insert.checkbox(core.fn.static.lang('favouriteAdd', 'timetable'), 'favouriteAdd', favouriteNameStored, false, core.fn.static.lang('favouriteAdd', 'timetable')).replace(/"/g, '&quot;').replace(/\'/g, "\\\'");
		},
		search: async (query = '') => {
			query = query || el('timetablequery').value;
			let open;
			if (query) {
				open = await timetable.fn.open(query);
				core.fn.static.popup(open);
			}
		},
		linkfile: async (name, favourite = '') => {
			let link,
				withtools;
			name = name.split(' '); //split to array
			for (let i = 0; i < name.length; i++) {
				name[i] = name[i][0].toUpperCase() + name[i].slice(1);
			} //ucfirst
			name = name.join(' '); //rejoin to string
			link = '<a href="' + timetable.var.path + name.toLowerCase() + '.xlsm" onclick="timetable.fn.favouriteHandler.set(\'' + name + '\'); return;" target="_blank">' + core.fn.static.lang('linkTitle', 'timetable') + name + '</a> ';
			if (favourite) {
				withtools = await timetable.fn.open(name, true);
				link = '<span class="singlefavouritehandler"><a href="javascript:core.fn.static.popup(\'' + withtools + '\')">' + name + '</a> ' + core.fn.static.insert.icon('delete', false, false, 'onclick="timetable.fn.favouriteHandler.set(\':' + name + '\'); return;"') + '</span>';
			}
			return link;
		},
		favouriteHandler: {
			set: async (value) => {
				let deleteValue = false,
					favourites = [],
					output = await core.fn.async.memory.read('timetableFav'),
					tfav;
				if (value.indexOf(':') == 0) { //if preceded by : the value will be deleted from the favourite list
					deleteValue = true;
					value = value.substring(1);
				} else if (!el('favouriteAdd').checked)
					deleteValue = true;
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
				} else if (!deleteValue) output = value + ',1';
				if (output) core.fn.async.memory.write('timetableFav', output);
				else core.fn.async.memory.delete('timetableFav')
				core.fn.async.stdout('favourites', await timetable.fn.favouriteHandler.get('withtools'));
			},
			get: async (tools) => {
				let favName = '',
					output = await core.fn.async.memory.read('timetableFav'),
					tfav2;
				if (output) {
					tfav2 = output.split(',');
					output = tools !== undefined ? '<br />' + core.fn.static.lang('favouriteCaption', 'timetable') + ':<span class="inline" style="vertical-align:middle; float:right;">' +
						core.fn.static.insert.icon('delete', 'bigger', false, 'title="' + core.fn.static.lang('favouriteDeleteTitle', 'timetable') + '" onclick="timetable.fn.favouriteHandler.reset()"') +
						'</span><br /><br />' : '';
					for (let person = 0; person < tfav2.length; person += 2) {
						favName = tfav2[person];
						output += await timetable.fn.linkfile(favName, true) + '<br />';
					}
				}
				return output || '';
			},
			stored: async (name) => {
				let timetableFav = await core.fn.async.memory.read('timetableFav');
				name = name.split(' '); //split to array
				for (let i = 0; i < name.length; i++) {
					name[i] = name[i][0].toUpperCase() + name[i].slice(1);
				} //ucfirst
				name = name.join(' '); //rejoin to string
				if (timetableFav) return timetableFav.indexOf(name) > -1;
				else return false;
			},
			reset: async (output='') => {
				await core.fn.async.memory.write('timetableFav', output);
				core.fn.async.growlNotif(core.fn.static.lang('favouriteResetConfirm', 'timetable'));
			},
		},
		init: async (query = '') => {
			await core.fn.async.stdout('input',
				'<form id="search" action="javascript:timetable.fn.search();">' +
				'<input type="text" pattern=".{3,}" required value="' + query.replace(/"/g, '&quot;') + '" placeholder="' + core.fn.static.lang('formInputPlaceholder', 'timetable') + '" id="timetablequery" class="search" />' +
				'<span onclick="timetable.fn.search();" class="search">' + core.fn.static.insert.icon('search') + '</span> ' +
				'<input type="submit" id="name" value="' + core.fn.static.lang('formSubmit', 'timetable') + '" hidden="hidden" /> ' +
				'</form>');
			el('timetablequery').focus();
			core.fn.async.stdout('temp', core.fn.static.lang('explanation', 'timetable') + '<br />');
			core.fn.async.stdout('output', '<div id="favourites">' + await timetable.fn.favouriteHandler.get('withtools') + '</div>');
			if (query) timetable.fn.search(query);
			core.history.write('timetable.fn.init()');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'timetable.var.js');
		}
	}
};