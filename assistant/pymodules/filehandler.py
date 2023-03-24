'''
backup script copies all subfolders and files but excluded if not existant or newer
'''
import os
import shutil
import sys
import math
try:
	from assistant import interface
	ASSISTANT = True
except:
	ASSISTANT = False

paths = [
	{'src': {
		'startDir': 'C:/Users/dev/Documents',
		'excludeDir': ['.git', 'git', '__pycache__', 'build', 'dist', 'Eigene Bilder', 'Eigene Videos', 'Eigene Musik', 'Dell']
		},
	'dst': {
		'startDir': '//192.168.178.26/Public/doc/dev',
		'excludeDir': ['ancient']
		}
	}
]

class Status:
	'''writes a status message without newline'''
	def __init__(self):
		self.terminalwidth = shutil.get_terminal_size(0).columns
		if ASSISTANT:
			interface('see terminal for progress...<br />')
	def print(self, msg):
		'''write'''
		sys.stdout.write('\r' + msg[0:self.terminalwidth] + (' ' * (self.terminalwidth-len(msg)) if len(msg) < self.terminalwidth else ''))
		sys.stdout.flush()
	def end(self):
		'''newline to not mess up following prints or the like'''
		sys.stdout.write('\n')
		if ASSISTANT:
			interface('finished!<br />')

_status = Status()

def _tree(curdir, exclude):
	'''scans for directories and their files and last touch event'''
	curdir = os.path.normpath(curdir)
	result={curdir:{}}
	try:
		directory = os.scandir(curdir)
		for file in directory:
			if not file.name in exclude and file.is_dir():
				nextdir = os.path.normpath(os.path.join(curdir, file.name))
				result.update(_tree(nextdir, exclude))
			elif file.is_file():
				result[curdir][file.name] = file.stat().st_mtime
			_status.print('[...] analyzing ' + curdir + ' ' + str(len(result[curdir])))
	except Exception as access_denied:
		print (access_denied)
	return result

def _copy(origin, backup):
	'''copies new or updates files'''
	filesum = sum([len(origin[folder]) for folder in origin])
	progress = 0
	for originfolder in origin:
		backupfolder = originfolder.replace(list(origin)[0], list(backup)[0])
		for file in origin[originfolder]:
			_status.print('[' + str(math.ceil((progress/filesum)*100)) + ' %] ' + os.path.join(originfolder, file))
			if not backupfolder in backup:
				os.makedirs(backupfolder, exist_ok=True)
			if not backupfolder in backup or not file in backup[backupfolder] or origin[originfolder][file] > backup[backupfolder][file]: # touchwise
				shutil.copy2(os.path.join(originfolder, file), os.path.join(backupfolder, file))
			progress += 1
	_status.print('[*] done :)')
	_status.end()

def backupfiles(paths):
	for setting in paths:
		local = _tree(setting['src']['startDir'], setting['src']['excludeDir'])
		remote = _tree(setting['dst']['startDir'], setting['dst']['excludeDir'])
		_copy(local, remote)
		return

if __name__ == '__main__':
	backupfiles(paths)