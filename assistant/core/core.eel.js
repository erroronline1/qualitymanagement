// override webcompatible core-functions with python eel functions
core.eel = () => {
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
				type: function (file) {
					let environment = core.var.environment[core.var.selectedEnv],
						extension = file.substring(file.lastIndexOf('.') + 1);
					for (var type of Object.keys(environment)) {
						if (environment[type].extensions.indexOf(extension) > -1) {
							return type;
						}
					}
				},
				link: async function (file, onclick = '') {
					return 'href="#" onclick="eel.file_handler(core.var.environment[core.var.selectedEnv][\'' + this.type(file) + '\'].open.concat([\'' + file + '\']))(); ' + onclick + '"';
				},
				batch: async function (files) {
					for (var file of files) {
						await eel.file_handler(core.var.environment[core.var.selectedEnv][this.type(file)].batch.concat([file]))();
					}
				}
			};
		} catch {
			/* because if not started from eel, this resource is loaded anyway and eel-object stops rendering with undefined-error */
		}
	} else console.warn("this application was not started from python eel. default use from browser. functions may be limited.")
};