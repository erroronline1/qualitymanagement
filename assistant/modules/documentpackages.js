//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for preselecting documents within a quality
//  mangagement system according to given tasks
//
//  dependencies:	data/documentpackages.js
//
//////////////////////////////////////////////////////////////

var module = {
	var: {
		serialPrintShellCommand: '"' + 'C:/Program Files/Adobe/Reader 11.0/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t',
		lang: {
			useCaseDescription: {
				en: 'Shown are all required documents. Process descriptions are applicable.',
				de: 'Es werden die erforderlichen Dokumente angezeigt. Übergeordnet gelten die einschlägigen Verfahrens- und Arbeitsanweisungen.'
			},
			serialPrintLink: {
				en: function (e) {
					return 'Print all documents but ' + e;
				},
				de: function (e) {
					return 'Alle Dokumente außer ' + e + ' drucken';
				}
			},
			primaryCaption: {
				en: 'Always to be delivered by reception',
				de: 'Immer vom Empfang auszuhändigen'
			},
			secondaryCaption: {
				en: 'To be taken into account if applicable',
				de: 'Falls zutreffend zusätzlich zu berücksichtigen'
			},
			selectDefault: {
				en: 'choose...',
				de: 'Auswahl treffen...'
			},
			selectEnableExceptions: {
				en: 'additional case', //change this caption to make sense for you
				de: 'zusätzliche Berücksichtigung'
			},
			errorNoActiveX: {
				en: 'Please reload application and allow ActiveX...',
				de: 'Bitte Oberfläche neu laden und ActiveX zulassen...'
			},
			additionalInfo: {
				en: 'Additional information: can be displayed here if neccessary',
				de: 'Zusatzinformation: können hier angegeben werden, falls erforderlich'
			},
		}
	},
	function: {
		documentpackages: function () {
			core.function.loadScript('data/documentpackages.js', 'module.function.input');
			el('temp').innerHTML = '<br />' + core.function.lang('useCaseDescription');
			el('output').innerHTML = '';
		},
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
			var batch=core.function.rootdir+'modules/packages.cmd';
			try {
				var shell = new ActiveXObject("WScript.Shell");
				//shell.run('cmd /h & pause'); // do not delete if cmd is restricted on your system. this keeps a window open in case of need to mess around ;)
				var command= 'cmd /c start CALL "'+batch.replace(/\//g,'\\')+'" "'+files.join('" "')+'"';// & pause';
				shell.run(command);
			}
			catch (e) {
				core.function.popup(core.function.lang('errorNoActiveX'));
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
					command += ' start "" ' + module.var.serialPrintShellCommand + ' "' + el + '" &';
				});
				shell.run(command.slice(0, -2) + ' & exit');
			} catch (e) {
				core.function.popup(core.function.lang('errorNoActiveX'));
			}
		},
		gen: function (treatment) {
			var pack = JSONDATA[treatment],
				primary = '',
				secondary = '';
			serialPDFlist = '';

			// regular documents
			Object.keys(pack.primary).forEach(function (index) {
				primary += module.function.linkfile(pack.primary[index]);
				if (typeof(EXCEPTIONS.noserialprint) != "undefined" && EXCEPTIONS.noserialprint.indexOf(pack.primary[index]) < 0) serialPDFlist += ',' + pack.primary[index];
			});
			var serialPrintExceptions = '';
			if (typeof(EXCEPTIONS.noserialprint) != "undefined") EXCEPTIONS.noserialprint.forEach(function (el) {
				serialPrintExceptions += ', ' + el.substring(el.lastIndexOf('/'), el.lastIndexOf('.')).substring(1);
			});
			//exceptive documents according to additional data (inputs in form)
			if (el('enableexceptions').checked && typeof(EXCEPTIONS.addtopackage) != "undefined") {
				Object.keys(EXCEPTIONS.addtopackage).forEach(function (index) {
					primary += module.function.linkfile(EXCEPTIONS.addtopackage[index]);
					serialPDFlist += ',' + EXCEPTIONS.addtopackage[index];
				});
			}
			if (!!document.documentMode) primary += '<hr /><a href="javascript:module.function.serialPrint(\'' + serialPDFlist + '\')">' + core.function.lang('serialPrintLink', serialPrintExceptions.substring(2)) + '</a>';
			primary += '<br /><br />' + core.function.lang('additionalInfo');
			Object.keys(pack.secondary).forEach(function (index) {
				secondary += module.function.linkfile(pack.secondary[index]);
			});
			el('temp').innerHTML = '<span class="highlight">' + core.function.lang('primaryCaption') + '</span><br />' + primary;
			el('output').innerHTML = '<span class="highlight">' + core.function.lang('secondaryCaption') + '</span><br />' + secondary;
		},
		input: function () {
			if (typeof (JSONDATA) != 'undefined') {
				var out = core.function.icon.insert('search') +
					'<select id="packages" onchange="var sel=this.options[this.selectedIndex].value; if (sel) module.function.gen(sel)"><option value="">' + core.function.lang('selectDefault') + '</option>';
				Object.keys(JSONDATA).forEach(function (key) {
						out += '<option id="' + key +'" value="' + key + '">' + key.replace(/_/g, ' ') + '</option>';
				});
				out += '</select>';
				el('input').innerHTML = out + core.function.insert.checkbox(core.function.lang('selectEnableExceptions'), 'enableexceptions', false, 'onchange="var sel=el(\'packages\').options[el(\'packages\').selectedIndex].value; if (sel) module.function.gen(sel)"');
			}
		},
	}
}

var disableOutputSelect = true;
module.function.documentpackages()