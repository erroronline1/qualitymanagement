import cchardet
import eel
import pyautogui
import os
from pathlib import Path
import re
import subprocess
import sqlite3
import sys
import time
import tkinter as tk
from tkinter import filedialog
import random

HELP = '''
start this application with options:

[ -h | --help ]       this message
[ -w | --webfolder ]  "D:/path/to/application/" mandatory. with trailing /
[ -b | --browser ]    optional if issues arise (chrome, firefox, edge)
[ -p | --port ]       optional if issues arise

'''

WEBFOLDER = None
BROWSER = "edge"
PORT = 11235
LAUNCHTIME = time.time()

#   _     _ _
#  |_|___|_| |_
#  | |   | |  _|
#  |_|_|_|_|_|
#
if __name__ == '__main__':
	print('''
             _     _           _
 ___ ___ ___|_|___| |_ ___ ___| |_   _ _ _ ___ ___ ___ ___ ___ ___
| .'|_ -|_ -| |_ -|  _| .'|   |  _| | | | |  _| .'| . | . | -_|  _|
|__,|___|___|_|___|_| |__,|_|_|_|   |_____|_| |__,|  _|  _|___|_|
                                                  |_| |_|          built 20230324

by error on line 1 (erroronline.one)

$ assistant --help    for overview
''')

	# argument handler
	if len(sys.argv):
		sys.argv.pop(0)
		options = {
			'h':['--help|-h', None],
			'w':['--webfolder|-w', '.+'],
			'b':['--browser|-b', '.+'],
			'p':['--port|-p', '\d+']
			}
		for i in range(0, len(sys.argv)-1):
			for opt, pattern in options.items():
				arg = re.findall(pattern[0], sys.argv[i], re.IGNORECASE)
				arg2 = re.findall(pattern[1], sys.argv[i+1], re.IGNORECASE) if pattern[1] and i + 1 < len(sys.argv) else None
				if bool(arg2):
					i += 1
				if opt == 'h' and arg:
					print(HELP)
					sys.exit()
				elif opt == 'w' and bool(arg) and bool(arg2):
					WEBFOLDER = str(arg2[0])
				elif opt == 'b' and bool(arg) and bool(arg2):
					BROWSER = str(arg2[0]).lower()
				elif opt == 'p' and bool(arg) and bool(arg2):
					PORT = str(arg2[0])
				else:
					pass
	else:
		print(HELP)
		exit()

if __name__ == '__main__':
	if WEBFOLDER:
		eel.init('html') #fldr name for web content

def interface(what):
	eel.eel_interface(what)

def webroot():
	return WEBFOLDER

def rootResourcesImport(file):
	# https://dev.to/bowmanjd/character-encodings-and-detection-with-python-chardet-and-cchardet-4hj7
	blob = Path(file).read_bytes()
	detection = cchardet.detect(blob)
	encoding = detection["encoding"]
	text = blob.decode(encoding)
	return text

#           _
#   ___ _ _| |_ ___ ___ ___ ___ ___ ___ ___ ___ ___
#  |_ -| | | . | . |  _| . |  _| -_|_ -|_ -| -_|_ -|
#  |___|___|___|  _|_| |___|___|___|___|___|___|___|
#              |_|

class UpdateChecker:
	def __init__(self):
		eel.spawn(self.check)
	def check(self):
		while True:
			if self.has_update(WEBFOLDER):
				eel.update_available()()
			eel.sleep(600)
	def has_update(self, curdir):
		exclude=["__pycache__", ".venv", "test.py"]
		directory = os.scandir(curdir)
		for file in directory:
			if not file.name in exclude and file.is_dir() and self.has_update(os.path.normpath(os.path.join(curdir, file.name))):
				return True
			if not file.name in exclude and file.is_file() and file.stat().st_mtime > LAUNCHTIME:
				return True
		return False

class GLaDOS:
	lyrics=(
		"And believe me I am still alive",
		"I'm doing science and I'm still alive",
		"I feel fantastic and I'm still alive",
		"While you're dying I'll be still alive",
		"And when you're dead I will be still alive"
	)
	def __init__(self):
		if not _database.read('coreGLaDOS'):
			return
		eel.spawn(self.watch)

	def watch(self):
		''' checks for last mouse position and "presses" buttons to mimic user interaction'''
		curr_coords = None
		while (minutes := int(_database.read('coreGLaDOS'))):
			if curr_coords == pyautogui.position():
				sys.stdout.write( f'\r* {random.choice(self.lyrics)} *{" "*15}' )
				sys.stdout.flush()
				pyautogui.press('scrolllock') # hopefully least intrusive key since mouse movement doesn't do the trick
				pyautogui.press('scrolllock')
			curr_coords = pyautogui.position()
			eel.sleep(minutes * 29) # slightly less than half of the given minutes to avoid adverse overlapping of check, interaction and cycle

