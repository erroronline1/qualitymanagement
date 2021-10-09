import cchardet
import eel
import os
from pathlib import Path
import re
import subprocess
import sqlite3
import sys

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

WEBFOLDER = False
# argument handler
sys.argv.pop(0)
options = {
	'w':'((?:--webfolder|-w)[:\s]+)(.+)(?:\s|$)'}
params = ' '.join(sys.argv) + ' '
for opt in options:
	arg = re.findall(options[opt], params, re.IGNORECASE)
	if opt == 'w' and bool(arg):
		WEBFOLDER = str(arg[0][1])
		params = params.replace(''.join(arg[0]), '')
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
def file_handler(call):
	escaped=[]
	for arg in call:
		escaped.append(os.path.normpath(arg) if re.search('./', arg) else arg)
	subprocess.run(escaped)

#       _           _
#   ___| |_ ___ ___| |_
#  |_ -|  _| .'|  _|  _|
#  |___|_| |__,|_| |_|
#

if WEBFOLDER:
	eel.init('html') #fldr name for web content
	eel.start('core.html', port = 11235, mode='edge')
else:
	print('please specify webfolder from command line with --webfolder "{ path with trailing /}"')

del _database