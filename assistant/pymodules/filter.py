import csv
import json
import re
from datetime import datetime
import calendar
import sys
import os
import traceback
import xlsxwriter
try:
	from assistant import interface
	ASSISTANT = True
except:
	ASSISTANT = False

if __name__ == '__main__':
	print('''                     
 ___ _ _ _           
|  _|_| | |_ ___ ___ 
|  _| | |  _| -_|  _|
|_| |_|_|_| |___|_|

$ filter --help    for overview
''')

else:
	print ('<filter> as integrated module')

print('built 20230218 by error on line 1 (erroronline.one)')

DEFAULTJSON = {
	"defaultset": 0,
	"sets": [{
		"postProcessing": "do not forget to check an archive",
		"filesetting": {
			"source": "Export.+?\\.csv",
			"sourceformat": ["\\\"(.*?)\\\"", "(.+?)[;\\r\\n]"],
			"headerrowindex": 0,
			"destination": "filtered.csv",
			"enclose": ["before. DATE will be replaced", "after"],
			"columns": [
				"ORIGININDEX",
				"SOMEDATE",
				"CUSTOMERID",
				"NAME",
				"DEATH",
				"AID",
				"PRICE",
				"DELIVERED",
				"DEPARTMENT",
				"SOMEFILTERCOLUMN"
			]
		},
		"filter": [
			{
				"apply": "filter_by_expression",
				"comment": "keep if all general patterns match",
				"keep": True,
				"match": {
					"all": {
						"DELIEVERED": "delivered",
						"NAME": ".+?"
					}
				}
			},
			{
				"apply": "filter_by_expression",
				"comment": "discard if any general exclusions match",
				"keep": False,
				"match": {
					"any": {
						"DEATH": ".+?",
						"NAME": "company|special someone",
						"AID": "repair|cancelling|special.*?names"
					}
				}
			},
			{
				"apply": "filter_by_expression",
				"comment": "discard if value is below 400 unless pattern matches",
				"keep": False,
				"match": {
					"all": {
						"PRICE": "^[2-9]\\d\\D|^[1-3]\\d{2,2}\\D",
						"AID": "^(?!(?!.*(not|those)).*(but|these|surely)).*"
					}
				}
			},
			{
				"apply": "filter_by_monthdiff",
				"comment": "discard by date diff in months, do not contact if last event within x months",
				"keep": False,
				"date": {
					"column": "SOMEDATE",
					"format": ["d", "m", "y"],
					"threshold": 6,
					"bias": "<"
				}
			},
			{
				"apply": "filter_by_duplicates",
				"comment": "keep amount of duplicates of column value, ordered by another concatenated column values (asc/desc)",
				"keep": True,
				"duplicates": {
					"orderby": ["ORIGININDEX"],
					"descending": False,
					"column": "CUSTOMERID",
					"amount": 1
				}
			},
			{
				"apply": "filter_by_comparison_file",
				"comment": "discard or keep explicit excemptions as stated in excemption file, based on same identifier. source with absolute path or in the same working directory",
				"keep": False,
				"filesetting": {
					"source": "excemptions.*?.csv",
					"sourceformat": "(.+?)[;\\s]",
					"headerrowindex": 0,
					"columns": [
						"VORGANG"
					]
				},
				"filter": [],
				"match": {
					"all":{
						"ORIGININDEX": "COMPAREFILEINDEX"
					},
					"any":{
						"ORIGININDEX": "COMPAREFILEINDEX"
					}
				}
			},
			{
				"apply": "filter_by_monthinterval",
				"comment": "discard by not matching interval in months, optional offset from initial column value",
				"keep": False,
				"interval": {
					"column": "SOMEDATE",
					"format": ["d", "m", "y"],
					"interval": 6,
					"offset": 0
				}
			}
		],
		"modify":{
			"add":{
				"NEWCOLUMNNAME": "string",
				"ANOTHERCOLUMNNAME" : "string"
			},
			"replace":[
				["NAME", "regex", "replacement"],
				[None, ";", ","]
			],
			"remove": ["SOMEFILTERCOLUMN", "DEATH"],
			"rewrite":[
				{"Customer": ["CUSTOMERID", " separator ", "NAME"]}
			],
			"translate":{
				"DEPARTMENT": "departments"
			}
		},
		"split":{
			"DEPARTMENT": "(.*)",
			"DELIVERED": "(?:\\d\\d\.\d\d.)(\d+)"
		},
		"format":{
			"sheet": {
				"width": 125,
				"orientation": "landscape"
			},
			"columns":{
				"ORIGININDEX":5,
				"SOMEDATE":5,
				"CUSTOMERID":5,
				"NAME":10,
				"AID":15,
				"PRICE": None
			}
		},
		"evaluate": {
			"EMAIL": "^((?!@).)*$"
		}
	}],
	"translations":{
		"departments":{
			"1": "Central",
			"2": "Department 1",
			"3": "Department 2",
			"4": "Office"
		}
	}
}

