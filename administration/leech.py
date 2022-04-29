'''
batch download files according to define sites and sourcecode patterns
'''
import sys
import os
import threading
import shutil
import itertools
import time
import getpass
from datetime import date, datetime
import json
import re
import requests

print ('''
     _             _   
    | |___ ___ ___| |_ 
    | | -_| -_|  _|   |
    |_|___|___|___|_|_| v1.20220429

    by error on line 1 (erroronline.one)

''')
HELPTEXT= '''
[help]

    this program serves to automatically download files according to linked ressources on websites. it is best
    used from the command line to have access to further options. this is not ai, you'll have to analyze the
    inhomogeneous sources by yourself beforehand in order to set up. 

    usage: leech [ -a | --analyseonly ]               no prompt for download after analyse, flushing of file list into log
                 [ -e | --explicit ] IDENTIFIER       handles identifier group from setup exclusively
                 [ -h | --help ]                      this message, priority handling
                 [ -j | --json ]                      display configuration json sample
                 [ -r | --results ]                   displays list of detected files urls and names during analysis
                 [ -s | --successlogger ]             logs successful downloads as well
                 [ -v | --viewsource ] URL            displays received sourcecode. url optional for limiting

    without --explicit-argument all identifiers will be handled. you will be prompted for confirmation.
    use --viewsource and --results with care otherwise the flooding of text to the shell will slow everything down.
    --successlogger might make the recent log incomprehensible depending on number of resulting downloads

    before actual downloading all links will be scraped. this may lead to fuzzy numbers depending on pattern and
    code quality.
    if proxies are set you will be prompted for the current users password. username and password will be concatenated
    to the proxies adress, if input is not omitted.
    downloaded files will be stored in a source-named and dated subfolder.
    failure messages will be logged to leech.log-file for further investigation by default.'''

JSONSAMPLE='''
[JSON]

    configuration is specified in leech.json as following:

    {
        "proxies": {
            "http": "",
            "https": "",
            "ftp": ""
        },
        "httpheader": {
            "User-Agent": "",
            "Referer": ""
        },
        "folderprefix": "leech_",
        "max_threads": 5,
        "attempts": 3,
        "timeout": 20,
        "sources":{
            "identifier" : [{
				"toplevel": [
					"https://www.url.tld/overview.html"
				],
				"urlpattern": "<article.+?href=\\\"(.+?)\\\"",
				"urlpath": ["https://www.url.tld/",  0],
				"url": [
					"https://www.url.tld/wellknownsubsite.html"
				],
				"comment": "documents",
				"filepattern": "files/download/documents/.+?\\\\.pdf",
				"filepath": ["https://www.url.tld/",  0],
				"filename": ["file_", 0]
				"postdata": {...}
			}]
        }
    }

    * set up proxies according to your company settings, empty if unnecessary
    * define headers to trick source servers that don't play well with requests not coming from a browser
    * define folderprefix added to download folders, easier distinction from other folders
    * define number of parallel downloads with max_threads e.g. depending on shared bandwidth
    * define attempts in case of server timeouts or unexpected responses while downloading individual files,
      must not be less than 1
    * define timeout in seconds while not retrieving sourcecode from sites, must not be 0

    * identifier optionally describes the data set and serves as name for the destination folder. it may
      contain minus/dash signs but can not be called explicit from the terminal then
        * toplevel as a list/array contains pages to be analyzed for subpages containing files, empty if unnecessary
        * urlpattern as python flavoured regex to find subpages in pages sourcecode. the pattern will be applied
          case insensitive and single line
          remember to escape special characters in regex as well as json-string
        * urlpath can be a concatenated list of strings and pattern match positions,
        * url as a list/array contains the pages to be analyzed by the same pattern
        * comment for human comprehension of the dataset only, not actually used by the code
        * filepattern as python flavoured regex to find files in pages sourcecode. the pattern will be applied
          case insensitive and single line
          remember to escape special characters in regex as well as json-string
        * filepath can be a concatenated list of strings and pattern match positions
        * same goes for filename in case of custom destination filenames
        * postdata is optional for use with auto referring login sites. currently this leads to possible
          handling of one layer of forwarding, login data or whatever can be submitted by a post request

    extend whole dictionaries/objects if multiple subsites demand different patterns
    toplevel sites will be scraped for urls containing actual files that will be added dynamically to the url list
'''

