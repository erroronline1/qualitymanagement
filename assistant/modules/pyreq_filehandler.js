//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for backup of folders
//
//  dependencies:	{core.var.moduleVarDir}pyreq_filehandler.var.js
////
//////////////////////////////////////////////////////////////

var pyreq_filehandler = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				searchobject = [];
			Object.keys(pyreq_filehandler.var.submodules).forEach((key) => {
				searchobject.push([pyreq_filehandler.var.submodules[key][core.var.selectedLanguage], key]);
			});
			found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
			found.forEach((value) => {
				display = '<a href="javascript:pyreq_filehandler.fn.init(\'' + searchobject[value[0]][1] + '\')">' + searchobject[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('pyreq_filehandler', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		presethandler: async function (method, identifier, destination) {
			if (method==='get'){
				await core.fn.async.file.pickdir(identifier);
			}
			
			const allsettings = await core.fn.async.memory.keyDump();
			const identifierValue=identifier.element().value;

			for (let i = 0; i < allsettings.length; i++) {
				let set = await core.fn.async.memory.read(allsettings[i]),
					filehandlersets=0;
				set=set.split(',')

				if (set[0] === identifierValue) {
					if (method==='get') destination.element().value = set[1]
					if (method==='set') core.fn.async.memory.write(allsettings[i], [identifierValue, destination.element().value].join(','))
					return;
				}
				if (method==='set'){
					if (allsettings[i] === "filehandlerPreset"+filehandlersets){
						filehandlersets++;
					}
				}
			}
			if (method==='set'){
				core.fn.async.memory.write("filehandlerPreset"+filehandlersets, [identifierValue, destination.element().value].join(','))
				return;
			}
			destination.element().value = '';
		},
		backupinput: async function () {
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_filehandler.fn.backupprepare()">' +
				'<input type="button" value="' + core.fn.static.lang('labelbackupSrc', 'pyreq_filehandler') + '" onclick="pyreq_filehandler.fn.presethandler(\'get\', \'backupSrc\', \'backupSrcExclude\');" /><br /><input type="text" id="backupSrc" required /><br /><br />' +
				core.fn.static.lang('labelbackupSrcExclude', 'pyreq_filehandler') + ':<br />' +
				'<input type="text" id="backupSrcExclude" /><br /><br />' +
				'<input type="button" value="' + core.fn.static.lang('labelbackupDst', 'pyreq_filehandler') + '" onclick="pyreq_filehandler.fn.presethandler(\'get\', \'backupDst\', \'backupDstExclude\')" /><br /><input type="text" id="backupDst" required /><br /><br />' +
				core.fn.static.lang('labelbackupDstExclude', 'pyreq_filehandler') + ':<br />' +
				'<input type="text" id="backupDstExclude" /><br /><br />' +
				'<br /><input type="submit" value="' + core.fn.static.lang('labelbackupSubmit', 'pyreq_filehandler') + '" id="submitbackup" " />' +
				'</form>');
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_filehandler.fn.init(\'backup\')');
		},
		backupprepare: async function () {
			if ('backupSrcExclude'.element().value) await pyreq_filehandler.fn.presethandler('set','backupSrc','backupSrcExclude');
			if ('backupDstExclude'.element().value) await pyreq_filehandler.fn.presethandler('set','backupDst','backupDstExclude');
			let paths = [{
				'src': {
					'startDir': 'backupSrc'.element().value,
					'excludeDir': 'backupSrcExclude'.element().value.split(/[,;]/)
				},
				'dst': {
					'startDir': 'backupDst'.element().value,
					'excludeDir': 'backupDstExclude'.element().value.split(/[,;]/)
				}
			}];
			pyreq_filehandler.fn.backupsubmit(paths);
		},
		backupsubmit: async function (paths) {
			document.body.style.cursor = 'wait';
			"submitbackup".element().disabled = "disabled"
			core.fn.async.stdout('output', '');
			core.eel.interface.destination = ["output".element(), "innerHTML"];
			core.eel.interface.append = true;
			let result = await eel.backup(paths)();
			if (result)	core.fn.async.stdout('output', result.replaceAll(/\n/ig, '<br />'));
			"submitbackup".element().disabled = null
			document.body.style.cursor = 'initial';
		},
		init: async (query = '') => {
			let options = {};
			Object.keys(pyreq_filehandler.var.submodules).forEach(function (key) {
				options[key] = [key, pyreq_filehandler.var.submodules[key][core.var.selectedLanguage]];
			});
			query = query ? query : 'backup';
			await core.fn.async.stdout('input',
				core.fn.static.insert.tabs(options, 'pyreq_filehandlerselection', query, 'onchange="pyreq_filehandler.fn[core.fn.static.getTab(\'pyreq_filehandlerselection\')+\'input\']()"')
			);
			core.fn.static.getTab('pyreq_filehandlerselection');
			eval('pyreq_filehandler.fn.' + query + 'input()');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'pyreq_filehandler.var.js');
		}
	}
};