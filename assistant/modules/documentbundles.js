//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for preselecting documents within a quality
//  mangagement system according to given tasks
//
//  dependencies:	data/documentpackages.js
//
//////////////////////////////////////////////////////////////

var documentbundles = {
	var: {
		serialPrintShellCommand: '"' + 'C:/Program Files/Adobe/Reader 11.0/Reader/AcroRd32.exe'.replace(/\//g, '\\') + '" /s /h /t',
		lang: {
			useCaseDescription: {
				en: 'Shown are all required documents. Process descriptions are applicable.',
				de: 'Es werden die erforderlichen Dokumente zur Vorgangsdokumentation angezeigt. Übergeordnet gelten die einschlägigen Verfahrens- und Arbeitsanweisungen.'
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
				de: 'Falls zutreffend zusätzlich oder im Versorgungsverlauf zu berücksichtigen'
			},
			selectDefault: {
				en: 'choose...',
				de: 'Auswahl treffen...'
			},
			selectEnableExceptions: {
				en: 'aid present',
				de: 'Hilfsmittel vorhanden'
			},
			errorNoActiveX: {
				en: 'Please reload application and allow ActiveX...',
				de: 'Bitte Oberfläche neu laden und ActiveX zulassen...'
			},
			additionalInfo: {
				en: 'Additional information: <span class="highlight">please print the route card two times!</span><br />Each prescription means a different case.<br />In case of appointments for cast models, fittings or delivery it it not neccessary to hand out documents by the reception.',
				de: 'Zusatzinformation: <span class="highlight">Bitte "Willkommen" 2x ausdrucken!</span><br />Jede Verordnung steht für einen eigenen Vorgang.<br />Für Termine zum Abdruck, Anproben oder Lieferung bei laufenden genehmigten Versorgungen sind keine Unterlagen vom Empfang erforderlich.'
			},
		},
		disableOutputSelect: true,
	},
	api: {
		available: function (search) {
			core.function.loadScript('data/documentbundles.js',
				'documentbundles.api.processAfterImport(\'' + search + '\')');
			core.performance.stop('documentbundles.api.available(\'' + search + '\')');
		},
		processAfterImport: function (search) {
			var searchobject = [],
				display;
			if (typeof (documentbundles_data) != 'undefined') {
				Object.keys(documentbundles_data).forEach(function (key) {
					searchobject.push([key, key]);
				});
				var found = core.function.smartSearch.lookup(search, searchobject, true);
				found.forEach(function (value) {
					display = '<a href="javascript:core.function.loadScript(\'modules/documentbundles.js\',\'documentbundles.function.init(\\\'' + searchobject[value[0]][0] + '\\\')\')">' + searchobject[value[0]][0].replace(/_/g, " ") + '</a>';
					//add value and relevance
					globalSearch.contribute('documentbundles', [display, value[1]]);
				});
			}
			core.performance.stop('documentbundles.api.processAfterImport(\'' + search + '\')');
		}
	},
	function: {
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
				core.function.popup('Bitte Oberfläche neu laden und ActiveX zulassen...');
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
				core.function.popup(core.function.lang('errorNoActiveX', 'documentbundles'));
			}
		},
		gen: function (treatment) {
			var pack = documentbundles_data[treatment],
				primary = '',
				secondary = '',
				serialPDFlist = '';

			// regular documents
			if (typeof pack != 'undefined') {
				Object.keys(pack.primary).forEach(function (index) {
					primary += documentbundles.function.linkfile(pack.primary[index]);
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
							primary += documentbundles.function.linkfile(EXCEPTIONS.addtobundle[index]);
							serialPDFlist += ',' + EXCEPTIONS.addtobundle[index];
						}
					});
				}
				if (!!document.documentMode) primary += '<hr /><a href="javascript:documentbundles.function.serialPrint(\'' + serialPDFlist + '\')">' + core.function.lang('serialPrintLink', 'documentbundles', serialPrintExceptions.substring(2)) + '</a>';
				primary += '<br /><br />' + core.function.lang('additionalInfo', 'documentbundles');
				Object.keys(pack.secondary).forEach(function (index) {
					secondary += documentbundles.function.linkfile(pack.secondary[index]);
				});
				el('temp').innerHTML = '<span class="highlight">' + core.function.lang('primaryCaption', 'documentbundles') + '</span><br />' + primary;
				el('output').innerHTML = '<span class="highlight">' + core.function.lang('secondaryCaption', 'documentbundles') + '</span><br />' + secondary;
			}
			core.history.write(['documentbundles.function.init(\'' + treatment + '\')']);
		},
		input: function (query) {
			core.performance.start('documentbundles.function.input(\'' + value(query) + '\')'); //possible duplicate
			if (typeof (documentbundles_data) != 'undefined') {
				var out = '<select id="packages" onchange="var sel=this.options[this.selectedIndex].value; if (sel) documentbundles.function.gen(sel)"><option value="">' + core.function.lang('selectDefault', 'documentbundles') + '</option>';
				Object.keys(documentbundles_data).forEach(function (key) {
					out += '<option id="' + key + '" value="' + key + '" ' + (query == key ? 'selected' : '') + '>' + key.replace(/_/g, " ") + '</option>';
				});
				out += '</select>';
				el('input').innerHTML = out + '<span style="display:inline-block; padding-top:.375em">' + core.function.insert.checkbox(core.function.lang('selectEnableExceptions', 'documentbundles'), 'enableexceptions', false, 'onchange="var sel=el(\'packages\').options[el(\'packages\').selectedIndex].value; if (sel) documentbundles.function.gen(sel)"')+ '</span>';
				if (value(query) != '') documentbundles.function.gen(query);
			}
			core.performance.stop('documentbundles.function.input(\'' + value(query) + '\')');
			core.history.write(['documentbundles.function.init(\'' + value(query) + '\')']);
		},
		init: function (query) {
			el('moduledocumentbundles').checked = true; // highlight menu icon
			core.function.loadScript('data/documentbundles.js', 'documentbundles.function.input(\'' + value(query) + '\')');
			el('temp').innerHTML = '<br />' + core.function.lang('useCaseDescription', 'documentbundles');
			el('output').innerHTML = '';
			core.performance.stop('documentbundles.function.init(\'' + value(query) + '\')');
		},
	}
}