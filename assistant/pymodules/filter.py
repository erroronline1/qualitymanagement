import csv
import json
import re
from datetime import datetime
import calendar
import time
import threading
import sys
import os
import itertools
import traceback

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

print('built 20221217 by error on line 1 (erroronline.one)')

DEFAULTJSON = {
	"defaultset": 0,
	"sets": [{
		"source": "Export.+?\\.csv",
		"sourceformat": "\\\"(.*?)\\\"",
		"headerrowindex": 0,
		"destination": "filtered.csv",
		"columns": [
			"ORIGININDEX",
			"SOMEDATE",
			"CUSTOMERID",
			"NAME",
			"DEATH",
			"AID",
			"PRICE",
			"DELIVERED",
		],
		"filter": [{
				"comment": "keep if all general patterns match",
				"keep": True,
				"patterns": {
					"all": {
						"DELIEVERED": "delivered",
						"NAME": ".+?"
					}
				}
			},
			{
				"comment": "discard if any general exclusions match",
				"keep": False,
				"patterns": {
					"any": {
						"DEATH": ".+?",
						"NAME": "company|special someone",
						"AID": "repair|cancelling|special.*?names"
					}
				}
			},
			{
				"comment": "discard if value is below 400 unless pattern matches",
				"keep": False,
				"patterns": {
					"all": {
						"PRICE": "^[2-9]\\d\\D|^[1-3]\\d{2,2}\\D",
						"AID": "^(?!(?!.*(not|those)).*(but|these|surely)).*"
					}
				}
			}
		],
		"concentrate": [{
				"comment": "discard by identifier and date diff in months, do not contact if last event within x months",
				"keep": False,
				"date": {
					"identifier": "CUSTOMERID",
					"column": "SOMEDATE",
					"format": ["d", "m", "y"],
					"threshold": 6,
					"bias": "<"
				}
			},
			{
				"comment": "keep amount of duplicates of concatenated column(s) value(s), ordered by another column (asc/desc)",
				"keep": True,
				"duplicates": {
					"orderby": ["ORIGININDEX"],
					"descending": False,
					"column": "CUSTOMERID",
					"amount": 1
				}
			},
			{
				"comment": "discard explicit excemptions as stated in excemption file, based on same identifier. source with absolute path or in the same working directory",
				"keep": False,
				"compare": {
					"source": "excemptions.*?.csv",
					"sourceformat": "(.+?)[;\\s]",
					"headerrowindex": 0,
					"patterns": {
						"COMPAREFILEINDEX": {
							"correspond": "ORIGININDEX"
						},
						"COMPAREFILEDELIVERED": {
							"match": "^delivered"
						}
					}
				}
			},
			{
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
		"evaluate": {
			"EMAIL": "^((?!@).)*$"
		}
	}]
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

    setup is specified in filter.json and can be extended for other lists and filters

    "source": matching regex, opens last touched file
    "sourceformat": matching regex to extract column titles
    "headerrowindex": offset for title row
    "destination": file to write output to
    "columns": list/array of column names to process and export to destination
    "filter": list/array of objects/dicts
        "comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "patterns":
            "all": all expressions have to be matched, object/dict with column-name-key, and pattern as value
            "any": at least one expression has to be matched, it's either "all" or "any"
    "concentrate": list/array of object/dicts
        "comment": description, will be displayed
        "keep": boolean if matches are kept or omitted
        "date": filter by identifier and date diff in months
            "identifier": column name with recurring values, e.g. customer id
            "column": column name with date to process,
            "format": list/array of date format order e.g. ["d", "m", "y"],
            "threshold": integer for months,
            "bias": < less than, > greater than threshold
        "duplicates": keep amount of duplicates of concatenated column(s) value(s), ordered by another column (asc/desc)
            "orderby": list/array of column names whose values concatenate for comparison
            "descending": boolean,
            "column": column name with recurring values, e.g. customer id of which duplicates are allowed
            "amount": integer > 0
        "compare": discard explicit excemptions as stated in excemption file, based on same identifier
            "source": matching regex, opens last touched file
            "sourceformat": matching regex to extract column titles
            "headerrowindex": offset for title row
                "patterns": object/dict of column names of comparation-file that again contain an object/dict
                    "correspond": column name of original file whose values should match
                    "match": pattern for filtering
        "interval": discard by not matching interval in months, optional offset from initial column value
            "column": column name with date to process,
            "format": list/array of date format order e.g. ["d", "m", "y"],
            "interval": integer for months,
            "offset": optional offset in months
    "evaluate": object/dict with colum-name keys and patterns as values that just create a warning, e.g. email verification
'''

STOPANIMATION = True
RESULTSTRING = ''

def animationbar():
    for c in itertools.cycle( ['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .'] ):
        if STOPANIMATION:
            break
        sys.stdout.write( '\r' + c )
        sys.stdout.flush()
        time.sleep(0.1)
        sys.stdout.write('\r')

def fprint(*args):
	global RESULTSTRING
	# like print but flushes loading bar animation beforehand
	sys.stdout.flush()
	msg = ''
	for a in args:
		msg += str( a )
	sys.stdout.write( '\r' + msg +'\n' )
	RESULTSTRING += msg +'\n'

def reset(thisfilename):
	# create a default configuration file
	try:
		with open(thisfilename + '.json', 'x', newline = '', encoding = 'utf8') as file:
			json.dump(DEFAULTJSON, file, ensure_ascii = False, indent = 4)
		fprint('[*]  default setting file ' + thisfilename + '.json successfully written. please accommodate to your environment.\n')
	except:
		fprint('[~]  ' + thisfilename + '.json could not be written because it already existed. please contact devops.\n')

def sourcefile(regex):
	# look for last touched source file that matches filter for source according to settings
	sourcefile = []
	directory = os.getcwd()
	if '/' in regex: # aka distinct file with path is passed
		directory = os.path.split(regex)[0]
		regex = os.path.split(regex)[1]
	for entry in os.scandir( directory ):
		if os.path.isfile( os.path.join( directory, entry) ):
			if re.match( regex, entry.name ):
				sourcefile.append( [ os.path.join( directory, entry), entry.stat().st_mtime ] )
	if len(sourcefile):
		sourcefile.sort( key=lambda time: time[1], reverse=True )
		return sourcefile[0][0]
	else:
		return False

def monthdelta(date, delta):
    m, y = (date.month + delta) % 12, date.year + ((date.month) + delta - 1) // 12
    if not m: m = 12
    d = min(date.day, calendar.monthrange(y, m)[1])
    return date.replace(day = d, month = m, year = y)
	
def monthdiff(first,last,format):
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

class resulthandler:
	def __init__(self, headers, rows, setting):
		self.list={}
		for i, row in enumerate(list(rows)[setting['headerrowindex']+1:]):
			l={}
			for cell in zip(headers, row):
				# this cumbersome behaviour is necessary to certainly populate fields due to possible identical column names
				# this had me for some hours. who tf does shit like that?
				if not cell[0] in l or l[cell[0]] == '':
					l[cell[0]] = cell[1].strip()
			self.list[i] = l
	def delete(self, key, track=None):
		deleted = self.list.pop(key, None)
		if deleted != None and track and track['column'] and track['values'] and track['column'] in deleted and deleted[track['column']] in track['values']:
			fprint('[!] tracked value ', deleted[track['column']], ' has been deleted ', track['cause'])
	def looplist(self):
		return dict(self.list)

def filter(setting, argument):
	global RESULTSTRING
	RESULTSTRING = ''

	sfile = sourcefile(setting['source'])
	try:
		with open( sfile, newline='' ) as csvfile:
			STOPANIMATION = False
			animation = threading.Thread( target = animationbar )
			animation.daemon = True
			animation.start()

			fprint('[*] loading source file ' + sfile + '...')

			# extract headers from first row to list
			headers=re.findall( setting['sourceformat'], csvfile.readlines()[setting['headerrowindex']] )

			# compare and proceed only if all columns from the settings exist and do fully match the list
			if not set(setting['columns']).intersection(headers) == set(setting['columns']):
				fprint('[~] not all necessary fields were found in sourcefile or header-format not processable! filter aborted! ', headers)
				STOPANIMATION = True
				raise Exception("not all necessary fields were found in sourcefile or header-format not processable! filter aborted!")

			# reset internal pointer
			csvfile.seek(0)
			# csv.DictReader does not handle the structure of the given file thus needing a custom solution for use of fieldnames
			rows = csv.reader(csvfile, delimiter=';')
			# iterate over rows, strip whitespaces, assign headers as keys to values and row-index as key to global result
			RESULT = resulthandler(headers, rows, setting)
		csvfile.close()

		fprint('[*] total rows: ', len(RESULT.list))
		if argument['track']['column'] and argument['track']['values']:
			fprint('[!] tracking ', argument['track']['values'], ' in column ', argument['track']['column'], '; you will be notified if deletion occurs')
		elif bool(argument['track']['column']) != bool(argument['track']['values']):
			fprint('[~] necessary tracking parameters incomplete')

		##############################################################################
		# apply filters by regular expressions
		##############################################################################
		if 'filter' in setting:
			for filter in setting['filter']:
				if 'comment' in filter:
					fprint('[*] applying filter: ' + filter['comment'] + '...')
				rows = RESULT.looplist()
				for i in rows:
					keep = True
					argument['track']['cause'] = []
					if 'patterns' in filter:
						if 'any' in filter['patterns']:
							for f in filter['patterns']['any']:
								if bool(re.search(filter['patterns']['any'][f], rows[i][f], re.IGNORECASE|re.MULTILINE)):
									keep = filter['keep']
									argument['track']['cause'].append({'filtered':f, 'keep':keep})
									break
								else:
									keep = not filter['keep']
									argument['track']['cause'].append({'filtered':f, 'keep':keep})
						elif 'all' in filter['patterns']:
							for f in filter['patterns']['all']:
								if bool(re.search(filter['patterns']['all'][f], rows[i][f], re.IGNORECASE|re.MULTILINE)):
									keep = filter['keep']
									argument['track']['cause'].append({'filtered':f, 'keep':keep})
								else:
									keep = not filter['keep']
									argument['track']['cause'].append({'filtered':f, 'keep':keep})
									break
					if not keep:
						RESULT.delete(i, argument['track'])
			fprint('[*] remaining filtered: ', str(len(RESULT.list)))
		###########################################################################
		## now as you've got all entries that passed the regular expression filters
		## let's occasionally concentrate and summarize
		###########################################################################
		if 'concentrate' in setting:
			for concentrate in setting['concentrate']:
				argument['track']['cause'] = ''
				if 'comment' in concentrate:
					fprint('[*] applying concentration: ' + concentrate['comment'] + '...')
				if 'date' in concentrate:
					# 'keep' all entries with same 'identifier' if any 'column' meets 'bias' for 'threshold'
					dateFormat = concentrate['date']['format']
					rows = RESULT.looplist()
					for i in rows:
						entrydate = re.findall(r'\d+', rows[i][concentrate['date']['column']])
						if len(entrydate) < 1:
							continue
						# create dictionary according to set format
						edate = {}
						for j, key in enumerate(dateFormat):
							edate[key] = entrydate[j]
						timespan = monthdiff('01.' + str(edate['m']) + '.' + str(edate['y']), '01.' + argument['processedMonth'] + '.' + argument['processedYear'], dateFormat)
						filtermatch = (concentrate['date']['bias'] == "<" and timespan <= concentrate['date']['threshold']) or (concentrate['date']['bias'] == ">" and timespan >= concentrate['date']['threshold'])
						if (filtermatch and not concentrate['keep']) or (not filtermatch and concentrate['keep']):
							RESULT.delete(i, argument['track'])
				elif 'duplicates' in concentrate:
					duplicates = {}
					rows = RESULT.looplist()
					for i in rows:
						identifier = rows[i][concentrate['duplicates']['column']]
						if not identifier in duplicates:
							duplicates[identifier] = [[''.join([rows[i][v] for v in concentrate['duplicates']['orderby']]), i]]
						else:
							duplicates[identifier].append([''.join([rows[i][v] for v in concentrate['duplicates']['orderby']]), i])
					for i in duplicates:
						duplicates[i].sort(key=lambda x:x[0], reverse = concentrate['duplicates']['descending'])
						argument['track']['cause'] = {'identified by': i , 'duplicate values for column': duplicates[i]}
						for j, k in enumerate(duplicates[i]):
							if j < concentrate['duplicates']['amount']:
								argument['track']['cause']['kept'] = duplicates[i][j]
							else:
								RESULT.delete(k[1], argument['track'])
				elif 'compare' in concentrate:
					# 'keep' all entries that match mith 'src'
					# column-name boolean compares value
					# column-name string matches pattern
					try:
						directory = os.getcwd()
						filename = concentrate['compare']['source'] 
						if '/' in sfile: # aka distinct file with path is passed
							directory = os.path.split(sfile)[0]
						if '/' in concentrate['compare']['source']:
							directory = os.path.split(concentrate['compare']['source'])[0]
							filename = os.path.split(concentrate['compare']['source'])[1]
						concentrate['compare']['source'] = os.path.join(directory, filename)

						file = sourcefile(concentrate['compare']['source'])
						fprint('[*] comparing with: ' + file + '...')
						with open(file, newline='') as csvfile2:
							# same approach like the above
							headers2 = re.findall(concentrate['compare']['sourceformat'], csvfile2.readlines()[concentrate['compare']['headerrowindex']])
							csvfile2.seek(0)
							rows2 = csv.reader(csvfile2, delimiter=';')
							COMPARE = resulthandler(headers2, rows2, setting)
						csvfile2.close()
						rows2 = COMPARE.looplist()
						# sanitize compare list 
						for i in rows2:
							cp = concentrate['compare']['patterns']
							for f in cp:
								if 'match' in cp[f]:
									if not bool(re.search(cp[f]['match'], rows2[i][f], re.IGNORECASE|re.MULTILINE)):
										COMPARE.delete(i, argument['track'])
						# compare both lists for boolean comparison
						rows = RESULT.looplist()
						rows2 = COMPARE.looplist()
						corresponding = set()
						for j in rows2:
							for i in rows:
								cp = concentrate['compare']['patterns']
								for f in cp:
									if 'correspond' in cp[f]:
										if rows[i][cp[f]['correspond']] == rows2[j][f]:
											corresponding.add(i)
						for i in rows:
							if (i in corresponding) != concentrate['keep']:
								RESULT.delete(i, argument['track'])
					except Exception as e:
						# in case file does not exist
						fprint('[~] comparison file not processable.\n' + traceback.format_exc())
				elif 'interval' in concentrate:
					# 'keep' if 'column'-value -+ 'offset' matches 'interval' from current or cli-set date
					dateFormat = concentrate['interval']['format']
					rows = RESULT.looplist()
					for i in rows:
						entrydate = re.findall(r'\d+', rows[i][concentrate['interval']['column']])
						if len(entrydate) < 1:
							continue
						for j, key in enumerate(dateFormat):
							edate[key]=entrydate[j]
						offset_edate = monthdelta(datetime(int(edate['y']), int(edate['m']), 1), concentrate['interval']['offset'])
						timespan = monthdiff('01.' + str(offset_edate.month) + '.' + str(offset_edate.year), '01.' + argument['processedMonth'] + '.' + argument['processedYear'], dateFormat)
						filtermatch = timespan % concentrate['interval']['interval']
						if (filtermatch and not concentrate['keep']) or (not filtermatch and concentrate['keep']):
							RESULT.delete(i, argument['track'])
			fprint('[*] after concentrate: ', len(RESULT.list))

		# write filtered list to destination file
		try:

			destination=os.path.join(os.path.split(os.path.abspath(sfile))[0], setting['destination']);
			with open(destination, 'w', newline='') as csvfile:
				writer = csv.writer(csvfile, delimiter=';', quotechar='|', quoting=csv.QUOTE_MINIMAL)
				# add reduced header
				writer.writerow('"'+h+'"' for h in setting['columns'])
				for row in RESULT.list:
					output = []
					for reduce in setting['columns']:
						output.append(RESULT.list[row][reduce])
					writer.writerow('"'+c+'"' for c in output)
			csvfile.close()
		except Exception as e:
			fprint('[~] ' + destination + ' could not be written probably because it was already opened.\n' + traceback.format_exc())


		# generate warnings in case evaluations fail
		if 'evaluate' in setting:
			warning={}
			for row in RESULT.list:
				for evaluation in setting['evaluate']:
					if RESULT.list[row][evaluation] and re.match(setting['evaluate'][evaluation], RESULT.list[row][evaluation]):
						if evaluation in warning:
							warning[evaluation] += 1
						else:
							warning[evaluation] = 1
			for key, value in warning.items():
				fprint('\n[!] WARNING: ' + str(value) + ' values of ' + key + ' may be faulty, please revise in the output file ' + destination)
		fprint('\n[*] done! do not forget to archive ' + destination)

	except Exception as e:
		fprint('[~] source file ', sfile, ' could not be loaded or some filter error occured, filter not successful...\n' + traceback.format_exc())

	STOPANIMATION = True
	return RESULTSTRING

if __name__ == '__main__':
	selectedset = False
	processedMonth = str(datetime.today().month)
	processedYear = str(datetime.today().year)
	lhelp = False
	track = {"column": None, "values": None}

	# load settings
	thisfilename = sys.argv[0].split('.')[0]

	# load settings
	try:
		with open(thisfilename + '.json', 'r') as jsonfile:
			SETTINGS = json.loads(jsonfile.read().replace('\n', ''))
	except Exception as e:
		fprint('[~] settings could not be loaded, see help for syntax...\n'+ traceback.format_exc())
		SETTINGS = False
		
	# argument handler	
	# options actually ordered by importance
	sys.argv.pop(0)
	options = {'r':'--reset|-r',
		'h':'--help|-h',
		's':'((?:--set|-s)[:\\s]+)(\\d+)',
		'm':'((?:--month|-m)[:\\s]+)(\\d+)',
		'y':'((?:--year|-y)[:\\s]+)(\\d+)',
		't':'((?:--track|-t)[:\\s]+)(\\S+)'}
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

	file = sourcefile(ini['source'])
	if not file:
		input('[~] sourcefile named like ' + ini['source'] + '-something not found, program aborted... press enter to exit program.')
		sys.exit()

	filter(ini, arguments)

	input('[?] press enter to quit program...')
	sys.exit()