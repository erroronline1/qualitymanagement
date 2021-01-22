import csv
import json
import re
import time
import threading
import sys
import os
import itertools
import xlsxwriter
import datetime

print ('''                    
     _           _   _ _     _
 ___| |_ ___ ___| |_| |_|___| |_
|_ -|  _| . |  _| '_| | |_ -|  _|
|___|_| |___|___|_,_|_|_|___|_|    built 20210222

by error on line 1 (erroronline.one)

processes a stocklist export

$ stocklist --help     for overview''')

DEFAULTJSON={
	"thisencoding": "BEWARE of character encoding. make sure these (äöü) specialchars are displayed properly before editing",
	"module": {
		"translate": {
			"____filter": "extend or reduce filters, filters can be regex (case insensitive), single strings or lists with strings but no booleans or integers",
			"filter": {
				"ORDERSTOP": "true"
			},
			"____destination": "choose destination file/path and add wrapping strings to convert a json-dump into a javascript object",
			"destination": "E:\\Quality Management\\assistant\\library\\module.data\\stocklist.js",
			"wrapstart" :"//this file was automatically created by <stocklist.exe>\n\nvar stocklist_data={content:",
			"wrapend": "};",
			"____unionbyoutputcolumn": "occasionally there are multiple entries in the source file with the same identifier that can be unified",
			"unionbyoutputcolumn": 1,
			"____readcolumns" : "fields have to be lists, even with single entries. lists will be concatenated, values can be processed by global translate or scoped pick, 'process' can either be omitted or set to false",
			"readcolumns": {
				"Item-ID": {
					"fields": ["ID"]
				},
				"Distributor": {
					"fields": ["DISTRIBUTOR"]
				},
				"Article Name": {
					"fields": ["CAPTION"]
				},
				"Order Number": {
					"fields": ["NUMBER"]
				},
				"Package Size": {
					"fields": ["QUANTITY"],
					"process": "translate"
				},
				"Additional Information": {
					"fields": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
				}
			},
			"____static": "this will be added to every element from the output",
			"static": {
				"Documents": "E:/DistributorDocuments"
			}
		},
		"split": {
			"____filter": "extend or reduce filters, filters can be regex (case insensitive), single strings or lists with strings but no booleans or integers",
			"filter": {
				"ORDERSTOP": "true",
				"REPOSITORY": ["0", "1", "21"]
			},
			"____prefix": "add something to the beginning of the output filenames",
			"prefix": "List_",
			"____splitbycolumns": "the input file will be splitted according to the different case insensitive matched values in these columns. you better not mess around with identifiers, product names or other diverse values",
			"splitbycolumns": {
				"REPOSITORY": "(.*)",
				"STORAGE": "([\\w\\d\\s]+)(?:.*)"
			},
			"____orberbyoutputcolumn": "output files will be sorted in ascending order of the column number (not index 0) of the output table",
			"orderbyoutputcolumn": 3,
			"____xlsxwidth": "number of points to width of the excelsheet to handle procentual column widths for readcolumns",
			"xlsxwidth": 120,
			"____readcolumnd" : "fields have to be lists, even with single entries. lists will be concatenated, values can be processed by global translate or scoped pick, 'process' can either be omitted or set to false, width can be set in percents for xlsx-output",
			"readcolumns": {
				"Item-ID": {
					"fields": ["ID"],
					"width": 5
				},
				"Distributor": {
					"fields": ["DISTRIBUTOR"],
					"width": 8
				},
				"Article Name": {
					"fields": ["CAPTION"],
					"width": 25
				},
				"Order Number": {
					"fields": ["NUMBER"],
					"width": 15
				},
				"Package Size": {
					"fields": ["QUANTITY"],
					"process": "translate",
					"width": 5
				},
				"Last Order": {
					"fields": ["LAST_ORDER"],
					"process": "pick",
					"width": 7
				},
				"Additional Information": {
					"fields": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
					"process": False,
					"width": 10
				}
			},
			"____static": "this will be added to every element from the output, formulas are allowed as well but have to be english for xslx!",
			"static": {
				"Quantity": "",
				"Calculation": "=INDIRECT(\"G\"&ROW())"
			},
			"____pick": "take only parts of value as selected by first regex (case sensitive) item, multiple results will be concatenated with second string item",
			"pick": {
				"LAST_ORDER": ["(\\S+)(?:\\s.*)", " "]
			}
		}
	},
	"____source": "if filename is regex, the last touched file will be used. set up row (not index 0) of header row.",
	"source": "ARTICLEMANAGER.CSV",
	"headerrow": 2,
	"____headersourceformat": "csv styles differ so one of the regexes (case insensitive) hopefully will identify header values correctly (with or without quotes)",
	"headersourceformat": ["\"(.+?)\"[;\\s]", "(.+?)[;\\s]"],
	"____sanitize": "replace faulty characters or stupid values with nothing, extend the lists as needed",
	"sanitize": {
		"chars": ["\""],
		"values": ["null"]
	},
	"____translate": "replace e.g. numerical values with legible translations. extend as needed",
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
                     [ -r | --reset ]      creates a default setting file for customization if not existent
                     [ -s | --split ]      split file by column value
                     [ -t | --translate ]  translate file to json- or javascript-object

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
							# create sorting key by matched patterns, mandatory translated if applicable
							sorting = ''
							for sort in SETTINGS['module']['split']['splitbycolumns']:
								match = re.findall(str(SETTINGS['module']['split']['splitbycolumns'][sort]), tidy.c(sort), re.IGNORECASE)
								if len(match):
									match = ' '.join(match).strip()
									sorting += ' ' + (SETTINGS['translate'][sort][match] if sort in SETTINGS['translate'] else match)

							if not sorting in importDict:
								importDict[sorting] = [output]
							else:
								importDict[sorting].append(output)
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
				if 'process' in module['readcolumns'][reduce] and module['readcolumns'][reduce]['process'] == 'translate' and column in SETTINGS['translate']:
					# concatenate handled translation if applicable
					currentfield += ', ' + SETTINGS['translate'][column][rowdict[HEADERS.index(column)]] if rowdict[HEADERS.index(column)] in SETTINGS['translate'][column] else rowdict[HEADERS.index(column)]
				elif 'process' in module['readcolumns'][reduce] and module['readcolumns'][reduce]['process'] == 'pick':
					# concatenate handled picked parts if applicable
					if column in module['pick']:
						match = re.findall("^" + str(module['pick'][column][0]) + "$", rowdict[HEADERS.index(column)])
						picked = False
						if len(match):
							picked = module['pick'][column][1].join(match[0])
					currentfield += ', ' + picked if picked else rowdict[HEADERS.index(column)]
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
							union[column] += '; ' + outputline[column]
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
				file.write(module['wrapstart'])
				json.dump(result, file, ensure_ascii = False, indent = 4)
				file.write(module['wrapend'])
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
	if not choice('split file by ' + str(list(module['splitbycolumns'].keys())) + ' [y / n]?', ['y', 'n'])=='y':
		return 'cancel'

	########################################
	# translate, reduce, set up result lists
	########################################
	fprint('     translate')
	ANIMATION = True
	result = {}
	# iterate over sorted results
	for split in imported:
		# iterate over imported lists
		for row, rowlist in enumerate(imported[split]):
			# iterate over wanted fields
			currentrow = []
			for reduce in module['readcolumns']:
				currentfield = ''
				for column in module['readcolumns'][reduce]['fields']:
					if 'process' in module['readcolumns'][reduce] and module['readcolumns'][reduce]['process'] == 'translate' and column in SETTINGS['translate']:
						# concatenate handled translation if applicable
						currentfield += ', ' + SETTINGS['translate'][column][rowlist[HEADERS.index(column)]] if rowlist[HEADERS.index(column)] in SETTINGS['translate'][column] else rowlist[HEADERS.index(column)]
					elif 'process' in module['readcolumns'][reduce] and module['readcolumns'][reduce]['process'] == 'pick':
						# concatenate handled picked parts if applicable
						if column in module['pick']:
							match = re.findall("^" + str(module['pick'][column][0]) + "$", rowlist[HEADERS.index(column)])
							picked = False
							if len(match):
								picked = module['pick'][column][1].join(match[0])
						currentfield += ', ' + picked if picked else rowlist[HEADERS.index(column)]
					else:
						# else concatenate raw values
						currentfield += ', ' + rowlist[HEADERS.index(column)] if rowlist[HEADERS.index(column)] != '' else ''
				# add fields to current row
				currentrow.append(currentfield[2:])
			# add static value to current row
			for add in module['static']:
				currentrow.append(module['static'][add])

			if split in result:
				result[split].append(currentrow)
			else:
				result[split] = [currentrow]
		result[split]=sorted(result[split], key = lambda l: l[module['orderbyoutputcolumn']-1])
		
	if result:
		ANIMATION = False
		exp = choice("Export to .csv or .xlsx [c / x]?", ["c", "x"])
		ANIMATION = True
		if exp == 'c':
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
		elif exp == 'x':
			#################################################
			# write split worksheets to xlsx file
			#################################################
			workbook = xlsxwriter.Workbook(module['prefix'].strip() + '.xlsx')

			cell_std = workbook.add_format({'top': 1, 'num_format':'@', 'valign': 'top', 'text_wrap': True})
			# define other formats if necessary:
			cell_other = workbook.add_format({'top': 1, 'num_format':'@', 'valign': 'top', 'text_wrap': True})
			for sheet in result:
				worksheet = workbook.add_worksheet() # sheet[0:31])
				worksheet.set_landscape()
				worksheet.set_margins(left = .25, right = .15, top = .5, bottom = .25)
				worksheet.set_default_row(32)
				# add sort key as header on page
				worksheet.set_header(sheet + datetime.datetime.now().strftime(' - %B %Y'))

				# set column widths and store column number for supported style properties
				col = 0
				column_format={'other':[]} # initilize possible supported column formats
				for column in module['readcolumns']:
					if 'width' in module['readcolumns'][column]:
						worksheet.set_column(col, col, module['xlsxwidth'] / 100 * module['readcolumns'][column]['width'])
					if 'other' in module['readcolumns'][column]: # add column number to format list if applicable
						if module['readcolumns'][column]['other']:
							column_format['other'].append(col)
					col += 1
				row=0
				col=0
				# add sort key as header on sheet
				worksheet.write(row, col, sheet)
				row += 1

				# add headers + static
				header = [reduce for reduce in module['readcolumns']]
				header.extend([add for add in module['static']])
				for cell in header:
					worksheet.write(row, col, cell)
					col +=1
				worksheet.repeat_rows(row)

				# write content
				for rrow in result[sheet]:
					row += 1
					col = 0
					for cell in rrow:
						if col in column_format['other']: # apply column format if applicable
							cell_format = cell_other
						else: 
							cell_format = cell_std
						worksheet.write(row, col, cell, cell_format)
						col += 1
			workbook.close()
			fprint('[*]  destination file ' + module['prefix'].strip() + '.xlsx' + ' successfully written', clearanimation = '[*]')
			success = True
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