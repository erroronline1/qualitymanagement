import cchardet
import eel
import os
from pathlib import Path
import re
import subprocess
import sqlite3
import sys

print('''
             _     _           _
 ___ ___ ___|_|___| |_ ___ ___| |_   _ _ _ ___ ___ ___ ___ ___ ___
| .'|_ -|_ -| |_ -|  _| .'|   |  _| | | | |  _| .'| . | . | -_|  _|
|__,|___|___|_|___|_| |__,|_|_|_|   |_____|_| |__,|  _|  _|___|_|
                                                  |_| |_|          built 20220910

by error on line 1 (erroronline.one)

$ assistant --help    for overview
''')

HELP = '''
start this application with options:

[ -h | --help ]       this message
[ -w | --webfolder ]  "D:/path/to/application/" mandatory. with trailing /
[ -b | --browser ]    optional if issues arise (chrome, firefox, edge)
[ -p | --port ]       optional if issues arise

'''

class db_handler:
	def __init__(self, db):
		self.connection = sqlite3.connect(db)
		c = self.connection.cursor()
		c.execute('''SELECT count(name) FROM sqlite_master WHERE type='table' AND name='SETTINGS';''')
		if not c.fetchone()[0]:
			self.create()
	
	def __del__(self):
		self.connection.close()

	def create(self):
		self.connection.executescript('''
			CREATE TABLE SETTINGS
			(KEY TEXT PRIMARY KEY NOT NULL,
			VALUE TEXT NOT NULL);''')
		self.connection.commit()
		return True

	def clear(self):
		self.connection.executescript('''DELETE FROM SETTINGS; VACUUM;''')
		self.connection.commit()

	def dbSize(self):
		cursor = self.connection.cursor()
		cursor.execute('''SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();''')
		result = cursor.fetchone()
		return result

	def delete(self, key):
		key = key.replace('\'','\'\'')
		self.connection.execute('''DELETE FROM SETTINGS WHERE KEY='{0}';'''.format(key))
		self.connection.commit()
		return True

	def keyDump(self):
		cursor = self.connection.cursor()
		cursor.execute('''SELECT KEY FROM SETTINGS;''')
		result = cursor.fetchall()
		return ([key[0] for key in result])

	def read(self, key):
		key = key.replace('\'','\'\'')
		cursor = self.connection.cursor()
		cursor.execute('''SELECT VALUE FROM SETTINGS WHERE KEY='{0}';'''.format(key))
		result = cursor.fetchone()
		if result is not None:
			return result[0]
		return False

	def write(self, key, value):
		key = key.replace('\'','\'\'')
		value = value.replace('\'','\'\'')
		self.connection.execute('''INSERT OR REPLACE INTO SETTINGS (KEY, VALUE) VALUES ('{0}', '{1}');'''.format(key, value))
		self.connection.commit()
		return True

_database = db_handler(str(Path.home()) +'/qmassistant.db')

WEBFOLDER = None
BROWSER = None
PORT =11235
# argument handler
sys.argv.pop(0)
options = {
	'h':['--help|-h', None],
	'w':['--webfolder|-w', '.+'],
	'b':['--browser|-b', '.+'],
	'p':['--port|-p', '\d+']
	}
for i in range(0, len(sys.argv)-1):
	for opt in options:
		arg = re.findall(options[opt][0], sys.argv[i], re.IGNORECASE)
		arg2 = re.findall(options[opt][1], sys.argv[i+1], re.IGNORECASE) if options[opt][1] and i + 1 < len(sys.argv) else None
		if bool(arg2):
			i += 1
		if opt == 'h' and arg:
			print(HELP)
			exit()
		elif opt == 'w' and bool(arg) and bool(arg2):
			WEBFOLDER = str(arg2[0])
		elif opt == 'b' and bool(arg) and bool(arg2):
			BROWSER = str(arg2[0]).lower()
		elif opt == 'p' and bool(arg) and bool(arg2):
			PORT = str(arg2[0])
		else:
			pass

#   _     _ _
#  |_|___|_| |_
#  | |   | |  _|
#  |_|_|_|_|_|
#

@eel.expose
def webroot():
	return WEBFOLDER

@eel.expose
def rootResourcesImport(file):
    # https://dev.to/bowmanjd/character-encodings-and-detection-with-python-chardet-and-cchardet-4hj7
    blob = Path(file).read_bytes()
    detection = cchardet.detect(blob)
    encoding = detection["encoding"]
    text = blob.decode(encoding)
    return text

#                                 _             _ _ _
#   _____ ___ _____ ___ ___ _ _  | |_ ___ ___ _| | |_|___ ___
#  |     | -_|     | . |  _| | | |   | .'|   | . | | |   | . |
#  |_|_|_|___|_|_|_|___|_| |_  | |_|_|__,|_|_|___|_|_|_|_|_  |
#                          |___|                         |___|

@eel.expose
def	core_memory_clear():
	return _database.clear()

@eel.expose
def core_memory_dbSize():
	return _database.dbSize()

@eel.expose
def core_memory_delete(name):
	return _database.delete(name)

@eel.expose
def core_memory_keyDump():
	return _database.keyDump()

@eel.expose
def	core_memory_read(name):
	return _database.read(name)
	
@eel.expose
def core_memory_write(name, value):
	_database.write(name, value)
	return True

#   ___ _ _       _             _ _ _
#  |  _|_| |___  | |_ ___ ___ _| | |_|___ ___
#  |  _| | | -_| |   | .'|   | . | | |   | . |
#  |_| |_|_|___| |_|_|__,|_|_|___|_|_|_|_|_  |
#                                        |___|

@eel.expose
def file_exists(path):
	return os.path.exists(path)

@eel.expose
def file_handler(call):
	escaped=[]
	for arg in call:
		escaped.append(os.path.normpath(arg) if re.search('./', arg) else arg)
	subprocess.run(escaped)

@eel.expose
def file_readdir(path):
	files = []
	for (dirpath, dirnames, filenames) in os.walk(path):
		for filename in filenames:
			files.append([os.path.join(dirpath, filename).replace('\\', '/'),'',''])
	return files

#               _     _
#   _____ ___ _| |_ _| |___ ___
#  |     | . | . | | | | -_|_ -|
#  |_|_|_|___|___|___|_|___|___|
#  eel.exposure does not seem to happen just from imported modules.
#  therefore exposed functions are placed here, since the main application has to be updated with importing anyway.
#  specific algorithms may take place in the distinctive module file

import pymodules.qr as qr
@eel.expose
def createqrandopenwith(data, openwith, usecase):
	return qr.create(data, openwith, usecase, file_handler)
	#passing file_handler to reuse but to avoid recursive import

#       _           _
#   ___| |_ ___ ___| |_
#  |_ -|  _| .'|  _|  _|
#  |___|_| |__,|_| |_|
#

if WEBFOLDER:
	print ('Do not close this window, otherwise the browserview will stop working.')
	eel.init('html') #fldr name for web content
	eel.start('core.html', port = PORT, mode = BROWSER)
else:
	print(HELP)

del _database