helptext='''
[help]
    usage: filter  [ -h  | --help  ]  this message, priority handling
                   [ -s  | --set   ]  index of filter set overriding default declared in json-file
                   [ -m  | --month ]  MONTH-NUMBER 1-12
                   [ -y  | --year  ]  YEAR-NUMBER e.g. 2021
                   [ -t  | --track ]  COLUMN:VALUE1,VALUE2,... tracking values where filter was applied,
                                      COLUMN must be one of the set columns, values best be unique
                   [ -r  | --reset ]  creates a default setting file for customization if not existent

    filters and returns a csv case list according to setup.
    if a filterset uses date thresholds or date intervals and month or year are not manually set,
    the current date is processed.

    setup can either be specified in filter.json can be extended for other lists and filters and the specific
    filter-set set as default or passed as argument, or passed as dict if used as a module.
    filters and modifications are processed in order of appearance.
    modifications take place with the filtered list only for performance reasons.
    compare lists can be filtered and manipulated likewise. due to recursive implementation the origin list
    can be used as a filter by itself.

	"postProcessing": optional string as hint what to do with the result file
    "filesetting":
		"source": matching regex, opens last touched file
	    "sourceformat": matching regex to extract column titles, multiple options available
	    "headerrowindex": offset for title row
	    "destination": file to write output to
		"enclose": [before, after] optional in case of js-export, some strings to enclose the json-dump as a js-object
	    "columns": list/array of column names to process and export to destination

    "filter": list/array of objects/dicts
        "apply": "filter_by_expression"
		"comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "match":
            "all": all expressions have to be matched, object/dict with column-name-key, and pattern as value
            "any": at least one expression has to be matched, it's either "all" or "any"

        "apply": "filter_by_monthdiff"
        "comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "date": filter by identifier and date diff in months
            "identifier": column name with recurring values, e.g. customer id
            "column": column name with date to process,
            "format": list/array of date format order e.g. ["d", "m", "y"],
            "threshold": integer for months,
            "bias": < less than, > greater than threshold

        "apply": "filter_by_duplicates",
        "comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "duplicates": keep amount of duplicates of column value, ordered by another concatenated column values (asc/desc)
            "orderby": list/array of column names whose values concatenate for comparison
            "descending": boolean,
            "column": column name with recurring values, e.g. customer id of which duplicates are allowed
            "amount": integer > 0

        "apply": "filter_by_comparison_file",
        "comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "compare": keep or discard explicit excemptions as stated in excemption file, based on same identifier
            "filesetting": same structure as base. if source == "SELF" the origin file will be processed
                           sourceformat for headers may differ between "(.+?)[;\\s]" and "\\\"(.*?)\\\"", idk why
            "filter": same structure as base
            "modify": same structure as base
            "match":
                "all": dict with one or multiple "ORIGININDEX": "COMPAREFILEINDEX", kept if all match
                "any": dict with one or multiple "ORIGININDEX": "COMPAREFILEINDEX", kept if at least one matches

        "apply": "filter_by_monthinterval",
        "comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "interval": discard by not matching interval in months, optional offset from initial column value
            "column": column name with date to process,
            "format": list/array of date format order e.g. ["d", "m", "y"],
            "interval": integer for months,
            "offset": optional offset in months

    "modify": modifies the result
        "add": adds a column with the set value. if the name is already in use this will be replaced!
        "replace": replaces regex matches with the given value either at a specified field or in all
                   according to index 0 being a column name or none/null
        "remove": remove columns from result, may have been used solely for filtering
        "rewrite": adds newly named columns consisting of concatenated origin column values and separators.
                   original columns will be omitted, nested within a list to make sure to order as given
        "translate": column values to be translated according to specified translation object

    "split": split output by matched patterns of column values into multiple files (csv, js) or sheets (xlsx)

    "format: optional in case of xlsx-exports
        "sheet": global as width in points, orientation portrait or landscape by default
        "columns": dict of columns and their percentage portion 

    "evaluate": object/dict with colum-name keys and patterns as values that just create a warning, e.g. email verification

    translations can replace e.g. numerical values with legible translations.
    this is an object/dict whose keys can be refered to from the modifier. as translations may be reused they are
    outside of the filter sets scope. they are passed as "translations"-property to the rule-set.
    the dict keys are processed as regex for a possible broader use.
'''

