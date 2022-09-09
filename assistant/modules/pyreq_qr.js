//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for creating qr codes
//
//  dependencies:	{core.var.moduleVarDir}pyreq_qr.var.js
//					{core.var.moduleDataDir}pyreq_qr.data.js
////
//////////////////////////////////////////////////////////////

var pyreq_qr = {
	var: {},
	data: {},
	api: {
		available: async (search) => {
			let display,
				found,
				searchobject = [];
			Object.keys(pyreq_qr.var.submodules).forEach((key) => {
				searchobject.push([pyreq_qr.var.submodules[key][core.var.selectedLanguage], key]);
			});
			found = await core.fn.async.smartSearch.lookup(search, searchobject, true);
			found.forEach((value) => {
				display = '<a href="javascript:pyreq_qr.fn.init(\'' + searchobject[value[0]][1] + '\')">' + searchobject[value[0]][0] + '</a>';
				//add value and relevance
				core.globalSearch.contribute('pyreq_qr', [display, value[1]]);
			});
		},
		currentStatus: async () => {
			return;
		}
	},
	fn: {
		appointmentinput: function () {
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_qr.fn.qrcodegen(\'appointment\')">' + core.fn.static.lang('appointmentCaption', 'pyreq_qr') + ':<br />' +
				'<input type="date" id="appointmentdate" placeholder="DD.MM.YYYY" required /><br /><br />' +
				'<input type="time" id="appointmenttime" placeholder="HH:MM"" required /><br /><br />' +
				core.fn.static.lang('appointmentCause', 'pyreq_qr') + ':<br />' +
				'<input type="text" id="appointmentcause" placeholder="' + core.fn.static.lang('appointmentCauseHint', 'pyreq_qr') + '" required /><br /><br />' +
				core.fn.static.lang('appointmentDetails', 'pyreq_qr') + ':<br />' +
				'<input type="text" id="appointmentdetails" placeholder="' + core.fn.static.lang('appointmentDetailsHint', 'pyreq_qr') + '" /><br /><br />' +
				core.fn.static.lang('appointmentDuration', 'pyreq_qr') + ':<br />' +
				'<input type="number" id="appointmentduration" min="1" max="8" step="1" value="1" /><br /><br />' +
				'<input type="submit" value="' + core.fn.static.lang('buttonGenerate', 'pyreq_qr') + '" />' +
				'</form>');
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_qr.fn.init(\'appointment\')');
		},
		labellinginput: function () {
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_qr.fn.qrcodegen(\'labelling\')">' + core.fn.static.lang('labellingName', 'pyreq_qr') + ':<br />' +
				'<input type="text" id="labellingname" required /><br /><br />' +
				core.fn.static.lang('labellingDOB', 'pyreq_qr') + ':<br />' +
				'<input type="date" id="labellingdob" placeholder="DD.MM.YYYY" required /><br /><br />' +
				core.fn.static.lang('labellingAid', 'pyreq_qr') + ':<br />' +
				'<input type="text" id="labellingaid" required /><br /><br />' +
				core.fn.static.lang('labellingDelivered', 'pyreq_qr') + ':<br />' +
				'<input type="date" id="labellingdelivered" placeholder="DD.MM.YYYY" required /><br /><br />' +
				core.fn.static.lang('labellingProcessnumber', 'pyreq_qr') + ':<br />' +
				'<input type="number" id="labellingprocessnumber" /><br /><br />' +
				core.fn.static.lang('labellingPatientid', 'pyreq_qr') + ':<br />' +
				'<input type="number" id="labellingpatientid" /><br /><br />' +
				'<input type="submit" value="' + core.fn.static.lang('buttonGenerate', 'pyreq_qr') + '" />' +
				'</form>');
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_qr.fn.init(\'labelling\')');
		},
		openinput: function () {
			core.fn.async.stdout('temp', '<form action="javascript:pyreq_qr.fn.qrcodegen(\'open\')">' + core.fn.static.lang('openCaption', 'pyreq_qr') + ':<br />' +
				'<textarea id="opentext" placeholder="' + core.fn.static.lang('openHint', 'pyreq_qr') + '" style="width:90%" rows="5" required></textarea><br /><br />' +
				'<input type="submit" value="' + core.fn.static.lang('buttonGenerate', 'pyreq_qr') + '" />' +
				'</form>');
			core.fn.async.stdout('output', '');
			core.history.write('pyreq_qr.fn.init(\'open\')');
		},

		qrcodegen: async function (type) {
			let output = {
				hint: ''
			};
			if (type === 'appointment') {
				let date = el('appointmentdate').value.split(/\D/g).concat(el('appointmenttime').value.split(/\D/g)),
					cause = el('appointmentcause').value.trim(),
					details = el('appointmentdetails').value.trim(),
					duration = el('appointmentduration').value,
					dates;

				if (date.length < 5 || !cause.length) return;

				function leading0(number) {
					number = Number(number);
					return (number < 10 ? '0' + number : number).toString();
				}
				let start = new Date(date[0], date[1], date[2], date[3], date[4]),
					end = new Date();
				end.setTime(start.getTime() + duration * 3600000);
				end = [end.getFullYear().toString(), leading0(end.getMonth()), leading0(end.getDate()), leading0(end.getHours()), leading0(end.getMinutes())];
				dates = {
					start: date[0].toString() + leading0(date[1]) + leading0(date[2]) + 'T' + leading0(date[3]) + leading0(date[4]) + '00',
					end: end[0] + end[1] + end[2] + 'T' + end[3] + end[4] + '00',
					cause: cause,
					details: details
				};
				output.data = pyreq_qr.data.appointment[core.var.selectedLanguage](dates);
			} else if (type === 'labelling') {
				let dates = {
					name: el('labellingname').value.trim(),
					dob: el('labellingdob').value.trim(),
					aid: el('labellingaid').value.trim(),
					delivered: el('labellingdelivered').value.trim(),
					id: el('labellingpatientid').value.trim(),
					process: el('labellingprocessnumber').value.trim()
				};
				if (!dates.name || !dates.dob || !dates.aid || !dates.delivered) return;
				output.data = pyreq_qr.data.labelling[core.var.selectedLanguage](dates);
				output.hint = core.fn.static.lang('labellingWarning', 'pyreq_qr');
			} else if (type === 'open') {
				output.data = el('opentext').value.trim();
			}
			//creates and instantly opens with default shell commands
			await eel.createqrandopenwith(output, core.var.environment[core.var.selectedEnv].default.open, pyreq_qr.var.submodules[core.fn.static.getTab('pyreq_qrselection')][core.var.selectedLanguage])();

			core.fn.async.stdout('output', output.data.replaceAll('\n', '<br />') + (output.hint ? '<br /><br /><span class="highlight">' + output.hint + '</span>' : ''));
		},
		init: async (query = '') => {
			let options = {};
			Object.keys(pyreq_qr.var.submodules).forEach(function (key) {
				options[key] = [key, pyreq_qr.var.submodules[key][core.var.selectedLanguage]];
			});
			query = query ? query : 'appointment';
			await core.fn.async.stdout('input',
				core.fn.static.insert.tabs(options, 'pyreq_qrselection', query, 'onchange="pyreq_qr.fn[core.fn.static.getTab(\'pyreq_qrselection\')+\'input\']()"')
			);
			core.fn.static.getTab('pyreq_qrselection');
			eval('pyreq_qr.fn.' + query + 'input()');
		},
		load: async () => {
			await core.fn.async.loadScript(core.var.moduleVarDir + 'pyreq_qr.var.js');
			await core.fn.async.loadScript(core.var.moduleDataDir + 'pyreq_qr.data.js');
		}
	}
};