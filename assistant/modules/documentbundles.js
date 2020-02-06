//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for preselecting documents within a quality
//  mangagement system according to given tasks
//
//  dependencies:	{core.var.moduleVarDir}documentpackages.var.js
//					{core.var.moduleDataDir}documentpackages.js
//
//////////////////////////////////////////////////////////////
if (typeof documentbundles === 'undefined') var documentbundles = {};

documentbundles.api = {
	available: function (search) {
		core.fn.loadScript(core.var.moduleDataDir + 'documentbundles.js',
			'documentbundles.api.processAfterImport(\'' + search + '\')');
		core.performance.stop('documentbundles.api.available(\'' + search + '\')');
	},
	processAfterImport: function (search) {
		var searchobject = [],
			display;
		if (typeof documentbundles_data !== 'undefined') {
			Object.keys(documentbundles_data).forEach(function (key) {
				searchobject.push([key, key]);
			});
			var found = core.fn.smartSearch.lookup(search, searchobject, true);
			found.forEach(function (value) {
				display = '<a href="javascript:core.fn.loadScript(\'modules/documentbundles.js\',\'documentbundles.fn.init(\\\'' + searchobject[value[0]][0] + '\\\')\')">' + searchobject[value[0]][0].replace(/_/g, " ") + '</a>';
				//add value and relevance
				globalSearch.contribute('documentbundles', [display, value[1]]);
			});
		}
		core.performance.stop('documentbundles.api.processAfterImport(\'' + search + '\')');
	}
};
documentbundles.fn = {
	linkfile: function (url) {
		// bad filename or dynamic url
		if (typeof (url) === 'object') {
			return '<a href="' + url[0] + '" target="_blank">' + url[1] + '</a><br />';
		}
		// url with quality filename
		else return '<a href="' + url + '" target="_blank">' + url.substring(url.lastIndexOf('/'), url.lastIndexOf('.')).substring(1) + '</a><br />';
	},
	serialPrint: function (files) {
		/*
			files=files.substring(1).replace(/\//g,'\\').split(',');
			var batch=core.fn.coreRootDir+'modules/packages.cmd';
			try {
				var shell = new ActiveXObject("WScript.Shell");
				//shell.run('cmd /h & pause'); // do not delete if cmd is restricted on your system. this keeps a window open in case of need to mess around ;)
				var command= 'cmd /c start CALL "'+batch.replace(/\//g,'\\')+'" "'+files.join('" "')+'"';// & pause';
				shell.run(command);
			}
			catch (e) {
				core.fn.popup('Bitte Oberfläche neu laden und ActiveX zulassen...');
			}
		
			//	modules/packages.cmd could contain
		
			//	for %%I in (%*) DO (
			//	start "" "C:\Program Files\Adobe\Reader 11.0\Reader\AcroRd32.exe" /n /s /h /t %%I
			//	)
			//	EXIT
		
			// this working way was abandoned to avoid a dependecy of another file in favour of a better customability
			// within one file in case of changing paths, other applications or operating systems
			*/
		files = files.substring(1).replace(/\//g, '\\').split(',');
		try {
			var shell = new ActiveXObject("WScript.Shell");
			var command = 'cmd /c';
			files.forEach(function (el) {
				command += ' start "" ' + documentbundles.var.serialPrintShellCommand + ' "' + el + '" &';
			});
			shell.run(command.slice(0, -2) + ' & exit');
		} catch (e) {
			core.fn.popup(core.fn.lang('errorNoActiveX', 'documentbundles'));
		}
	},
	gen: function (treatment) {
		var pack = documentbundles_data[treatment],
			primary = '',
			secondary = '',
			serialPDFlist = '';

		// regular documents
		if (typeof pack !== 'undefined') {
			Object.keys(pack.primary).forEach(function (index) {
				primary += documentbundles.fn.linkfile(pack.primary[index]);
				if (EXCEPTIONS.noserialprint.indexOf(pack.primary[index]) < 0) serialPDFlist += ',' + pack.primary[index];
			});
			var serialPrintExceptions = '';
			EXCEPTIONS.noserialprint.forEach(function (el) {
				serialPrintExceptions += ', ' + el.substring(el.lastIndexOf('/'), el.lastIndexOf('.')).substring(1);
			});
			//add exceptive documents according to additional data (inputs in form)
			if (el('enableexceptions').checked) {
				Object.keys(EXCEPTIONS.addtobundle).forEach(function (index) {
					if (pack.primary.indexOf(EXCEPTIONS.addtobundle[index]) < 0) {
						primary += documentbundles.fn.linkfile(EXCEPTIONS.addtobundle[index]);
						serialPDFlist += ',' + EXCEPTIONS.addtobundle[index];
					}
				});
			}
			if (!!document.documentMode) primary += '<hr /><a href="javascript:documentbundles.fn.serialPrint(\'' + serialPDFlist + '\')">' + core.fn.lang('serialPrintLink', 'documentbundles', serialPrintExceptions.substring(2)) + '</a>';
			primary += '<br /><br />' + core.fn.lang('additionalInfo', 'documentbundles');
			Object.keys(pack.secondary).forEach(function (index) {
				secondary += documentbundles.fn.linkfile(pack.secondary[index]);
			});
			core.fn.stdout('temp', '<span class="highlight">' + core.fn.lang('primaryCaption', 'documentbundles') + '</span><br />' + primary);
			core.fn.stdout('output', '<span class="highlight">' + core.fn.lang('secondaryCaption', 'documentbundles') + '</span><br />' + secondary);
		}
		core.history.write(['documentbundles.fn.init(\'' + treatment + '\')']);
	},
	input: function (query) {
		core.performance.start('documentbundles.fn.input(\'' + value(query) + '\')'); //possible duplicate
		if (typeof documentbundles_data !== 'undefined') {
			var out = '<select id="packages" onchange="var sel=this.options[this.selectedIndex].value; if (sel) documentbundles.fn.gen(sel)"><option value="">' + core.fn.lang('selectDefault', 'documentbundles') + '</option>';
			Object.keys(documentbundles_data).forEach(function (key) {
				out += '<option id="' + key + '" value="' + key + '" ' + (query === key ? 'selected' : '') + '>' + key.replace(/_/g, " ") + '</option>';
			});
			out += '</select>';
			core.fn.stdout('input', out + '<span class="inline" style="padding-top:.375em">' + core.fn.insert.checkbox(core.fn.lang('selectEnableExceptions', 'documentbundles'), 'enableexceptions', false, 'onchange="var sel=el(\'packages\').options[el(\'packages\').selectedIndex].value; if (sel) documentbundles.fn.gen(sel)"') + '</span>');
			if (value(query) !== '') documentbundles.fn.gen(query);
		}
		core.performance.stop('documentbundles.fn.input(\'' + value(query) + '\')');
		core.history.write(['documentbundles.fn.init(\'' + value(query) + '\')']);
	},
	init: function (query) {
		el('moduledocumentbundles').checked = true; // highlight menu icon
		core.fn.loadScript(core.var.moduleDataDir + 'documentbundles.js', 'documentbundles.fn.input(\'' + value(query) + '\')');
		core.fn.stdout('temp', '<br />' + core.fn.lang('useCaseDescription', 'documentbundles'));
		core.performance.stop('documentbundles.fn.init(\'' + value(query) + '\')');
	},
};