RESULTSTRING = ''

def fprint(*args):
	# like print but adds to resultstring for external call 
	global RESULTSTRING
	msg = ''
	for a in args:
		msg += str( a )
	print(msg)
	RESULTSTRING += msg +'\n'
	if ASSISTANT:
		interface(msg + '<br />')

def reset(thisfilename):
	# create a default configuration file
	try:
		with open(thisfilename + '.json', 'x', newline = '', encoding = 'utf8') as file:
			json.dump(DEFAULTJSON, file, ensure_ascii = False, indent = 4)
		fprint('[*] default setting file ', thisfilename, '.json successfully written. please accommodate to your environment.\n')
	except:
		fprint('[~] ', thisfilename, '.json could not be written because it already existed. please contact devops.\n')

def sourcefile(regexPattern):
	# look for last touched source file that matches filter for source according to settings
	sourcefile = []
	directory = None
	if os.path.isfile(regexPattern): # aka distinct file with path is passed
		directory = os.path.split(regexPattern)[0]
		regexPattern = os.path.split(regexPattern)[1]
	if not directory:
		directory = os.getcwd()
	for entry in os.scandir( directory ):
		if os.path.isfile( os.path.join( directory, entry) ):
			if re.match( regexPattern, entry.name ):
				sourcefile.append( [ os.path.join( directory, entry), entry.stat().st_mtime ] )
	if len(sourcefile):
		sourcefile.sort( key = lambda time: time[1], reverse = True )
		return os.path.abspath(sourcefile[0][0])
	else:
		return False

