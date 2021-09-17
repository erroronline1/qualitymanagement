import eel
from datetime import datetime

eel.init('web') #fldr name for web content

@eel.expose # expose function to javascript
# if this is not answering frontend core functions will not be overriden
def eel_available():
	return True


eel.start('core.html', port=12345, mode='edge')