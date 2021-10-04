// override webcompatible core-functions with python eel functions
core.eel = () => {
	if (ROOT != "../") {
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
					console.log(keys);
					return keys.sort();
				},
				maxSpace: async function () {
					return 'loads of';
				},
				read: async function (name) {
					let value = await eel.core_memory_read(name.toString())();
					console.log(name, value);
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
		} catch {
			/* because eel might be undefined */
		}
	} else console.warn("this application was not started from python eel. default use from browser. functions may be limited.")
};