def export(RESULT):
	destination = os.path.abspath(RESULT.setting['filesetting']['destination'])
	filetype = destination[destination.rindex('.'):].lower()
	try:
		if filetype == '.csv':
			filename, file_extension = os.path.splitext(destination)
			files = []
			for subset in RESULT.list:
				outputfile = filename + '_' + subset + file_extension if len(RESULT.list) > 1 else destination
				with open(outputfile, 'w', newline='') as csvfile:
					writer = csv.writer(csvfile, delimiter=';', quotechar='|', quoting=csv.QUOTE_MINIMAL)
					# add reduced header
					writer.writerow('"'+h+'"' for h in RESULT.setting['filesetting']['columns'])
					for row in RESULT.list[subset]:
						output = []
						for column in RESULT.setting['filesetting']['columns']:
							output.append(row[column])
						writer.writerow('"'+c+'"' for c in output)
				csvfile.close()
				files.append(outputfile)
			return ", ".join(files)

		if filetype == ".js":
			filename, file_extension = os.path.splitext(destination)
			files = []
			for subset in RESULT.list:
				outputfile = filename + '_' + subset + file_extension if len(RESULT.list) > 1 else destination
				jsonobj=[[column for column in RESULT.setting['filesetting']['columns']]]
				for row in RESULT.list[subset]:
					jsonobj.append([row[column] for column in RESULT.setting['filesetting']['columns']])
				with open(outputfile, 'w', newline = '', encoding = 'utf8') as jsfile:
					if "enclose" in RESULT.setting['filesetting']:
						jsfile.write(RESULT.setting['filesetting']['enclose'][0].replace('DATE', datetime.now().strftime('%Y-%m-%d')))
					json.dump(jsonobj, jsfile, ensure_ascii = False, indent = 4)
					if "enclose" in RESULT.setting['filesetting'] and len(RESULT.setting['filesetting']['enclose'])>1:
						jsfile.write(RESULT.setting['filesetting']['enclose'][1])
				files.append(outputfile)
			return ", ".join(files)

		elif filetype == '.xlsx':
			workbook = xlsxwriter.Workbook(destination)

			cell_std = workbook.add_format({'top': 1, 'num_format':'@', 'valign': 'top', 'text_wrap': True})
			# define other formats if necessary:
			cell_other = workbook.add_format({'top': 1, 'num_format':'@', 'valign': 'top', 'text_wrap': True})

			for subset in RESULT.list:
				worksheet = workbook.add_worksheet() # sheet[0:31])
				worksheet.set_landscape()
				if RESULT.setting.get('format') and RESULT.setting['format'].get('sheet'):
					orientation = RESULT.setting['format']['sheet'].get('orientation')
					if orientation == "portrait":
						worksheet.set_portrait()
				worksheet.set_margins(left = .25, right = .15, top = .5, bottom = .25)
				worksheet.set_default_row(32)
				worksheet.set_header(os.path.split(destination)[1] + ' - ' + (subset + ' - ' if isinstance(subset, str) else '') + datetime.now().strftime('%B %Y'))

				# set column widths and store column number for supported style properties
				xlcol = 0
				for column in RESULT.setting['filesetting']['columns']:
					if RESULT.setting.get('format') and RESULT.setting['format']['columns'].get(column) and RESULT.setting['format']['sheet']['width']:
						worksheet.set_column(xlcol, xlcol, RESULT.setting['format']['sheet']['width'] / 100 * RESULT.setting['format']['columns'][column])
					xlcol += 1
				xlrow=0
				xlcol=0
				# add sort key as header on sheet
				worksheet.write(xlrow, xlcol, subset)
				xlrow += 1

				# add headers + static
				header = [h for h in RESULT.setting['filesetting']['columns']]
				xlrow=0
				xlcol=0
				# add sort key as header on sheet
				for cell in header:
					worksheet.write(xlrow, xlcol, cell)
					xlcol +=1
				worksheet.repeat_rows(xlrow)

				# write content
				for row in RESULT.list[subset]:
					xlrow += 1
					xlcol = 0
					for cell in header:
						cell_format = cell_std
						worksheet.write(xlrow, xlcol, row[cell], cell_format)
						xlcol += 1

			workbook.close()
			return destination

		else:
			raise Exception(f'[~] filetype {filetype} not supported!')
	except Exception as e:
		fprint('[~] ', destination, ' could not be written probably because it was already opened or filetype is not supported.\n', traceback.format_exc())
	return False

def monthdelta(date, delta):
    m, y = (date.month + delta) % 12, date.year + ((date.month) + delta - 1) // 12
    if not m: m = 12
    d = min(date.day, calendar.monthrange(y, m)[1])
    return date.replace(day = d, month = m, year = y)
	
def monthdiff(first, last, format):
	# determine approximately difference of months
	fchunk, lchunk = re.findall( r'\d+', first ), re.findall( r'\d+', last )
	fdate, ldate = {}, {}
	i = 0
	for key in format:
		fdate[key], ldate[key] = int(fchunk[i]), int(lchunk[i])
		i += 1
	fdate['datetime'] = datetime(fdate['y'], fdate['m'], fdate['d'])
	ldate['datetime'] = datetime(ldate['y'], ldate['m'], ldate['d'])
	return round((ldate['datetime'] - fdate['datetime']).days / (365 / 12))

