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
|___|_| |___|___|_,_|_|_|___|_|    built 20201231

by error on line 1 (erroronline.one)

processes a stocklist export

$ stocklist --help     for overview''')

DEFAULTJSON={
	"comment": "BEWARE of character encoding. make sure these (äöü) specialchars are displayed properly before editing",
	"module": {
		"translate": {
			"ON_FILTERS": "extend or reduce filters, filters can be regex, single strings or lists with strings but no booleans or integers",
			"filter": {
				"ORDERSTOP": "true"
			},
			"ON_DESTINATION": "choose destination file and add enclosing strings to convert a json-dump into a javascript object",
			"destination": "E:\\Quality Management\\assistant\\library\\module.data\\stocklist.js",
			"destinationoutputstart" :"//this file was automatically created by <stocklist.exe>\n\nvar stocklist_data={content:",
			"destinationoutputend": "};",
			"ON_UNION": "occasionally there are multiple entries in the source file with the same identifier that can be unified",
			"unionbyoutputcolumn": 1,
			"ON_READCOLUMNS" : "fields have to be lists, even with single entries. lists will be concatenated, values can be translated by global properties",
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
			"ON_STATIC": "this will be added to every element from the output",
			"static": {
				"Documents": "E:/DistributorDocuments"
			}
		},
		"split": {
			"ON_FILTERS": "extend or reduce filters, filters can be regex, single strings or lists with strings but no booleans or integers",
			"filter": {
				"ORDERSTOP": "true",
				"REPOSITORY": ["0", "1", "21"]
			},
			"ON_PREFIX": "add something to the beginning of the output filenames",
			"prefix": "List_",
			"ON_SPLITBYCOLUMN": "the input file will be splitted according to the different values in this column. you better not mess around with identifiers or product names",
			"splitbycolumn": "REPOSITORY",
			"ON_ORDERBYOUTPUTCOLUMN": "output files will be sorted in ascending order of this column number (not index 0)",
			"orderbyoutputcolumn": 3,
			"ON_READCOLUMNS" : "fields have to be lists, even with single entries. lists will be concatenated, values can be translated by global properties",
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
				"Repository": {
					"fields": ["REPOSITORY"],
					"translate": True
				},
				"Additional Information": {
					"fields": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
					"translate": False
				}
			},
			"ON_STATIC": "this will be added to every element from the output",
			"static": {
				"Quantity": ""
			}
			
		}
	},
	"ON_SOURCE": "if filename is regex, the last touched file will be used. set up row (not index 0) of header row.",
	"source": "ARTICLEMANAGER.CSV",
	"headerrow": 2,
	"ON_HEADERSOURCEFORMAT": "csv styles differ so one of the regexes hopefully will identify header values correctly (with or without quotes)",
	"headersourceformat": ["\"(.+?)\"[;\\s]", "(.+?)[;\\s]"],
	"ON_SANITIZE": "replace faulty characters or stupid values with nothing, extend the lists as needed",
	"sanitize": {
		"chars": ["\""],
		"values": ["null"]
	},
	"ON_TRANSLATE":"replace e.g. numerical values with legible translations. extend as needed",
	"translate": {
		"QUANTITY": {
			"1": "piece",
			"2": "pair",
			"4": "metre",
			"5": "set",
			"6": "litre",
			"7": "square metre",
			"8": "bag"
		},
		"REPOSITORY":{
			"1": "Central",
			"2": "Department 1",
			"3": "Department 2",
			"4": "Office"
		}
	}
}

HELPTEXT= '''
[help]

    this program serves to process a stocklist csv.
    
    currently there are two options available:
    1. converting into a javascript file with an object containing entries from the file
    2. splitting into separate lists according to values of a given column 
    
    this is not ai, you'll have to analyze the inhomogeneous sources by yourself beforehand in order to set up. 

    usage: stocklist [ -h | --help ]       this message, priority handling
                     [ -t | --translate ]  translate file to javascript-object
                     [ -s | --split ]      split file by column value
                     [ -r | --reset ]      creates a default setting file for customization if not existent

    you can either start directly from the command prompt or will be asked during runtime.

    setup is specified in stocklist.json as following (notice related comments within the setup):

