import csv
import json
import re
import time
import threading
import sys
import os
import itertools

def animationbar():
    for c in itertools.cycle( ['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .'] ):
        if stopanimation:
            break
        sys.stdout.write( '\r' + c )
        sys.stdout.flush()
        time.sleep(0.1)
        sys.stdout.write('\r')

def fprint(*args):
	#like print but flushes loading bar animation beforehand
	sys.stdout.flush()
	msg = ''
	for a in args:
		msg += str( a )
	sys.stdout.write( '\r' + msg +'\n' )

class tidied_cell_content:
	def __init__(self, row, headers):
		self.row = row
		self.headers = headers
	def c(self, column):
		return self.row[ self.headers.index( column ) ].strip()

print ('''                     
     _           _   _ _     _
 ___| |_ ___ ___| |_| |_|___| |_
|_ -|  _| . |  _| '_| | |_ -|  _|
|___|_| |___|___|_,_|_|_|___|_|

by error on line 1 (erroronline.one)

translates a stocklist export to a javascript object file ressource

''')

#load settings
try:
	with open('stocklist.json', 'r') as jsonfile:
		setting = json.loads( jsonfile.read().replace( '\n', '' ) )
	jsonfile.close() 
except:
	input('[~] settings could not be loaded, program aborted... press enter to exit program.')
	exit()

#look for last touched source file that matches filter for source according to settings
sourcefile=[]
for entry in os.scandir( os.getcwd() ):
	if os.path.isfile( os.path.join( os.getcwd(), entry) ):
		if re.match( setting['source'], entry.name ):
			sourcefile.append( [ entry.name, entry.stat().st_mtime ] )
if len(sourcefile):
	sourcefile.sort( key=lambda time: time[1], reverse=True )
else:
	input('[~] sourcefile named like ' + setting['source'] + ' not found, program aborted... press enter to exit program.')
	exit()

try:
	with open( sourcefile[0][0], newline='' ) as csvfile:
		
		stopanimation = False
		animation = threading.Thread( target = animationbar )
		animation.daemon = True
		animation.start()

		fprint('[*] loading source file ' + sourcefile[0][0] + '...')

		#extract headers from first row to list
		headers=re.findall( setting['sourceformat'], csvfile.readlines()[setting['headerrow']-1] + '\n\r' )
		#reset internal pointer
		csvfile.seek(0)
	
		#csv.DictReader does not properly handle the structure of the given file thus needing a custom solution for use of fieldnames
		rows = csv.reader(csvfile, delimiter=';')
		#initiate result list
		result = []

		for rowindex, row in enumerate(rows):
			# skip everything befor headerrow
			if rowindex < setting['headerrow'] - 1:
				continue
			
			tidy = tidied_cell_content(row, headers)
			# for filters
			skip = False
			
			for filters in setting['filter']:
				if bool(re.search(setting['filter'][filters], tidy.c(filters), re.IGNORECASE)):
					skip = True
			if skip:
				continue

			try:
				output = [tidy.c(c) for c in headers]
				result.append(output)
			except:
				fprint('[~] an error occured for following item, some fields contain forbidden characters - most probably quote-signs:\n[' + ', '.join(row) + ']')
				fprint('[~] the aforementioned item has been skipped. please remove respective characters in the erp-software and run this application again with a fresh export file to add item.')
	csvfile.close()

	#write js-object to destination file
	fprint('[*] writing destination file ' + setting['destination'] + '...')
	try:
		with open(setting['destination'], 'w', newline='', encoding='utf8') as file:
			file.write(setting['destinationoutputstart'])
			output = []
			for rowindex, row in enumerate(result):
				outputline = []
				# iterate over wanted fields
				for reduce in setting['readcolumns']:
					currentfield = ''
					if rowindex < 1:
						# first line are simply new headers
						currentfield = ', ' + reduce
					else:
						for column in setting['readcolumns'][reduce]['fields']:
							if setting['readcolumns'][reduce]['translate']:
								# concatenate handled translation if applicable
								currentfield += ', ' + setting['translate'][column][row[headers.index(column)]]
							else:
								# else concatenate raw values
								currentfield += ', ' + row[headers.index(column)] if row[headers.index(column)] != '' else ''
					# concatenate fields
					outputline.append(currentfield[2:])

				for add in setting['static']:
					if rowindex < 1:
						# extend headers
						outputline.append(add)
					else:
						# apply static value
						outputline.append(setting['static'][add])
				output.append(outputline)
			json.dump(output, file, ensure_ascii=False, indent=4)
			file.write(setting['destinationoutputend'])
		file.close()
	except:
		fprint('[~] ' + setting['destination'] + ' could not be written. sure to have the permission?')

	fprint('[*] done!')

except:
	fprint('source file could not be loaded, translation not successful...')

stopanimation = True

input('press enter to quit program...')
sys.exit()