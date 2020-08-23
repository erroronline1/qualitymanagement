import csv
import json
import re
import time
import threading
import sys
import os
import itertools

print ('''                    
     _           _   _ _     _
 ___| |_ ___ ___| |_| |_|___| |_
|_ -|  _| . |  _| '_| | |_ -|  _|
|___|_| |___|___|_,_|_|_|___|_|    build 20200823

by error on line 1 (erroronline.one)

translates a stocklist export to a javascript object file ressource

$ stocklist --help     for overview''')

DEFAULTJSON={
	"comment": "BEWARE of character encoding. make sure these (äöü) spechialchars are displayed properly.",
	"source": "ARTIKELMANAGER.CSV",
	"headersourceformat": "(.+?)[;\\s]",
	"headerrow": 2,
	"destination": "E:\\Quality Management\\assistant\\library\\module.data\\stocklist.js",
	"destinationoutputstart" :"//this file was automatically created by <stocklist.exe>\n\nvar stocklist_data={content:",
	"destinationoutputend": "};",
	"unionbyoutputcolumn": 1,
	"readcolumns": {
		"Item-ID": {
			"fields": ["ID"],
			"translate": False
		},
		"Distributor": {
			"fields": ["DISTRIBUTOR"],
			"translate": False
		},
		"Article Name": {
			"fields": ["CAPTION"],
			"translate": False
		},
		"Order Number": {
			"fields": ["NUMBER"],
			"translate": False
		},
		"Package Size": {
			"fields": ["QUANTITY"],
			"translate": True
		},
		"Additional Information": {
			"fields": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
			"translate": False
		}
	},
	"static": {
		"Documents": "E:/DistributorDocuments"
	},
	"sanitize": {
		"chars": ["\""],
		"values": ["null"]
	},
	"filter": {
		"ORDERSTOP": "true"
	},
	"translate": {
		"QUANTITY": {
			"1": "piece",
			"2": "pair",
			"4": "metre",
			"5": "set",
			"6": "litre",
			"7": "square metre",
			"8": "bag"
		}
	}
}

HELPTEXT= '''
[help]

    this program serves to translate a stocklist csv to a javascript file with an object.
    this is not ai, you'll have to analyze the inhomogeneous sources by yourself beforehand in order to set up. 

    usage: stocklist [ -h | --help ]    this message, priority handling
                     [ -r | --reset ]   creates a default setting file for editing

    setup is specified in stocklist.json as following:

''' + json.dumps(DEFAULTJSON, indent=4) + '''

    * comment: to remind you of system dependent character encoding. not processed
    * source: to process. processed as regex so capable of patterns
    * headersourceformat: regex to split the sources headers according to...
    * ...headerrow: actual row, not index starting at 0
    * destination: output filename with path. without path it will be stored in executiong directory
    * destinationoutputstart und -end: output is a json-dump. add javascript variable names and whatnot
    * unionbyoutputcolumn: concat values by actual column of output, not index starting at 0
    * readcolumns: output-column filled with optional concatented source fields by header, optionally translated
    * static: added to every dataset
    * sanitize: array of characters and values that will be omitted
    * filter: omit whole rows depending on columns with given value
    * translate: values in given fields to be replaced with any string

    readcolumns, static, filter, translate and any given array can be extended at will
'''

#                           _   ___             _   _
#   ___ ___ ___ ___ ___ ___| | |  _|_ _ ___ ___| |_|_|___ ___ ___
#  | . | -_|   | -_|  _| .'| | |  _| | |   |  _|  _| | . |   |_ -|
#  |_  |___|_|_|___|_| |__,|_| |_| |___|_|_|___|_| |_|___|_|_|___|
#  |___|
#

def animationbar():
	for c in itertools.cycle( ['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .'] ):
		if STOPANIMATION:
			break
		sys.stdout.write('\r' + c)
		sys.stdout.flush()
		time.sleep(0.1)

def fprint(*args, clearanimation = False):
	#like print but optionally clears loading bar animation beforehand
	if type(clearanimation) is str:
		sys.stdout.write( '\r' + clearanimation + ' ' * (4 - len(clearanimation) ))
	elif clearanimation:
		sys.stdout.write( '\r    ' )
	msg = ''
	for a in args:
		msg += str( a )
	sys.stdout.write( '\n\r' + msg  )
	sys.stdout.flush()

