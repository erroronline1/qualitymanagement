from pathlib import Path
import os
import qrcode
import PIL # required by qrcode but pyinstaller doesn't recognise that
import datetime
import re

tempfile = {'path': str(Path.home()).replace('\\', '/'),
			'file':  '/.qmassistant_qr_code_',
			'variation': '.+?',
			'extension': '.png'}

# clean up on application start
# failed attempts to make output more comprehensible:
# * passing of io streams to a random default image viewer is unlikely to work
# * displaying and deleting immediately afterwards prevents copying the image from the default viewer (at least win11)
# * reusing the same filename may confuse the user in front of the screen - adding timestamps makes the creation at least a bit distinguishable
# * exporting to pdf prevents copying text and image combined to paste elsewhere
# * base64 encoded png OR svg is not copyable
filestocleanup = []
for entry in os.scandir( tempfile['path'] ):
	if os.path.isfile( os.path.join( tempfile['path'], entry) ):
		if re.match( (tempfile['file'] + tempfile['variation'] + tempfile['extension'])[1:], entry.name ):
			filestocleanup.append(entry.name)
if len(filestocleanup):
	for file in filestocleanup:
		os.unlink(os.path.normpath(os.path.join(tempfile['path'], file)))

def create(output, openwith, usecase, file_handler):
	qr = qrcode.QRCode(
		version = 2,
		error_correction = qrcode.constants.ERROR_CORRECT_M,
		box_size = 16,
		border = 2,
	)
	qr.add_data(output['data'])
	qr.make(fit = True)
	img = qr.make_image(fill_color = 'black', back_color = 'white')

	currentfile = os.path.normpath(tempfile['path'] + tempfile['file'] + re.sub(r'\W', '-', usecase) + '_created_' + datetime.datetime.now().strftime('%Y%m%d_%H%M%S') + tempfile['extension'])

	img.save(currentfile)
	path = [el for el in openwith] #deepcopy
	path.append(currentfile)
	file_handler(path)

	return
