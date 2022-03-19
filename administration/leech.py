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
    |_|___|___|___|_|_| v1.20220319

    by error on line 1 (erroronline.one)

''')
HELPTEXT= '''
[help]

    this program serves to automatically download files according to linked ressources on websites. it is best
    used from the command line to have access to further options. this is not ai, you'll have to analyze the
    inhomogeneous sources by yourself beforehand in order to set up. 

    usage: leech [ -a | --analyseonly ]               no prompt for download after analyse
                 [ -e | --explicit ] IDENTIFIER       handles identifier group from setup exclusively
                 [ -j | --json ]                      display configuration json sample
                 [ -h | --help ]                      this message, priority handling
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
LOGFILE=open('leech.log', 'a')
LOGFILE.write('\n\nsession on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' started with >' + ' '.join(sys.argv) + '\n')

def log(msg):
	'''log routine writing to file and terminal'''
	LOGFILE.write( msg + '\n' )
	sys.stdout.write( '\r' + msg + '\n' )
	sys.stdout.flush()


try:
	'''load settings'''
	with open('leech.json', 'r') as jsonfile:
		SETTINGS= json.loads(jsonfile.read().replace('\n', ''))
except:
	log('[~] settings could not be loaded, see help for syntax...')
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
	for c in itertools.cycle(['.   ', '..  ', '... ', '....', ' ...', '  ..', '   .']):
		if not HIDEANIMATION:
			sys.stdout.write('\r' + c)
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
			r = session.post( link, data = postdata, proxies=SETTINGS['proxies'], timeout=SETTINGS['timeout'] )
			cookies = session.cookies
		else:
			r = requests.get( link, headers = SETTINGS['httpheader'], proxies=SETTINGS['proxies'], timeout=SETTINGS['timeout'] )

		if r.status_code == 200:
			return (r.text, cookies)
		else:
			log( '[~] invalid response received by {0}'.format(link) )
	except:
		log( '[~] connection error with {0}'.format(link) )


def requesthandle(file, savedestination ):
	'''download file'''
	global FILELIST
	global THREAD_COUNTER
	THREAD_COUNTER += 1
	#extract file list-object to readable variables
	link, name, cookies = file
	errorcase=re.sub(r'\s+', ' ', link)
	if len(errorcase) > 100:
		mid = len(errorcase) // 2
		errorcase = errorcase[0:20] + ' [...] ' + errorcase[mid - 30:mid + 30] + ' [...] ' + errorcase[-20:]
	try:
		r = requests.get( link, stream = True, headers = SETTINGS['httpheader'], proxies=SETTINGS['proxies'], cookies=cookies )
		if r.status_code == 200:
			#print (' |||||| ' + str(r.status_code) + ': ' + link)
			r.raw.decode_content = True
			f = open( savedestination + '\\' + name, 'wb' )
			shutil.copyfileobj(r.raw, f)
			f.close()
			if successlogger:
				log ('[*] downloaded: {0}'.format(savedestination + '\\' + name))
			#add file to success list to prevent further attempts
			DOWNLOADED.append(file)
			#preceding whitespaces because of animation
			sys.stdout.write( '\r     successfully downloaded file ' + str(len(DOWNLOADED)) + ' of ' + str(FOUNDFILES) + '' )
			sys.stdout.flush()
		else:
			log ('[~] status error downloading {0} in attempt {1} of {2}'.format(errorcase, SETTINGS['attempts'] - ATTEMPT + 1, SETTINGS['attempts']))
	except:
		log ('[~] general error downloading {0} in attempt {1} of {2}'.format(errorcase, SETTINGS['attempts'] - ATTEMPT + 1, SETTINGS['attempts']))
	THREAD_COUNTER -= 1

def graburls(site, index, viewsource):
	'''analyze sourcecode and add to urls list according to matches'''
	src = SETTINGS['sources'][site][index]
	for url in src['toplevel']:
		try:
			ressource = get_source( url, src['postdata'] if 'postdata' in src else False )
			if (isinstance(viewsource, str) and url == viewsource ) or (isinstance(viewsource, bool) and viewsource):
				sys.stdout.write( '\r     ' + ressource[0] + '\n' )
				sys.stdout.flush()
			urls = re.findall(src['urlpattern'], ressource[0], re.IGNORECASE | re.DOTALL)
		except:
			continue
		if len(urls) < 1:
			log('[~] no subsites found on [{0}] {1}'.format(site, url))
			sys.stdout.write( '\r     still analyzing source [' + site + ']' )
			sys.stdout.flush()
		for url in urls:
			urlpath = ''
			if not isinstance(url, tuple):
				#make an iterable tuple anyway even if there is just a single match
				url=tuple([url])
			#handle filepath and filename concatenation according to settings
			for s in src['urlpath']:
				if isinstance(s, int):
					urlpath += url[s]
				else:
					urlpath += s
			#strip occasional whitespaces
			urlpath=urlpath.strip()
			#...and add to list
			if urlpath not in SETTINGS['sources'][site][index]['url']:
				SETTINGS['sources'][site][index]['url'].append( urlpath )
	if displayresults:
		for f in SETTINGS['sources'][site][index]['url']:
			sys.stdout.write( '\r' + str(f) + '\n' )
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
		except:
			continue
		if len(files) < 1:
			log('[~] no files found on [{0}] {1}'.format(site, url))
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
			for s in src['filepath']:
				if isinstance(s, int):
					filepath += file[s]
				else:
					filepath += s
			for s in src['filename']:
				if isinstance(s, int):
					filename += '_' + re.sub(r'(?![# \.-])\W', '', file[s].split('/')[-1] )
				else:
					filename += s
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
	if displayresults:
		for f in FILELIST[site]:
			sys.stdout.write( '\r' + str(f) + '\n' )
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

	print(('\n[!] greedy download' if not analyseonly else 'analyse only') + ' initialized. see leech.log-file to reconstruct results.')
	print('[!] starting analysis of ' + ( explicit if explicit else str(len(SETTINGS['sources'])) + ' sources' ) + ' on ' + datetime.now().strftime('%Y-%m-%d %H:%M') +'. please stand by.\n')

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
	for n in FILELIST:
		count += len(FILELIST[n])

	HIDEANIMATION=True
	FOUNDFILES=count
	message = '[*] approximately {0} files were found.'.format(count)
	log( message + ' ' * (TERMINALWIDTH - len(message) - 1) )

	if not analyseonly:
		confirm = input('\n[?] do you want to download {0} files now?\n    type "y" to proceed, "h" for help, nothing or any other key to abort: '.format(count))
		if confirm == 'y':
			HIDEANIMATION = False

			while ATTEMPT >= 1 and len(DOWNLOADED) < FOUNDFILES:
				for n in FILELIST:
					download(n)
				ATTEMPT -= 1
			message = '[*] sucessfully downloaded ' + str(len(DOWNLOADED)) + ' files.'
			log( message + ' ' * (TERMINALWIDTH - len(message) - 1) )
			LOGFILE.write('session properly ended on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + (' explicit for ' + explicit if explicit else '') )
		elif confirm == 'h':
			print (HELPTEXT)
		else:
			LOGFILE.write('session properly terminated on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' without further action')
	else:
		LOGFILE.write('session properly terminated on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' without further action')

	LOGFILE.close()
	HIDEANIMATION = True

	input('\n[?] done. press enter to quit...')
	sys.exit('goodbye...')


if __name__ == '__main__':
	lhelp = False
	ljson = False
	explicit = False
	confirm = False
	viewsource = False
	displayresults = False
	analyseonly = False
	successlogger = False
	useproxy, user, pw = False, '', ''

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
			lhelp = True
			confirm = 'h'
			break
		elif opt == 'j' and arg:
			ljson = True
			confirm = 'j'
			break
		elif opt == 'e' and bool(arg):
			explicit = arg[0]
		elif opt == 'v' and bool(arg):
			viewsource = arg[0][1] if bool(arg[0][1]) else True
		elif opt == 'r' and arg:
			displayresults = True
		elif opt == 'a' and arg:
			analyseonly = True
		elif opt == 's' and arg:
			successlogger = True
		else:
			pass

	#auto help if no source file is found
	if not SETTINGS:
		ljson = True
		confirm = 'j'

	if not lhelp and not ljson and not explicit and not analyseonly:
		confirm = str(input('[?] without specification you are probably going to download several files from {0} sources.\n    that may take an unpredictable amount of time and data volume.\n    type "y" to proceed with analysis, "h" for help, nothing or any other key to abort: '.format(len(SETTINGS['sources']))))

	if confirm in ['h','help'] or lhelp:
		print (HELPTEXT)
		input('[?] press enter to quit...')
	elif confirm in ['j','json'] or ljson:
		print (JSONSAMPLE)
		input('[?] press enter to quit...')
	elif confirm == 'y' or explicit or analyseonly:
		for p in SETTINGS['proxies']:
			if len(SETTINGS['proxies'][p]) > 0:
				useproxy=True
		if useproxy:
			print('\n[?] use of proxy detected, login name and password might be necessary!\n    note that wrong values result in connection errors.')
			user=getpass.getuser()
			pw=getpass.getpass('    please enter password for "{0}" (hidden): '.format(user))
			for p in SETTINGS['proxies']:
				if len(SETTINGS['proxies'][p]) > 0 and len(user) > 0 and len(pw) > 0:
					temp=re.findall(r'(.+?//)(.+)', SETTINGS['proxies'][p], re.IGNORECASE | re.DOTALL)
					SETTINGS['proxies'][p] = ''.join([temp[0][0],user,':',pw,'@',temp[0][1]])
		main(explicit, viewsource)

	LOGFILE.write('session properly terminated on ' + datetime.now().strftime('%Y-%m-%d %H:%M') + ' without further action')
	LOGFILE.close()
