//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for preselecting documents within a quality
//  mangagement system according to given tasks
//
//  dependencies:	{core.var.moduleVarDir}documentbundles.var.js
//					{core.var.moduleDataDir}documentbundles.js
//
//////////////////////////////////////////////////////////////
var documentbundles = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				searchobject = [];
			Object.keys(documentbundles.data.bundles).forEach(function (key) {
				searchobject.push([key, key]);
			});
			found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
			found.forEach(function (value) {
				display = '<a href="javascript:documentbundles.fn.init(\'' + searchobject[value[0]][0] + '\')">' + searchobject[value[0]][0].replace(/_/g, " ") + '</a>';
				//add value and relevance
				core.globalSearch.contribute('documentbundles', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		linkfile: async function (url) {
			// bad filename or dynamic url
			if (typeof (url) === 'object') {
				return '<a ' + await core.fn.async.file.link(url[0]) + '>' + url[1] + '</a><br />';
			}
			// url with quality filename
			else return '<a ' + await core.fn.async.file.link(url) + '>' + url.substring(url.lastIndexOf('/'), url.lastIndexOf('.')).substring(1) + '</a><br />';
		},
		serialPrint: (treatment) => {
			let pack = documentbundles.data.bundles[treatment],
				serialList = [];
			Object.keys(pack.primary).forEach(function (index) {
				if (documentbundles.data.exceptions.noserialprint.indexOf(pack.primary[index]) < 0) serialList.push(pack.primary[index]);
			});
			//add exceptive documents according to additional data (inputs in form)
			if ('enableexceptions'.element().checked) {
				Object.keys(documentbundles.data.exceptions.addtobundle).forEach(function (index) {
					if (pack.primary.indexOf(documentbundles.data.exceptions.addtobundle[index]) < 0) {
						serialList.push(documentbundles.data.exceptions.addtobundle[index]);
					}
				});
			}
			return serialList;
		},
		gen: async (treatment) => {
			let pack = documentbundles.data.bundles[treatment],
				primary = '',
				secondary = '',
				serialPrintExceptions;
			if (typeof pack !== 'undefined') {
				// regular documents
				for (let index of Object.keys(pack.primary)) {
					primary += await documentbundles.fn.linkfile(pack.primary[index]);
				};
				serialPrintExceptions = '';
				documentbundles.data.exceptions.noserialprint.forEach(function (el) {
					serialPrintExceptions += ', ' + el.substring(el.lastIndexOf('/'), el.lastIndexOf('.')).substring(1);
				});
				//add exceptive documents according to additional data (inputs in form)
				if ('enableexceptions'.element().checked) {
					for (let index of Object.keys(documentbundles.data.exceptions.addtobundle)) {
						if (pack.primary.indexOf(documentbundles.data.exceptions.addtobundle[index]) < 0) {
							primary += await documentbundles.fn.linkfile(documentbundles.data.exceptions.addtobundle[index]);
						}
					};
				}
				primary += '<hr /><a href="javascript:core.fn.async.file.batch(documentbundles.fn.serialPrint(\'' + treatment + '\'))">' + core.fn.static.lang('serialPrintLink', 'documentbundles', serialPrintExceptions.substring(2)) + '</a>';
				primary += '<br /><br />' + core.fn.static.lang('additionalInfo', 'documentbundles');
				for (let index of Object.keys(pack.secondary)) {
					secondary += await documentbundles.fn.linkfile(pack.secondary[index]);
				};
				core.fn.async.stdout('temp', '<span class="highlight">' + core.fn.static.lang('primaryCaption', 'documentbundles') + '</span><br />' + primary);
				core.fn.async.stdout('output', '<span class="highlight">' + core.fn.static.lang('secondaryCaption', 'documentbundles') + '</span><br />' + secondary);
			}
			core.history.write('documentbundles.fn.init(\'' + treatment + '\')');
		},
		init: async (query = '') => {
			let out;
			out = '<select id="packages" onchange="var sel=this.options[this.selectedIndex].value; if (sel) documentbundles.fn.gen(sel)"><option value="">' + core.fn.static.lang('selectDefault', 'documentbundles') + '</option>';
			Object.keys(documentbundles.data.bundles).forEach(function (key) {
				out += '<option id="' + key + '" value="' + key + '" ' + (query === key ? 'selected' : '') + '>' + key.replace(/_/g, " ") + '</option>';
			});
			out += '</select>';
			await core.fn.async.stdout('input', out + '<span class="inline" style="padding-top:.375em">' + core.fn.static.insert.checkbox(core.fn.static.lang('selectEnableExceptions', 'documentbundles'), 'enableexceptions', false, 'onchange="var sel=\'packages\'.element().options[\'packages\'.element().selectedIndex].value; if (sel) documentbundles.fn.gen(sel)"') + '</span>');
			if (query) documentbundles.fn.gen(query);
			else {
				await core.fn.async.stdout('temp', '<br />' + core.fn.static.lang('useCaseDescription', 'documentbundles'));
				core.history.write('documentbundles.fn.init()');
			}
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'documentbundles.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'documentbundles.data.js');
		}
	}
};