class tidied_cell_content:
	def __init__(self, row, headers, sanitize):
		self.row = row
		self.headers = headers
		self.sanitize = sanitize
	def c(self, column):
		for char in self.sanitize['chars']:
			self.row[ self.headers.index( column ) ] = self.row[ self.headers.index( column ) ].replace(char, '').strip()
		for value in self.sanitize['values']:
			if self.row[ self.headers.index( column ) ] == value:
				self.row[ self.headers.index( column ) ] = ''
		return self.row[ self.headers.index( column ) ]

def reset():
	try:
		with open('stocklist.json', 'x', newline='', encoding='utf8') as file:
			json.dump(DEFAULTJSON, file, ensure_ascii=False, indent=4)
		fprint('[*]  setting file stocklist.json successfully written. please accommodate to your environment.\n')
	except:
		fprint('[~]  stocklist.json could not be written because it already existed. please contact devops.\n')

#             _       ___             _   _
#   _____ ___|_|___  |  _|_ _ ___ ___| |_|_|___ ___
#  |     | .'| |   | |  _| | |   |  _|  _| | . |   |
#  |_|_|_|__,|_|_|_| |_| |___|_|_|___|_| |_|___|_|_|
#
#

def main():
	global STOPANIMATION
	success=True
	#look for last touched source file that matches filter for source according to settings
	sourcefile=[]
	for entry in os.scandir( os.getcwd() ):
		if os.path.isfile( os.path.join( os.getcwd(), entry) ):
			if re.match( SETTINGS['source'], entry.name ):
				sourcefile.append( [ entry.name, entry.stat().st_mtime ] )
	if len(sourcefile):
		sourcefile.sort( key=lambda time: time[1], reverse=True )
	else:
		success=False
		fprint('[~]  sourcefile named like ' + SETTINGS['source'] + ' not found.')

	if success:
		#             _                                     _             _
		#   _____ ___|_|___   ___ ___ ___ ___ ___ ___ ___  |_|___ ___ _ _| |_
		#  |     | .'| |   | | . |  _| . |  _| -_|_ -|_ -| | |   | . | | |  _|
		#  |_|_|_|__,|_|_|_| |  _|_| |___|___|___|___|___| |_|_|_|  _|___|_|
		#                    |_|                                 |_|
		#
		animation = threading.Thread( target = animationbar )
		animation.daemon = True
		
		try:
			with open( sourcefile[0][0], newline='' ) as csvfile:
				#read source-file		
				fprint('     reading source file ' + sourcefile[0][0])
				animation.start()
				#detect dialect, with quotes or without, idk, works well but not without
				dialect = csv.Sniffer().sniff(csvfile.read(1024))
				#reset internal pointer
				csvfile.seek(0)

				#extract headers from first row to list
				headers=re.findall( SETTINGS['headersourceformat'], csvfile.readlines()[SETTINGS['headerrow']-1] + '\n\r' )
				#reset internal pointer
				csvfile.seek(0)

				#csv.DictReader does not properly handle the structure of the given file thus needing a custom solution for use of fieldnames
				rows = csv.reader(csvfile, dialect, delimiter=';')
				#initiate result list
				result = []

				for rowindex, row in enumerate(rows):
					# skip everything befor headerrow
					if rowindex < SETTINGS['headerrow'] - 1:
						continue
					
					tidy = tidied_cell_content(row, headers, SETTINGS['sanitize'])
					# for filters
					skip = False
					
					for filters in SETTINGS['filter']:
						if bool(re.search(SETTINGS['filter'][filters], tidy.c(filters), re.IGNORECASE)):
							skip = True
					if skip:
						continue

					try:
						output = [tidy.c(c) for c in headers]
						result.append(output)
					except:
						fprint('[~]  an error occured for following item, some fields may contain forbidden characters:\n[' + ', '.join(row) + ']', clearanimation = True)
						fprint('[~]  the aforementioned item has been skipped. please contact devops to update sanitation options.')
		except:
			success=False
			fprint('[~]  source file could not be loaded or processed, translation not successful.', clearanimation = '[~]')

	if success:
		#             _                                       _     _
		#   _____ ___|_|___   ___ ___ ___ ___ ___ ___ ___   _| |___| |_ ___
		#  |     | .'| |   | | . |  _| -_| . | .'|  _| -_| | . | .'|  _| .'|
		#  |_|_|_|__,|_|_|_| |  _|_| |___|  _|__,|_| |___| |___|__,|_| |__,|
		#                    |_|         |_|
		#
		# 		#translate, reduce
		fprint('     translate', clearanimation = '[*]')
		output = []
		for row, rowdict in enumerate(result):
			outputline = []
			# iterate over wanted fields
			for reduce in SETTINGS['readcolumns']:
				currentfield = ''
				if row < 1:
					# first line are simply new headers
					currentfield = ', ' + reduce
				else:
					for column in SETTINGS['readcolumns'][reduce]['fields']:
						if SETTINGS['readcolumns'][reduce]['translate']:
							# concatenate handled translation if applicable
							currentfield += ', ' + SETTINGS['translate'][column][rowdict[headers.index(column)]] if rowdict[headers.index(column)] in SETTINGS['translate'][column] else ''
						else:
							# else concatenate raw values
							currentfield += ', ' + rowdict[headers.index(column)] if rowdict[headers.index(column)] != '' else ''
				# concatenate fields
				outputline.append(currentfield[2:])

			for add in SETTINGS['static']:
				if row < 1:
					# extend headers
					outputline.append(add)
				else:
					# apply static value
					outputline.append(SETTINGS['static'][add])

			#union on given setting
			append = True
			if SETTINGS['unionbyoutputcolumn']:
				for union in output:
					if outputline[SETTINGS['unionbyoutputcolumn']-1] == union[SETTINGS['unionbyoutputcolumn']-1]:
						for column, field in enumerate(union):
							if field != outputline[column] and outputline[column] != '':
								union[column] += ', ' + outputline[column]
						append = False
			if append:
				output.append(outputline)
					
	if success:
		#             _                 _ _           _     _
		#   _____ ___|_|___   _ _ _ ___|_| |_ ___   _| |___| |_ ___
		#  |     | .'| |   | | | | |  _| |  _| -_| | . | .'|  _| .'|
		#  |_|_|_|__,|_|_|_| |_____|_| |_|_| |___| |___|__,|_| |__,|
		#
		#
		try:
			with open(SETTINGS['destination'], 'w', newline='', encoding='utf8') as file:
				file.write(SETTINGS['destinationoutputstart'])
				json.dump(output, file, ensure_ascii=False, indent=4)
				file.write(SETTINGS['destinationoutputend'])
			fprint('[*]  destination file ' + SETTINGS['destination'] + ' successfully written', clearanimation = '[*]')
		except:
			success=False
			fprint('[~]  ' + SETTINGS['destination'] + ' could not be written.', clearanimation = '[*]')

	if success:
		fprint('[*]  done!')
	else:
		fprint('[~]  some error occured. please contact devops.')
	STOPANIMATION = True

#   _     _ _   _     _ _
#  |_|___|_| |_|_|___| |_|___ ___
#  | |   | |  _| | .'| | |- _| -_|
#  |_|_|_|_|_| |_|__,|_|_|___|___|
#
#
# #load settings
try:
	with open('stocklist.json', 'r') as jsonfile:
		SETTINGS= json.loads(jsonfile.read().replace('\n', ''))
except:
	fprint('[~]  settings could not be loaded, see help for syntax...')
	SETTINGS=False

#set globals
STOPANIMATION=False

if __name__ == '__main__':
	#argument handler	
	#options actually ordered by importance
	confirm = False
	options = {	'h':'--help|-h',
				'r':'--reset|-r'}
	for opt in options:
		arg=re.findall(options[opt], ' '.join(sys.argv) + ' ', re.IGNORECASE)
		if opt == 'h' and arg:
			confirm = 'h'
			break
		elif opt == 'r' and bool(arg):
			confirm = 'r'
			break
		else:
			pass

	#auto help if no source file is found
	if not SETTINGS or confirm == 'h':
		print (HELPTEXT)
	elif confirm == 'r':
		reset()
	else:
		main()

	fprint('', clearanimation = True)
	input('\r[?]  press enter to quit...')
	sys.exit()