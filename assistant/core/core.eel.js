// override webcompatible core-functions with python eel functions
core.eel = {
	init: () => {
		if (root.eel) {
			try {
				core.fn.async.memory = {
					clear: async function () {
						eel.core_memory_clear()();
						return true;
					},
					delete: async function (name) {
						return eel.core_memory_delete(name.toString())();
					},
					keyDump: async function () {
						let keys = await eel.core_memory_keyDump()();
						return keys.sort();
					},
					maxSpace: async function () {
						return 'loads of';
					},
					read: async function (name) {
						let value = await eel.core_memory_read(name.toString())();
						if (value == null) return false;
						else return value;
					},
					usedSpace: async function () {
						let current = await eel.core_memory_dbSize()();
						return current;
					},
					write: async function (name, value, errormsg) {
						if (value.toString().length) {
							let val = eel.core_memory_write(name.toString(), value.toString())();
							if (val) return true;
							else core.fn.static.popup(core.fn.static.lang('errorStorageLimit') + (typeof errormsg !== 'undefined' ? '<br />' + errormsg : ''));
						} else eel.core_memory_delete(name.toString())();
					}
				};
				core.fn.async.file = {
					batch: async function (files) {
						for (var file of files) {
							if (this.type(file) != 'default')
								await eel.file_handler(core.var.environment[core.var.selectedEnv][this.type(file)].batch.concat([file]))();
						}
					},
					exists: async function (file) {
						return eel.file_exists(file)();
					},
					link: async function (file, onclick = '') {
						return 'href="#" onclick="eel.file_handler(core.var.environment[core.var.selectedEnv][\'' + this.type(file) + '\'].open.concat([\'' + file + '\']))(); ' + onclick + '"';
					},
					load: async function (destination, type = null) {
						destination.element().value = await eel.file_picker(null, null, type)();
						return;
					},
					pickdir: async function (destination) {
						destination.element().value = await eel.file_directory()();
						return;
					},
					saveas: async function (destination, filename = null) {
						destination.element().value = await eel.file_saveas(filename, null, null)();
						return;
					},
					type: function (file) {
						let environment = core.var.environment[core.var.selectedEnv],
							extension = file.substring(file.lastIndexOf('.') + 1);
						for (var type of Object.keys(environment)) {
							if (environment[type].extensions.indexOf(extension) > -1) {
								return type;
							}
						}
						return 'default';
					},
				};

				core.var.modules.pyreq_qr = {
					icon: core.fn.static.insert.icon('qr'),
					display: {
						en: 'QRCode generator',
						de: 'QRCode Generator',
					},
					enabledByDefault: true,
				};

				core.var.modules.pyreq_filter = {
					icon: core.fn.static.insert.icon('filter'),
					display: {
						en: 'Filter',
						de: 'Filter',
					},
					enabledByDefault: true,
				};

				core.var.lang.updateAvailable = {
					en: 'Update available :) Restart the assistant in due course.',
					de: 'Update am Start :) Starte den Assistenten beizeiten neu.'
				}
			} catch {
				/* because if not started from eel, this resource is loaded anyway and eel-object stops rendering with undefined-error */
			}
		} else console.warn('this application was not started from python eel. default use from browser. functions may be limited.')
	},
	interface: {
		element: [null, null], //element, property like innerHTML or value or whatever
		append: true,
		write: function (what) {
			if (core.eel.interface.destination[0]) {
				if (core.eel.interface.append) core.eel.interface.destination[0][core.eel.interface.destination[1]] += what;
				else core.eel.interface.destination[0][core.eel.interface.destination[1]] = what;
			}
		},
		update_available: function(){
			'environment'.element().children[0].title = core.fn.static.lang('updateAvailable');
			'environment'.element().children[0].children[0].classList.add('appupdate');
		}
	}
};