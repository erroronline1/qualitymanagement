// override webcompatible core-functions with python eel functions

async function eel_available(){
	try {
		if (await eel.eel_available()()){

			core.fn.setting.clear = function(){
				alert ("overriden clear function");
			}
		



		}
	}
	catch (error) {
		console.warn("this application was not started from python eel. default use from browser. functions may be limited.")
	}
}
eel_available();