#                                 _             _ _ _
#   _____ ___ _____ ___ ___ _ _  | |_ ___ ___ _| | |_|___ ___
#  |     | -_|     | . |  _| | | |   | .'|   | . | | |   | . |
#  |_|_|_|___|_|_|_|___|_| |_  | |_|_|__,|_|_|___|_|_|_|_|_  |
#                          |___|                         |___|

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

def	core_memory_clear():
	return _database.clear()

def core_memory_dbSize():
	return _database.dbSize()

def core_memory_delete(name):
	return _database.delete(name)

def core_memory_keyDump():
	return _database.keyDump()

def	core_memory_read(name):
	return _database.read(name)
	
def core_memory_write(name, value):
	_database.write(name, value)
	return True

#   ___ _ _       _             _ _ _
#  |  _|_| |___  | |_ ___ ___ _| | |_|___ ___
#  |  _| | | -_| |   | .'|   | . | | |   | . |
#  |_| |_|_|___| |_|_|__,|_|_|___|_|_|_|_|_  |
#                                        |___|

def file_exists(path):
	return os.path.exists(path)

def file_directory(initial = None, title = None, filetypes = None):
	picker = tk.Tk()
	picker.attributes("-topmost", True)
	path = filedialog.askdirectory()
	picker.destroy()
	return path

def file_handler(call):
	escaped=[]
	for argument in call:
		escaped.append(os.path.normpath(argument) if re.search('./', argument) else argument)
	subprocess.run(escaped)

def file_readdir(path):
	files = []
	for (dirpath, dirnames, filenames) in os.walk(path):
		for filename in filenames:
			files.append([os.path.join(dirpath, filename).replace('\\', '/'),'',''])
	return files

def file_picker(initial = None, title = None, filetypes = None):
	picker = tk.Tk()
	picker.attributes("-topmost", True)
	path = filedialog.askopenfilename(
		initialdir = initial,
		title = title,
		filetypes = tuple(filetypes) if filetypes else ()
	)
	picker.destroy()
	return path

def file_saveas(initial = None, title = None, filetypes = None):
	picker = tk.Tk()
	picker.attributes("-topmost", True)
	path = filedialog.asksaveasfilename(
		initialdir = initial,
		title = title,
		filetypes = tuple(filetypes) if filetypes else ()
	)
	picker.destroy()
	return path

if __name__ == '__main__':
	#               _     _
	#   _____ ___ _| |_ _| |___ ___
	#  |     | . | . | | | | -_|_ -|
	#  |_|_|_|___|___|___|_|___|___|
	#  eel.exposure does not seem to happen just from imported modules.
	#  therefore exposed functions are placed here, since the main application has to be updated with importing anyway.
	#  specific algorithms may take place in the distinctive module file

	from pymodules import qr
	def createqrandopenwith(data, openwith, usecase):
		return qr.create(data, openwith, usecase, file_handler)
		#passing file_handler to reuse but to avoid recursive import

	import pymodules.filter as processfilter
	def csvfilter(settings, arguments):
		return processfilter.csvfilter(settings, arguments)

	from pymodules.filehandler import backupfiles
	def backup(paths):
		return backupfiles(paths)

	#       _           _
	#   ___| |_ ___ ___| |_
	#  |_ -|  _| .'|  _|  _|
	#  |___|_| |__,|_| |_|
	#
	_database = db_handler(str(Path.home()) +'/qmassistant.db')

	eel.expose(webroot)
	eel.expose(rootResourcesImport)

	eel.expose(core_memory_clear)
	eel.expose(core_memory_dbSize)
	eel.expose(core_memory_delete)
	eel.expose(core_memory_keyDump)
	eel.expose(core_memory_read)
	eel.expose(core_memory_write)

	eel.expose(file_exists)
	eel.expose(file_directory)
	eel.expose(file_handler)
	eel.expose(file_readdir)
	eel.expose(file_picker)
	eel.expose(file_saveas)

	eel.expose(createqrandopenwith)
	eel.expose(csvfilter)
	eel.expose(backup)

	if WEBFOLDER:
		print ('\nDo not close this window, otherwise the browserview will stop working.\n')
		UpdateChecker()
		GLaDOS()
		eel.start('core.html', port = PORT, mode = BROWSER)
	else:
		print(HELP)

	del _database