class listprocessor:
	def __init__(self, setting, argument = None, isChild = False):
		self.isChild = isChild
		self.argument = argument if argument else {'track': {'column': None, 'values': None}}
		self.setting = setting
		self.list = {}
		self.file = sourcefile(self.setting['filesetting']['source'])
		try:
			with open( self.file, newline='') as csvfile:
				self.log('[*] loading source file ', self.file, '...')
				#detect dialect, with quotes or without, idk, works well but not without
				dialect = csv.Sniffer().sniff(csvfile.readlines()[self.setting['filesetting']['headerrowindex']])
				# extract headers from first row to list, try different formats
				for sformat in self.setting['filesetting']['sourceformat']:
					# reset internal pointer
					csvfile.seek(0)
					self.headers = re.findall( sformat, csvfile.readlines()[self.setting['filesetting']['headerrowindex']] )
					if set(self.setting['filesetting']['columns']).intersection(self.headers) == set(self.setting['filesetting']['columns']):
						break
				# compare and proceed only if all columns from the settings exist and do fully match the list
				if not set(self.setting['filesetting']['columns']).intersection(self.headers) == set(self.setting['filesetting']['columns']):
					self.log('[~] not all necessary fields were found in sourcefile or header-format not processable! filter aborted! ', self.headers, self.setting['filesetting']['columns'])
					raise Exception('not all necessary fields were found in sourcefile or header-format not processable! filter aborted!')
				# reset internal pointer
				csvfile.seek(0)
				# csv.DictReader does not handle the structure of the given file thus needing a custom solution for use of fieldnames
				rows = csv.reader(csvfile, dialect)
				for i, row in enumerate(list(rows)[self.setting['filesetting']['headerrowindex'] + 1:]):
					l = {}
					for cell in zip(self.headers, row):
						# this cumbersome behaviour is necessary to certainly populate fields due to possible identical column names
						# this had me for some hours. who tf does shit like that?
						if not cell[0] in l or l[cell[0]] == '':
							l[cell[0]] = cell[1].strip()
					self.list[i] = l
			csvfile.close()
		except Exception as e:
			self.log('[~] source file ', self.file, ' could not be loaded or some filter error occured, filter not successful...\n', traceback.format_exc())
		if len(self.list):
			self.filter()

	def filter(self):
		self.log('[*] total rows: ', len(self.list))
		if 'track' in self.argument:
			if self.argument['track']['column'] and self.argument['track']['values']:
				self.log('[!] tracking ', self.argument['track']['values'], ' in column ', self.argument['track']['column'], '; you will be notified if deletion occurs')
			elif bool(self.argument['track']['column']) != bool(self.argument['track']['values']):
				self.log('[~] necessary tracking parameters incomplete')

		##############################################################################
		# apply filters
		##############################################################################
		if 'filter' in self.setting:
			for filter in self.setting['filter']:
				if 'comment' in filter:
					self.log('[*] applying filter: ', filter['apply'], ' ', filter['comment'], '...')
				
				try:
					getattr(self, filter['apply'])(filter)
					self.log('[*] remaining filtered: ', len(self.list))

				except Exception as e:
					self.log('[~] ', filter['apply'], ' does not exist and could not be applied!\n', traceback.format_exc())

		###########################################################################
		## modify the result list if applicable
		###########################################################################
		if 'modify' in self.setting:
			modifications = self.modify(self.setting['modify'])
			self.setting['filesetting']['columns'].extend(modifications['add'])
			for column in modifications['remove']:
				try:
					self.setting['filesetting']['columns'].remove(column)
				except Exception as e:
					pass
			self.log('[*] modifications done')

		###########################################################################
		## split list or at least elevate to n = 1 for output
		###########################################################################
		if not self.isChild:
			self.split(self.setting.get('split'))

		###########################################################################
		## export if applicable and generate warnings in case evaluations fail
		###########################################################################
		destination = False
		if 'destination' in self.setting['filesetting']:
			if len(self.list) > 1:
				destination = export(self)
			else:
				self.log('\n[!] nothing left to save :(')
		if destination:
			if 'evaluate' in self.setting:
				warning={}
				for subset in self.list:
					for row in self.list[subset]:
						for evaluation in self.setting['evaluate']:
							if row[evaluation] and re.match(self.setting['evaluate'][evaluation], row[evaluation]):
								if evaluation in warning:
									warning[evaluation] += 1
								else:
									warning[evaluation] = 1
					for key, value in warning.items():
						self.log('\n[!] WARNING: ', str(value), ' values of ', key, ' may be faulty, please revise in the output file ', destination)
			postProcessing = ''
			if 'postProcessing' in self.setting:
				postProcessing = self.setting['postProcessing']
			self.log('\n[*] done! ', postProcessing, ' ', destination)

	def log(self, *msg):
		if not self.isChild:
			fprint(*msg)

	def delete(self, key):
		deleted = self.list.pop(key, None)
		if deleted != None and not self.isChild and self.argument['track'] and self.argument['track']['column'] and self.argument['track']['values'] and self.argument['track']['column'] in deleted and deleted[self.argument['track']['column']] in self.argument['track']['values']:
			self.log('[!] tracked value ', deleted[self.argument['track']['column']], ' has been deleted ', self.argument['track']['cause'])

	def modify(self, modifications):
		###########################################################################
		# add column with fixed value or formula or replace regex pattern in existing column
		###########################################################################
		addedcolumns={'add':[], 'remove':[]}
		for modify in modifications:
			for rule in modifications[modify]:
				if modify == 'add':
					if not rule in addedcolumns['add']:
						addedcolumns['add'].append(rule)
					for row in self.list:
						self.list[row][rule] = modifications[modify][rule]
				if modify == 'replace':
					for row in self.list:
						for column in self.list[row]:
							if not rule[0] or rule[0] == column:
								self.list[row][column] = re.sub(rule[1], rule[2], self.list[row][column]).strip()
				if modify == 'remove' and not rule in addedcolumns['remove']:
					addedcolumns['remove'].append(rule)
				if modify == 'rewrite':
					for newColumn in rule:
						if not newColumn in addedcolumns['add']:
							addedcolumns['add'].append(newColumn)
						for row in self.list:
							concatenate = ''
							for column in rule[newColumn]:
								if column in self.list[row]:
									concatenate += self.list[row][column]
									if not column in addedcolumns['remove']:
										addedcolumns['remove'].append(column)
								else:
									concatenate += column
							self.list[row][newColumn] = concatenate
				if modify == 'translate' and self.setting.get('translations'):
					for row in self.list:
						for translation in self.setting['translations'][modifications[modify][rule]]:
							self.list[row][rule] = re.sub("^" + translation + "$", self.setting['translations'][modifications[modify][rule]][translation], self.list[row][rule]).strip()
		# unify passed columns
		addedcolumns={'add':addedcolumns['add'], 'remove':addedcolumns['remove']}
		return addedcolumns

	def split(self, rule = None):
		splitList = {}
		for row in self.list:
			if rule:
				# create sorting key by matched patterns, mandatory translated if applicable
				sorting = ''
				for sort in rule:
					match = re.findall(rule[sort], self.list[row][sort], re.IGNORECASE)
					if len(match):
						sorting += ' '.join(match)
				sorting = sorting.strip()
				if not sorting in splitList:
					splitList[sorting] = [self.list[row]]
				else:
					splitList[sorting].append(self.list[row])
			else:
				if not 1 in splitList:
					splitList[1] = [self.list[row]]
				else:
					splitList[1].append(self.list[row])
		self.list = splitList

	def filter_by_expression(self, rule):
		###########################################################################
		# keep or discard all entries where column values match regex pattern 
		###########################################################################
		rows = dict(self.list)
		for i in rows:
			keep = True
			self.argument['track']['cause'] = []
			if 'match' in rule:
				if 'any' in rule['match']:
					for column in rule['match']['any']:
						keep = not rule['keep']
						if bool(re.search(rule['match']['any'][column], rows[i][column], re.IGNORECASE|re.MULTILINE)):
							keep = rule['keep']
							self.argument['track']['cause'].append({'filtered':column, 'keep':keep})
							break
				elif 'all' in rule['match']:
					for column in rule['match']['all']:
						keep = rule['keep']
						if not bool(re.search(rule['match']['all'][column], rows[i][column], re.IGNORECASE|re.MULTILINE)):
							keep = not rule['keep']
							self.argument['track']['cause'].append({'filtered':column, 'keep':keep})
							break
			if not keep:
				self.delete(i)

	def filter_by_monthdiff(self, rule):
		###########################################################################
		# keep or discard all entries if 'column' meets 'bias' for 'threshold'
		###########################################################################
		dateFormat = rule['date']['format']
		rows = dict(self.list)
		for i in rows:
			entrydate = re.findall(r'\d+', rows[i][rule['date']['column']])
			if len(entrydate) < 1:
				continue
			# create dictionary according to set format
			edate = {}
			for j, key in enumerate(dateFormat):
				edate[key] = entrydate[j]
			timespan = monthdiff('01.' + str(edate['m']) + '.' + str(edate['y']), '01.' + self.argument['processedMonth'] + '.' + self.argument['processedYear'], dateFormat)
			filtermatch = (rule['date']['bias'] == '<' and timespan <= rule['date']['threshold']) or (rule['date']['bias'] == '>' and timespan >= rule['date']['threshold'])
			if (filtermatch and not rule['keep']) or (not filtermatch and rule['keep']):
				self.delete(i)
	
	def filter_by_monthinterval(self, rule):
		###########################################################################
		# keep or discard if 'column'-value -+ 'offset' matches 'interval' from current or cli-set date
		###########################################################################
		dateFormat = rule['interval']['format']
		rows = dict(self.list)
		edate = {}
		for i in rows:
			entrydate = re.findall(r'\d+', rows[i][rule['interval']['column']])
			if len(entrydate) < 1:
				continue
			for j, key in enumerate(dateFormat):
				edate[key]=entrydate[j]
			offset_edate = monthdelta(datetime(int(edate['y']), int(edate['m']), 1), rule['interval']['offset'])
			timespan = monthdiff('01.' + str(offset_edate.month) + '.' + str(offset_edate.year), '01.' + self.argument['processedMonth'] + '.' + self.argument['processedYear'], dateFormat)
			filtermatch = timespan % rule['interval']['interval']
			if (filtermatch and not rule['keep']) or (not filtermatch and rule['keep']):
				self.delete(i)
	
	def filter_by_comparison_file(self, rule):
		###########################################################################
		## discard or keep explicit excemptions as stated in excemption file, based on same identifier.
		###########################################################################
		if rule['filesetting']['source'] == 'SELF':
			rule['filesetting']['source'] = self.setting['filesetting']['source']
		rule['translations'] = self.setting['translations']
		fprint('[*] comparing with ', rule['filesetting']['source'])
		COMPARE = listprocessor(rule, {'track': {'column': None, 'values': None}, 'processedMonth': self.argument['processedMonth'], 'processedYear': self.argument['processedYear']}, True)
		selfRows = dict(self.list)
		cmpRows = dict(COMPARE.list)
		equals = set()
		for anyOrAll in rule['match']:
			compareColumns = rule['match'][anyOrAll]
			# prepare possibly needed amount of matches
			correspond = [False for i in range(len(compareColumns))]
			# fill false-prepared match-items with values
			for i in selfRows:
				for j in cmpRows:
					corresponded = 0
					#iterate over matches
					for column in compareColumns:
						correspond[corresponded] = selfRows[i][column] == cmpRows[j][compareColumns[column]]
						if anyOrAll == 'any':
							break
						corresponded += 1
					if (anyOrAll == 'any' and True in correspond) or (anyOrAll == 'all' and all(correspond)):
						equals.add(i)
		for i in selfRows:
			if (i in equals) != rule['keep']:
				self.argument['track']['cause'] = {'identified by': i , 'corresponding values do not match: ': i}
				self.delete(i)

	def filter_by_duplicates(self, rule):
		###########################################################################
		## keep amount of duplicates of concatenated column(s) value(s), ordered by another column (asc/desc)
		###########################################################################
		duplicates = {}
		rows = dict(self.list)
		for i in rows:
			identifier = rows[i][rule['duplicates']['column']]
			if not identifier in duplicates:
				duplicates[identifier] = [[''.join([rows[i][v] for v in rule['duplicates']['orderby']]), i]]
			else:
				duplicates[identifier].append([''.join([rows[i][v] for v in rule['duplicates']['orderby']]), i])
		for i in duplicates:
			duplicates[i].sort(key=lambda x:x[0], reverse = rule['duplicates']['descending'])
			self.argument['track']['cause'] = {'identified by': i , 'duplicate values for column': duplicates[i]}
			for j, k in enumerate(duplicates[i]):
				if j < rule['duplicates']['amount']:
					self.argument['track']['cause']['kept'] = duplicates[i][j]
					pass
				else:
					self.delete(k[1])
	

