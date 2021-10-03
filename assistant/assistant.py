import eel
import sqlite3
from pathlib import Path

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

@eel.expose # expose function to javascript
# if this is not answering, frontend core functions will not be overridden
def available():
	return True

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

eel.init('web') #fldr name for web content

eel.start('core.html', port=11235, mode='edge')
del _database