''' + json.dumps(DEFAULTJSON, indent=4)

#                           _   ___             _   _
#   ___ ___ ___ ___ ___ ___| | |  _|_ _ ___ ___| |_|_|___ ___ ___
#  | . | -_|   | -_|  _| .'| | |  _| | |   |  _|  _| | . |   |_ -|
#  |_  |___|_|_|___|_| |__,|_| |_| |___|_|_|___|_| |_|___|_|_|___|
#  |___|
#

def animationbar():
	# notify user that something is still going on
	for c in itertools.cycle( ['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .'] ):
		if not ANIMATION:
			continue
		sys.stdout.write('\r' + c)
		sys.stdout.flush()
		time.sleep(0.1)

def fprint(*args, clearanimation = False):
	# like print but optionally clears loading animation bar beforehand
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
	# easy access to sanitized column values while iterating through rows
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

def reset(thisfilename):
	# create a default configuration file
	try:
		with open(thisfilename + '.json', 'x', newline = '', encoding = 'utf8') as file:
			json.dump(DEFAULTJSON, file, ensure_ascii = False, indent = 4)
		fprint('[*]  default setting file ' + thisfilename + '.json successfully written. please accommodate to your environment.\n')
	except:
		fprint('[~]  ' + thisfilename + '.json could not be written because it already existed. please contact devops.\n')

def choice(query, options):
	# force a decision. query is a string, options is a list
	c=''
	while not c in options:
		fprint(query + '\n', clearanimation = True)
		c=str(input('[?]  select option: '))
	return c

#                           _     _
#   _                   _  | |   | |___ _ _ _
#  |_|_____ ___ ___ ___| |_|_|___|_|  _|_| | |_ ___ ___
#  | |     | . | . |  _|  _| |   | |  _| | |  _| -_|  _|
#  |_|_|_|_|  _|___|_| |_|   |_|_| |_| |_|_|_| |___|_|
#          |_|
#
def open_import_filter(module):
	global HEADERS
	global ANIMATION

	#look for last touched source file that matches filter for source according to settings
	sourcefile = []
	for entry in os.scandir( os.getcwd() ):
		if os.path.isfile( os.path.join( os.getcwd(), entry) ):
			if re.match( SETTINGS['source'], entry.name ):
				sourcefile.append( [ entry.name, entry.stat().st_mtime ] )
	if len(sourcefile):
		sourcefile.sort( key=lambda time: time[1], reverse=True )
		success = True
	else:
		success = False
		fprint('[~]  sourcefile named like ' + SETTINGS['source'] + ' not found.')

	if success:
		# split module sorts by values of given column, translate module uses just one list of results
		sorting = SETTINGS['module']['split']['splitbycolumn'] if module == 'split' else 1
		try:
			with open( sourcefile[0][0], newline='' ) as csvfile:
				#read source-file		
				fprint('     reading source file ' + sourcefile[0][0])
				ANIMATION = True
				#detect dialect, with quotes or without, idk, works well but not without
				dialect = csv.Sniffer().sniff(csvfile.read(1024))
				#reset internal pointer
				csvfile.seek(0)

				#extract headers
				for headerformat in SETTINGS['headersourceformat']:
					HEADERS = re.findall( headerformat, csvfile.readlines()[SETTINGS['headerrow'] - 1] + '\n\r' )
					#reset internal pointer
					csvfile.seek(0)
					if HEADERS:
						break

				#csv.DictReader does not properly handle the structure of the given file thus needing a custom solution for use of fieldnames
				rows = csv.reader(csvfile, dialect, delimiter=';')
				#initiate result list
				importDict = {}

				# read sanitized and fitered data from source and sort to importDict
				for rowindex, row in enumerate(rows):
					# skip everything before and headerrow
					if rowindex < SETTINGS['headerrow']:
						continue
					
					tidy = tidied_cell_content(row, HEADERS, SETTINGS['sanitize'])
					# initialize for filters
					skip = False
					
					# iterate over filters and skip filtered rows
					for filters in SETTINGS['module'][module]['filter']:
						if type(SETTINGS['module'][module]['filter'][filters]) is list:
							for filtervalue in SETTINGS['module'][module]['filter'][filters]:
								if bool(re.search("^" + str(filtervalue) + "$", tidy.c(filters), re.IGNORECASE)):
									skip = True
						else:
							if bool(re.search("^" + str(SETTINGS['module'][module]['filter'][filters]) + "$", tidy.c(filters), re.IGNORECASE)):
								skip = True
					if skip:
						continue

					# sanitize values, recreate list and add to dictionary, occasionally sorted
					try:
						output = [tidy.c(c) for c in HEADERS]
						
						if module == 'split':
							if not tidy.c(sorting) in importDict:
								importDict[tidy.c(sorting)] = [output]
							else:
								importDict[tidy.c(sorting)].append(output)
						else:
							if not 1 in importDict:
								importDict[1] = [output]
							else:
								importDict[1].append(output)
					except:
						fprint('[~]  an error occured for following item, some fields may contain forbidden characters:\n[' + ', '.join(row) + ']', clearanimation = True)
						fprint('[~]  the aforementioned item has been skipped. please contact devops to update sanitation options.')
			return importDict
		except:
			fprint('[~]  source file could not be loaded or processed.', clearanimation = '[~]')
	return False

#   _                   _     _       
#  | |_ ___ ___ ___ ___| |___| |_ ___ 
#  |  _|  _| .'|   |_ -| | .'|  _| -_|
#  |_| |_| |__,|_|_|___|_|__,|_| |___|
#
#
def translate(imported):
	global ANIMATION
	module = SETTINGS['module']['translate']

	ANIMATION = False
	if not choice('translate file to ' + module['destination'] + ' [y / n]?', ['y', 'n'])=='y':
		return 'cancel'

	########################################
	# translate, reduce, set up result lists
	########################################
	fprint('     translate')
	ANIMATION = True
	result = []

	for rowdict in imported[1]:
		outputline = []
		currentfield = ''
		# iterate over wanted fields
		for reduce in module['readcolumns']:
			currentfield = ''
			for column in module['readcolumns'][reduce]['fields']:
				if module['readcolumns'][reduce]['translate']:
					# concatenate handled translation if applicable
					currentfield += ', ' + SETTINGS['translate'][column][rowdict[HEADERS.index(column)]] if rowdict[HEADERS.index(column)] in SETTINGS['translate'][column] else ''
				else:
					# else concatenate raw values
					currentfield += ', ' + rowdict[HEADERS.index(column)] if rowdict[HEADERS.index(column)] != '' else ''
			# add fields to line-list
			outputline.append(currentfield[2:])
		# add static value to line-list
		for add in module['static']:
			outputline.append(module['static'][add])

		#union on given setting
		append = True
		if module['unionbyoutputcolumn']:
			for union in result:
				if outputline[module['unionbyoutputcolumn']-1] == union[module['unionbyoutputcolumn']-1]:
					for column, field in enumerate(union):
						if field != outputline[column] and outputline[column] != '':
							union[column] += ', ' + outputline[column]
					append = False
		if append:
			result.append(outputline)
					
	if len(result):
		# insert headers + static on index 0
		result.insert(0, [ reduce for reduce in module['readcolumns']] + [add for add in module['static']])

		#################################################
		# write js file
		#################################################
		try:
			with open(module['destination'], 'w', newline = '', encoding = 'utf8') as file:
				file.write(module['destinationoutputstart'])
				json.dump(result, file, ensure_ascii = False, indent = 4)
				file.write(module['destinationoutputend'])
			fprint('[*]  destination file ' + module['destination'] + ' successfully written', clearanimation = '[*]')
			success = True
		except:
			success = False
			fprint('[~]  ' + module['destination'] + ' could not be written.', clearanimation = '[*]')

	ANIMATION = False
	return success

#           _ _ _   
#   ___ ___| |_| |_ 
#  |_ -| . | | |  _|
#  |___|  _|_|_|_|
#      |_|
# 
def split(imported):
	global HEADERS
	global ANIMATION
	module = SETTINGS['module']['split']

	ANIMATION = False
	if not choice('split file by ' + module['splitbycolumn'] + ' [y / n]?', ['y', 'n'])=='y':
		return 'cancel'

	########################################
	# translate, reduce, set up result lists
	########################################
	fprint('     translate')
	ANIMATION = True
	result = {}
	# iterate over sorted results
	for splitbycolumn in imported:
		# intiate result key, translate if applicable
		if module['splitbycolumn'] in SETTINGS['translate'] and splitbycolumn in SETTINGS['translate'][module['splitbycolumn']]:
			key = SETTINGS['translate'][module['splitbycolumn']][splitbycolumn]
		else:
			key = splitbycolumn

		# iterate over imported lists
		for row, rowlist in enumerate(imported[splitbycolumn]):
			# iterate over wanted fields
			currentrow = []
			for reduce in module['readcolumns']:
				currentfield = ''
				for column in module['readcolumns'][reduce]['fields']:
					if module['readcolumns'][reduce]['translate']:
						# concatenate handled translation if applicable
						currentfield += ', ' + SETTINGS['translate'][column][rowlist[HEADERS.index(column)]] if rowlist[HEADERS.index(column)] in SETTINGS['translate'][column] else ''
					else:
						# else concatenate raw values
						currentfield += ', ' + rowlist[HEADERS.index(column)] if rowlist[HEADERS.index(column)] != '' else ''
				# add fields to current row
				currentrow.append(currentfield[2:])
			# add static value to current row
			for add in module['static']:
				currentrow.append(module['static'][add])

			if key in result:
				result[key].append(currentrow)
			else:
				result[key] = [currentrow]
		result[key]=sorted(result[key], key = lambda l: l[module['orderbyoutputcolumn']-1])
		
	if result:
		#################################################
		# write split csv files
		#################################################
		for outputfile in result:
			try:
				with open(module['prefix'] + outputfile + '.csv', 'w', newline='') as file:
					out = csv.writer(file, csv.excel, delimiter=';', quotechar='"', quoting=csv.QUOTE_ALL)
					# add headers + static
					header = [reduce for reduce in module['readcolumns']]
					header.extend([add for add in module['static']])
					out.writerow(header)
					for row in result[outputfile]:
						out.writerow(row)
				fprint('[*]  destination file ' + module['prefix'] + str(outputfile) + '.csv' + ' successfully written', clearanimation = '[*]')
				success = True
			except:
				success = False
				fprint('[~]  ' + module['prefix'] + str(outputfile) + '.csv' + ' could not be written.', clearanimation = '[*]')

	ANIMATION = False
	return success

#       _           _
#   ___| |_ ___ ___| |_
#  |_ -|  _| .'|  _|  _|
#  |___|_| |__,|_| |_|
#
# 
def start(module):
	global ANIMATION
	animation = threading.Thread( target = animationbar )
	animation.daemon = True
	animation.start()

	success = False

	imported = open_import_filter(module)
	
	if not imported:
		return
	else:
		if module == 'translate':
			success = translate(imported)
		elif module == 'split':
			success = split(imported)

	if success == 'cancel':
		fprint('[*]  aborted by user')
	elif success:
		fprint('[*]  done!')
	else:
		fprint('[~]  some error occured. please contact devops.')


#   _     _ _   _     _ _
#  |_|___|_| |_|_|___| |_|___ ___
#  | |   | |  _| | .'| | |- _| -_|
#  |_|_|_|_|_| |_|__,|_|_|___|___|
#
#

# set globals
ANIMATION = True
HEADERS = False

thisfilename = sys.argv[0].split('.')[0]

# load settings
try:
	with open(thisfilename + '.json', 'r') as jsonfile:
		SETTINGS= json.loads(jsonfile.read().replace('\n', ''))
except:
	fprint('[~]  settings could not be loaded, see help for syntax...')
	SETTINGS = False

if __name__ == '__main__':
	# argument handler
	# options actually ordered by importance, first come, first served
	options = {	'h': {'pattern': '--help|-h', 'function': 'show help-message'},
				't': {'pattern': '--translate|-t', 'function': 'translate file to javascript-object'},
				's': {'pattern': '--split|-s', 'function': 'split file by column value'},
				'r': {'pattern': '--reset|-r', 'function': 'generate default settings file'},
				'x': {'pattern': '--exit|-x', 'function': 'exit'}}

	# find option from shell arguments
	confirm = False
	for opt in options:
		arg = re.findall(options[opt]['pattern'], ' '.join(sys.argv) + ' ', re.IGNORECASE)
		if bool(arg):
			confirm = opt
			break
		else:
			pass

	# force option by input, option list will be displayed
	if SETTINGS and not confirm:
		print('\nchoose one of the available options...')  
		query = ''
		for opt in options:
			query += opt + ': ' + options[opt]['function'] + '\n'
		confirm = choice(query, [opt for opt in options])
	
	# auto help if no setting file is found
	if (not SETTINGS or confirm == 'h') and confirm != 'r':
		print (HELPTEXT)
	elif confirm == 'r':
		reset(thisfilename)
	elif confirm == 't':
		start('translate')
	elif confirm == 's':
		start('split')

	fprint('')
	input('\r[?]  press enter to quit...')
	sys.exit()