#init logfile, write session start and parameters for backtracking
LOGFILE=open('leech.log', 'a', encoding="utf8")
LOGFILE.write('\n\nsession on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' started with >' + ' '.join(sys.argv) + '\n')

def log(msg):
	'''log routine writing to file and terminal'''
	LOGFILE.write( msg + '\n' )
	sys.stdout.write( '\r' + msg + '\n' )
	sys.stdout.flush()


try:
	'''load settings'''
	with open('leech.json', 'r', encoding="utf8") as jsonfile:
		SETTINGS= json.loads(jsonfile.read().replace('\n', ''))
except Exception as setting_failure:
	log(f'[~] settings could not be loaded, see help for syntax: {setting_failure}...')
	SETTINGS=False

#set globals
HIDEANIMATION = False 				# setter to start/stop working variable
FOUNDFILES=0						# for determination of progress
FILELIST={}							# future result dict from crawling
DOWNLOADED=[]						# future list of successful downloads
THREAD_COUNTER = 0					# init variable
ATTEMPT=SETTINGS['attempts']		# init and set variable that will be counted down

TERMINALWIDTH, TERMINALHEIGHT = shutil.get_terminal_size(0)
TERMINALHEIGHT = 'linter, please ignore unused ' + str(TERMINALHEIGHT)

def animationbar():
	'''fancy anmiation to show something's going on'''
	for cycle_item in itertools.cycle(['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .']):
		if not HIDEANIMATION:
			sys.stdout.write('\r' + cycle_item)
			sys.stdout.flush()
			time.sleep(0.1)
		else:
			time.sleep(1)

def get_source( link, postdata ):
	'''retrieve source code'''
	try:
		cookies=''
		if postdata:
			session = requests.Session()
			request_answer = session.post( link, data = postdata, proxies=SETTINGS['proxies'], timeout=SETTINGS['timeout'])
			cookies = session.cookies
		else:
			request_answer = requests.get( link, headers = SETTINGS['httpheader'], proxies=SETTINGS['proxies'], timeout=SETTINGS['timeout'])

		if request_answer.status_code == 200:
			return (request_answer.text, cookies)
		log(f'[~] invalid response received by {link} ({request_answer.status_code})')
	except Exception as request_error:
		log(f'[~] connection error with {link} | {request_error}')


def requesthandle(file, savedestination ):
	'''download file'''
	global THREAD_COUNTER
	THREAD_COUNTER += 1
	#extract file list-object to readable variables
	link, name, cookies = file
	errorcase=re.sub(r'\s+', ' ', link)
	try:
		request_answer = requests.get( link, stream = True, headers = SETTINGS['httpheader'], proxies=SETTINGS['proxies'], cookies=cookies )
		if request_answer.status_code == 200:
			#print (' |||||| ' + str(r.status_code) + ': ' + link)
			request_answer.raw.decode_content = True
			with open( os.path.join(savedestination, name), 'wb' ) as file_content:
				shutil.copyfileobj(request_answer.raw, file_content)
			if SUCCESSLOGGER:
				log (f'[*] downloaded: {os.path.join(savedestination, name)}')
			#add file to success list to prevent further attempts
			DOWNLOADED.append(file)
			#preceding whitespaces because of animation
			sys.stdout.write( '\r     successfully downloaded file ' + str(len(DOWNLOADED)) + ' of ' + str(FOUNDFILES) + '' )
			sys.stdout.flush()
		else:
			log (f'[~] status error downloading {name} from {errorcase} in attempt {SETTINGS["attempts"] - ATTEMPT + 1} of {SETTINGS["attempts"]} | {request_answer.status_code}')
	except Exception as request_error:
		log (f'[~] general error downloading {name} from {errorcase} in attempt {SETTINGS["attempts"] - ATTEMPT + 1} of {SETTINGS["attempts"]} | {request_error}')
	THREAD_COUNTER -= 1

def graburls(site, index, viewsource):
	'''analyze sourcecode and add to urls list according to matches'''
	src = SETTINGS['sources'][site][index]
	for toplevel in src['toplevel']:
		try:
			ressource = get_source( toplevel, src['postdata'] if 'postdata' in src else False )
			if (isinstance(viewsource, str) and toplevel == viewsource ) or (isinstance(viewsource, bool) and viewsource):
				sys.stdout.write( '\r     ' + ressource[0] + '\n' )
				sys.stdout.flush()
			urls = re.findall(src['urlpattern'], ressource[0], re.IGNORECASE | re.DOTALL)
		except Exception:
			continue
		if len(urls) < 1:
			log(f'[~] no subsites found on [{site}] {toplevel}')
			sys.stdout.write( '\r     still analyzing source [' + site + ']' )
			sys.stdout.flush()
		for url in urls:
			urlpath = ''
			if not isinstance(url, tuple):
				#make an iterable tuple anyway even if there is just a single match
				url=tuple([url])
			#handle filepath and filename concatenation according to settings
			for source in src['urlpath']:
				if isinstance(source, int):
					urlpath += url[source]
				else:
					urlpath += source
			#strip occasional whitespaces
			urlpath=urlpath.strip()
			#...and add to list
			if urlpath not in SETTINGS['sources'][site][index]['url']:
				SETTINGS['sources'][site][index]['url'].append( urlpath )
	if DISPLAYRESULTS:
		for found in SETTINGS['sources'][site][index]['url']:
			sys.stdout.write( '\r' + str(found) + '\n' )
			sys.stdout.flush()

def grabfiles(site, index, viewsource):
	'''analyze sourcecode and create file list according to matches'''
	src = SETTINGS['sources'][site][index]
	for url in src['url']:
		try:
			ressource = get_source( url, src['postdata'] if 'postdata' in src else False )
			if (isinstance(viewsource, str) and url == viewsource ) or (isinstance(viewsource, bool) and viewsource):
				sys.stdout.write( '\r     ' + ressource[0] + '\n' )
				sys.stdout.flush()
			files = re.findall(src['filepattern'], ressource[0], re.IGNORECASE | re.DOTALL)
		except Exception:
			continue
		if len(files) < 1:
			log(f'[~] no files found on [{site}] {url}')
			sys.stdout.write( '\r     still analyzing source [' + site + ']' )
			sys.stdout.flush()
		for file in files:
			#filenames may be concatenated and cleared from specialchars
			filename = ''
			filepath = ''
			if not isinstance(file, tuple):
				#make an iterable tuple anyway even if there is just a single match
				file=tuple([file])
			#handle filepath and filename concatenation according to settings
			for source in src['filepath']:
				if isinstance(source, int):
					filepath += file[source]
				else:
					filepath += source
			for source in src['filename']:
				if isinstance(source, int):
					filename += '_' + re.sub(r'(?![# \.-])\W', '', file[source].split('/')[-1] )
				else:
					filename += source
			if filename[0] == '_':
				filename = filename[1:]
			#strip occasional whitespaces
			filepath=filepath.strip()
			#define result...
			insert=[filepath, filename, ressource[1]] #with ressource[1] being cookies
			#...and add to list
			if site in FILELIST:
				if insert not in FILELIST[site]:
					FILELIST[site].append( insert )
			else:
				FILELIST[site]=[ insert ]
	if DISPLAYRESULTS:
		for found in FILELIST[site]:
			sys.stdout.write( '\r' + str(found) + '\n' )
			sys.stdout.flush()

def download(site):
	'''download according to FILELIST'''
	for file in FILELIST[site]:
		if not file in DOWNLOADED:
			savedestination = os.path.join( os.getcwd(), SETTINGS['folderprefix'] + site + '_' + date.today().strftime('%Y%m%d') )
			if not os.path.isdir(savedestination):
				os.mkdir( savedestination )
			_t = threading.Thread( target = requesthandle, args = (file, savedestination) )
			_t.daemon = True
			_t.start()
			while THREAD_COUNTER >= SETTINGS['max_threads']:
				pass
	while THREAD_COUNTER > 0:
		pass

def main(explicit, viewsource):
	'''main function'''
	global HIDEANIMATION
	global FOUNDFILES
	global ATTEMPT

	print(('\n[!] greedy download' if not ANALYSEONLY else '\n[!] analyse only') + ' initialized. see leech.log-file to reconstruct results.')
	print('[!] starting analysis of ' + ( explicit if explicit else str(len(SETTINGS['sources'])) + ' sources' ) + ' on ' + datetime.now().strftime('%Y-%m-%d %H:%M') +'. please stand by.\n')
	print('[!] please note that some patterns scrape subsites that can not be used. not all errors are severe ones.')

	animation = threading.Thread(target=animationbar)
	animation.daemon = True
	animation.start()

	if explicit:
		sys.stdout.write( '\r     analyzing source [' + explicit + ']' )
		sys.stdout.flush()
		for index, src in enumerate(SETTINGS['sources'][explicit]):
			if len(src['toplevel']) > 0:
				graburls(explicit, index, viewsource)
			grabfiles(explicit, index, viewsource)
	else:
		for number, site in enumerate(SETTINGS['sources']):
			message = '\r     analyzing source ' + str(number + 1) + ' of ' + str(len(SETTINGS['sources'])) + ' [' + site + ']'
			sys.stdout.write( message + ' ' * (TERMINALWIDTH - len(message) - 1) )
			sys.stdout.flush()
			for index, src in enumerate(SETTINGS['sources'][site]):
				if len(src['toplevel']) > 0:
					graburls(site, index, viewsource)
				grabfiles(site, index, viewsource)
	count=0
	for site in FILELIST:
		count += len(FILELIST[site])

	HIDEANIMATION=True
	FOUNDFILES=count
	message = f'[*] approximately {count} files were found.'
	log( message + ' ' * (TERMINALWIDTH - len(message) - 1) )

	if not ANALYSEONLY:
		confirm = input(f'\n[?] do you want to download {count} files now?\n    type "y" to proceed, "h" for help, nothing or any other key to abort: ')
		if confirm == 'y':
			HIDEANIMATION = False

			while ATTEMPT >= 1 and len(DOWNLOADED) < FOUNDFILES:
				for site in FILELIST:
					download(site)
				ATTEMPT -= 1
			message = '[*] sucessfully downloaded ' + str(len(DOWNLOADED)) + ' files.'
			log( message + ' ' * (TERMINALWIDTH - len(message) - 1) )
			LOGFILE.write('session properly ended on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + (' explicit for ' + explicit if explicit else '') )
		elif confirm == 'h':
			print (HELPTEXT)
		else:
			LOGFILE.write(json.dumps(FILELIST, indent = 4))
			LOGFILE.write('session properly terminated on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' without further action')
	else:
		LOGFILE.write('session properly terminated on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' without further action')

	LOGFILE.close()
	HIDEANIMATION = True

	input('\n[?] done. press enter to quit...')
	sys.exit('goodbye...')


if __name__ == '__main__':
	HELP = False
	JSON = False
	EXPLICIT = False
	COMFIRM = False
	VIEWSOURCE = False
	DISPLAYRESULTS = False
	ANALYSEONLY = False
	SUCCESSLOGGER = False
	CONFIRM = False
	USEPROXY, user, pw = False, '', ''

	#argument handler
	#options actually ordered by importance
	options = {'h':'--help|-h',
		'j':'--json|-j',
		'e':'(?:--explicit|-e)[:\\s]+([^-]+\\w+)',
		'v':'(--viewsource|-v)[:\\s]+([^-]+[\\w;]+)*',
		'r':'--results|-r',
		'a':'--analyseonly|-a',
		's':'--successlogger|-s'}
	for opt in options:
		arg=re.findall(options[opt], ' '.join(sys.argv) + ' ', re.IGNORECASE)
		if opt == 'h' and arg:
			HELP = True
			CONFIRM = 'h'
			break
		elif opt == 'j' and arg:
			JSON = True
			CONFIRM = 'j'
			break
		elif opt == 'e' and bool(arg):
			EXPLICIT = arg[0]
		elif opt == 'v' and bool(arg):
			VIEWSOURCE = arg[0][1] if bool(arg[0][1]) else True
		elif opt == 'r' and arg:
			DISPLAYRESULTS = True
		elif opt == 'a' and arg:
			ANALYSEONLY = True
		elif opt == 's' and arg:
			SUCCESSLOGGER = True
		else:
			pass

	#auto help if no source file is found
	if not SETTINGS:
		JSON = True
		CONFIRM = 'j'

	if not HELP and not JSON and not EXPLICIT and not ANALYSEONLY:
		CONFIRM = str(input(f'[?] without specification you are probably going to download several files from {len(SETTINGS["sources"])} sources.\n    that may take an unpredictable amount of time and data volume.\n    type "y" to proceed with analysis, "h" for help, nothing or any other key to abort: '))

	if CONFIRM in ['h','help'] or HELP:
		print (HELPTEXT)
		input('[?] press enter to quit...')
	elif CONFIRM in ['j','json'] or JSON:
		print (JSONSAMPLE)
		input('[?] press enter to quit...')
	elif CONFIRM == 'y' or EXPLICIT or ANALYSEONLY:
		for p in SETTINGS['proxies']:
			if len(SETTINGS['proxies'][p]) > 0:
				USEPROXY=True
		if USEPROXY:
			print('\n[?] use of proxy detected, login name and password might be necessary!\n    note that wrong values result in connection errors.')
			user=getpass.getuser()
			pw=getpass.getpass(f'    please enter password for "{user}" (hidden): ')
			for p in SETTINGS['proxies']:
				if len(SETTINGS['proxies'][p]) > 0 and len(user) > 0 and len(pw) > 0:
					temp=re.findall(r'(.+?//)(.+)', SETTINGS['proxies'][p], re.IGNORECASE | re.DOTALL)
					SETTINGS['proxies'][p] = ''.join([temp[0][0],user,':',pw,'@',temp[0][1]])
		main(EXPLICIT, VIEWSOURCE)

	LOGFILE.write('session properly terminated on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' without further action')
	LOGFILE.close()