def filter(setting, argument = None):
	global RESULTSTRING
	RESULTSTRING = ''

	listprocessor(setting, argument)

	return RESULTSTRING


if __name__ == '__main__':
	selectedset = False
	processedMonth = str(datetime.today().month)
	processedYear = str(datetime.today().year)
	lhelp = False
	track = {'column': None, 'values': None}

	# load settings
	thisfilename = sys.argv[0].split('.')[0]

	# load settings
	try:
		with open(thisfilename + '.json', 'r') as jsonfile:
			SETTINGS = json.loads(jsonfile.read().replace('\n', ''))
	except Exception as e:
		fprint('[~] settings could not be loaded, see help for syntax...\n', traceback.format_exc())
		SETTINGS = False
		
	# argument handler	
	# options actually ordered by importance
	sys.argv.pop(0)
	options = {
		'r': '--reset|-r',
		'h': '--help|-h',
		's': '((?:--set|-s)[:\\s]+)(\\d+)',
		'm': '((?:--month|-m)[:\\s]+)(\\d+)',
		'y': '((?:--year|-y)[:\\s]+)(\\d+)',
		't': '((?:--track|-t)[:\\s]+)(\\S+)'}
	params = ' '.join(sys.argv) + ' '
	for opt in options:
		arg = re.findall(options[opt], params, re.IGNORECASE)
		if opt == 'r' and arg:
			reset(thisfilename)
			sys.exit()
		elif (opt == 'h' and arg) or not SETTINGS:
			fprint(helptext)
			sys.exit()
		elif opt == 's' and bool(arg):
			selectedset = str(arg[0][1])
			params=params.replace(''.join(arg[0]), '')
		elif opt == 'm' and bool(arg):
			processedMonth = str(arg[0][1])
			params=params.replace(''.join(arg[0]), '')
		elif opt == 'y' and bool(arg):
			processedYear = str(arg[0][1])
			params=params.replace(''.join(arg[0]), '')
		elif opt == 't' and bool(arg):
			trackparam = str(arg[0][1]).split(':')
			track['column'] = trackparam[0]
			track['values'] = trackparam[1].split(',')
			params=params.replace(''.join(arg[0]), '')
		else:
			pass

	arguments={
		'processedMonth': processedMonth,
		'processedYear': processedYear,
		'track': track
	}

	if not selectedset:
		selectedset = SETTINGS['defaultset']
	ini = SETTINGS['sets'][int(selectedset)]
	ini['translations'] = SETTINGS.get('translations')

	file = sourcefile(ini['filesetting']['source'])
	if not file:
		input('[~] sourcefile named like ' + ini['filesetting']['source'] + '-something not found, program aborted... press enter to exit program.')
		sys.exit()

	filter(ini, arguments)

	input('[?] press enter to quit program...')
	sys.exit()