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

print ('''                     
 ___ _ _ _           
|  _|_| | |_ ___ ___ 
|  _| | |  _| -_|  _|
|_| |_|_|_| |___|_|   built 20210801

by error on line 1 (erroronline.one)

$ filter --help    for overview
''')

DEFAULTJSON = {
	"defaultset": 0,
	"sets": [{
		"source": "Export.+?\\.csv",
		"sourceformat": "\\\"(.*?)\\\"",
		"headerrowindex": 0,
		"destination": "filtered.csv",
		"columns": [
			"INDEX",
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
					"orderby": ["INDEX"],
					"descending": False,
					"column": "CUSTOMERID",
					"amount": 1
				}
			},
			{
				"comment": "discard explicit excemptions as stated in excemption file, based on same identifier",
				"keep": False,
				"excemption": {
					"column": "INDEX",
					"src": "EXCEMPTION.csv",
					"format": "(.+?)[;\\s]"
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
                   [ -t  | --track ]  COLUMN:VALUE1;VALUE2;... tracking values where filter was applied,
                                      COLUMN must be one of the set columns, values best be unique
                   [ -r  | --reset ]  creates a default setting file for customization if not existent

    filters and returns a csv case list according to filter.json setup.
    if a filterset uses date thresholds or date intervals and month or year are not manually set,
	the current date is processed.

    setup is specified in stocklist.json as following and can be extended for other lists and filters:
''' + json.dumps(DEFAULTJSON, indent=4)

def animationbar():
    for c in itertools.cycle( ['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .'] ):
        if stopanimation:
            break
        sys.stdout.write( '\r' + c )
        sys.stdout.flush()
        time.sleep(0.1)
        sys.stdout.write('\r')

def fprint(*args):
	# like print but flushes loading bar animation beforehand
	sys.stdout.flush()
	msg = ''
	for a in args:
		msg += str( a )
	sys.stdout.write( '\r' + msg +'\n' )

def reset(thisfilename):
	# create a default configuration file
	try:
		with open(thisfilename + '.json', 'x', newline = '', encoding = 'utf8') as file:
			json.dump(DEFAULTJSON, file, ensure_ascii = False, indent = 4)
		fprint('[*]  default setting file ' + thisfilename + '.json successfully written. please accommodate to your environment.\n')
	except:
		fprint('[~]  ' + thisfilename + '.json could not be written because it already existed. please contact devops.\n')

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
	def __init__(self, headers, rows):
		self.list={}
		for i, row in enumerate(list(rows)[ini['headerrowindex']+1:]):
			l={}
			for cell in zip(headers, row):
				# this cumbersome behaviour is necessary to certainly populate fields due to possible identical column names
				# this had me for some hours. who tf does shit like that?
				if not cell[0] in l or l[cell[0]] == '':
					l[cell[0]] = cell[1].strip()
			self.list[i] = l
	def delete(self, key, track=None):
		if track and track['column'] and track['values'] and self.list[key][track['column']] in track['values']:
			fprint('[!] tracked value ', self.list[key][track['column']], ' has been deleted ', track['cause'])
		self.list.pop(key, None)
	def looplist(self):
		return dict(self.list)

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
			track['values'] = trackparam[1].split(';')
			params=params.replace(''.join(arg[0]), '')
		else:
			pass

	if not selectedset:
		selectedset = SETTINGS['defaultset']
	ini = SETTINGS['sets'][int(selectedset)]

	# look for last touched source file that matches filter for source according to settings
	sourcefile = []
	for entry in os.scandir( os.getcwd() ):
		if os.path.isfile( os.path.join( os.getcwd(), entry) ):
			if re.match( ini['source'], entry.name ):
				sourcefile.append( [ entry.name, entry.stat().st_mtime ] )
	if len(sourcefile):
		sourcefile.sort( key=lambda time: time[1], reverse=True )
	else:
		input('[~] sourcefile named like ' + ini['source'] + '-something not found, program aborted... press enter to exit program.')
		sys.exit()

	try:
		with open( sourcefile[0][0], newline='' ) as csvfile:
			stopanimation = False
			animation = threading.Thread( target = animationbar )
			animation.daemon = True
			animation.start()

			fprint('[*] loading source file ' + sourcefile[0][0] + '...')

			# extract headers from first row to list
			headers=re.findall( ini['sourceformat'], csvfile.readlines()[ini['headerrowindex']] )

			# compare and proceed only if all columns from the settings exist and do fully match the list
			if not set(ini['columns']).intersection(headers) == set(ini['columns']):
				fprint('[~] not all necessary fields were found in sourcefile or header-format not processable! filter aborted! ', headers)
				stopanimation = True
				input('press enter to exit.')
				sys.exit()

			# reset internal pointer
			csvfile.seek(0)
			# csv.DictReader does not handle the structure of the given file thus needing a custom solution for use of fieldnames
			rows = csv.reader(csvfile, delimiter=';')
			# iterate over rows, strip whitespaces, assign headers as keys to values and row-index as key to global result
			RESULT = resulthandler(headers, rows)

			fprint('[*] total rows: ', len(RESULT.list))
			if track['column'] and track['values']:
				fprint('[!] tracking ', track['values'], ' in column ', track['column'], '; you will be notified if deletion occurs')
			elif bool(track['column']) != bool(track['values']):
				fprint('[~] necessary tracking parameters incomplete')

			##############################################################################
			# apply filters by regular expressions
			##############################################################################
			if 'filter' in ini:
				for filter in ini['filter']:
					if 'comment' in filter:
						fprint('[*] applying filter: ' + filter['comment'] + '...')
					rows = RESULT.looplist()
					for i in rows:
						keep = True
						track['cause'] = []
						if 'patterns' in filter:
							if 'any' in filter['patterns']:
								for f in filter['patterns']['any']:
									if bool(re.search(filter['patterns']['any'][f], rows[i][f], re.IGNORECASE)):
										keep = filter['keep']
										track['cause'].append({'filtered':f,'keep':keep})
										break
									else:
										keep = not filter['keep']
										track['cause'].append({'filtered':f,'keep':keep})
							elif 'all' in filter['patterns']:
								for f in filter['patterns']['all']:
									if bool(re.search(filter['patterns']['all'][f], rows[i][f], re.IGNORECASE)):
										keep = filter['keep']
										track['cause'].append({'filtered':f,'keep':keep})
									else:
										keep = not filter['keep']
										track['cause'].append({'filtered':f,'keep':keep})
										break
						if not keep:
							RESULT.delete(i, track)
				fprint('[*] remaining filtered: ', str(len(RESULT.list)))
			###########################################################################
			## now as you've got all entries that passed the regular expression filters
			## let's occasionally concentrate and summarize
			###########################################################################
			if 'concentrate' in ini:
				for concentrate in ini['concentrate']:
					track['cause'] = ''
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
							timespan = monthdiff('01.' + str(edate['m']) + '.' + str(edate['y']), '01.' + processedMonth + '.' + processedYear, dateFormat)
							if (concentrate['date']['bias'] == "<" and timespan <= concentrate['date']['threshold']) or (concentrate['date']['bias'] == ">" and timespan >= concentrate['date']['threshold']) and concentrate['keep'] == False:
								RESULT.delete(i, track)
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
							track['cause'] = {'identified by': i , 'duplicate values for column': duplicates[i]}
							for j, k in enumerate(duplicates[i]):
								if j < concentrate['duplicates']['amount']:
									track['cause']['kept'] = duplicates[i][j]
								else:
									RESULT.delete(k[1], track)
					elif 'excemption' in concentrate:
						# 'keep' all entries with same 'column'-value as in 'src'
						try:
							excemptions = set()
						except:
							excemptions.clear()
						try:
							with open(concentrate['excemption']['src'], newline='') as csvfile2:
								# extract headers from first row to list
								headers2 = re.findall(concentrate['excemption']['format'], csvfile2.readlines()[0])
								# reset internal pointer
								csvfile2.seek(0)
								rows2 = csv.reader(csvfile2, delimiter=';')
								header = True # first line is header and has to be ignored for excemptions being an unorderes set
								for row2 in rows2:
									if header:
										header = False
										continue
									excemptions.add(row2[headers2.index(concentrate['excemption']['column'])])
							csvfile2.close()
						except Exception as e:
							# in case file does not exist
							fprint('[~] excemption file not processable.\n' + traceback.format_exc())
						rows = RESULT.looplist()
						for i in rows:
							if rows[i][concentrate['excemption']['column']] in excemptions :
								RESULT.delete(i, track)
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
							timespan = monthdiff('01.' + str(offset_edate.month) + '.' + str(offset_edate.year), '01.' + processedMonth + '.' + processedYear, dateFormat)
							if timespan % concentrate['interval']['interval']:
								RESULT.delete(i, track)
				fprint('[*] after concentrate: ', len(RESULT.list))
		csvfile.close()

		# write filtered list to destination file
		try:
			with open(ini['destination'], 'w', newline='') as csvfile:
				writer = csv.writer(csvfile, delimiter=';', quotechar='|', quoting=csv.QUOTE_MINIMAL)
				# add reduced header
				writer.writerow('"'+h+'"' for h in ini['columns'])
				for row in RESULT.list:
					output = []
					for reduce in ini['columns']:
						output.append(RESULT.list[row][reduce])
					writer.writerow('"'+c+'"' for c in output)
			csvfile.close()
		except Exception as e:
			fprint('[~] ' + ini['destination'] + ' could not be written probably because it was already opened.\n' + traceback.format_exc())

		# generate warnings in case evaluations fail
		if 'evaluate' in ini:
			warning={}
			for row in RESULT.list:
				for evaluation in ini['evaluate']:
					if RESULT.list[row][evaluation]:
						if re.match(ini['evaluate'][evaluation], RESULT.list[row][evaluation]):
							if evaluation in warning:
								warning[evaluation] += 1
							else:
								warning[evaluation] = 1
			for key, value in warning.items():
				fprint('\n[!] WARNING: ' + str(value) + ' values of ' + key + ' may be faulty, please revise in the output file ' + ini['destination'])
		fprint('[*] done! do not forget to archive ' + ini['destination'])

	except Exception as e:
		fprint('[~] source file could not be loaded or some filter error occured, filter not successful...\n' + traceback.format_exc())

	stopanimation = True

	input('[?] press enter to quit program...')
	sys.exit()