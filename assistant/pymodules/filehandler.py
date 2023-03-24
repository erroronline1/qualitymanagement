'''
backup script copies all subfolders and files but excluded if not existant or newer
resize function handles downsizing of jpg and png files
'''
import os
import shutil
import sys
import math
from datetime import datetime
from PIL import Image, ExifTags
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

def _tree(curdir, exclude, recursive = True):
	'''scans for directories and their files and last touch event'''
	curdir = os.path.normpath(curdir)
	result={curdir:{}}
	try:
		directory = os.scandir(curdir)
		for file in directory:
			if not file.name in exclude and file.is_dir() and recursive:
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
	_status.print('[*] backup done :)')
	_status.end()


DIRECTIONS={3 : 180, 6 : 270, 8 : 90} # rotate by {value}-degrees if {key} is found as orientation in exif-metadata
for ORIENTATION in ExifTags.TAGS.keys(): # get 16-bit integer EXIF tag enumeration
	if ExifTags.TAGS[ORIENTATION] == 'Orientation':
		break
def _resize(tree, maxsize, replace = False):
	'''resizes jpg and png files in passed tree'''
	maxsize = int(maxsize)
	for folder in tree:
		for file in tree[folder]:
			extension = file[file.rindex('.'):].lower()
			if extension in ('.jpg', '.png'):
				img = Image.open(os.path.join(folder, file))
				if img.width > maxsize or img.height > maxsize:
					name = file[0:file.rindex('.')]
					mtime = os.path.getmtime(os.path.join(folder, file))
					try:
						exif = dict(img._getexif().items())
						if exif[ORIENTATION] in DIRECTIONS:
							img = img.rotate(DIRECTIONS[exif[ORIENTATION]], expand = True)
					except (AttributeError, KeyError, IndexError):
						# cases: image doesn't have getexif-data
						pass
					if img.width >= img.height:
						height = round(maxsize * img.height / img.width)
						width = maxsize
					else:
						width = round(maxsize * img.width / img.height)
						height = maxsize
					img = img.resize((width, height), Image.LANCZOS)
					newname = os.path.join(folder, f'{name}_{width}x{height}_{datetime.fromtimestamp(mtime).strftime("%Y%m%d")}{extension}')
					img.save(newname)
					if replace:
						os.unlink(os.path.join(folder, file))
	_status.print('[*] resizing done :)')
	_status.end()

def backupfiles(paths):
	for setting in paths:
		local = _tree(setting['src']['startDir'], setting['src']['excludeDir'])
		remote = _tree(setting['dst']['startDir'], setting['dst']['excludeDir'])
		_copy(local, remote)
		return

def resizeimages(setting):
	fldr = _tree(setting['src']['startDir'], setting['src']['excludeDir'], setting['recursive'])
	_resize(fldr, setting['maxsize'], setting['replace'])
	return

if __name__ == '__main__':
	backupfiles(paths)