# one word or three to the time tables

these are microsoft office documents with some vba-code implemented

**unfortunately the excel-functions and sheet-code-names are german only for me having no access to an english environment. you have to translate them to your language if necessary. take account of sheets, conditional formatting and modules. marking weekends might have to be adjusted by changing the current values of "sa" and "so" to your language environment abbreviations in formula of conditional formatting.**

**be aware that this is currently in a permanent beta-status due to my lack of vba-skills and the sheets awaiting confirmation by the highly excel skilled personnel board possibly making spontaneous changes necessary. also these files (read: me) sometimes have difficulties dealing with different os- and office-versions.**

## there might be better solutions
if you have efficient electronic supported methods for time tracking of the employees or no need to track working time at all, please carry on!

## i come from worse
until the end of 2019 we kept track of work time on paper. every employee wrote down starting and ending time as well as breaks, had to calculate everthing at the end of the month and supervisors had to keep track of umpteen sheets, recalculate these and make sure all employees came for the work hours they were paid for. keeping track of their own timetables meant infinite paper copies of past sheets. and in the end it was all about trust. and possible misuse.

## welcome to the 21st century
this is where automation might be beneficial. following the idea of the [bottle light](https://github.com/erroronline1/qualitymanagement#about-bottle-light-qms) i decided for excel and did a neat excel timetable. as these are accessible through the assistant as well all sheets are accessible by all employees. this rose some concerns about the risk of manipulation by the hr so there was a additional security layer implemented.

### calculations
the sheets calculate the effective work hours within the month based on weekly hours, count working days and take several special cases in account to reduce these if necessary (weekends, holidays, sick leave, etc.). breaks are deducted by default according to german work laws, unless the registered breaks are longer than the required minimum. holidays are counted as well and subtracted from the annual amount. every sheet fetches the values from the previous month.
all in all every employee can look up exactly the state of current hours and holidays, can review all previous months and doesn't have to calculate everything manually.

### different models
currently there are two work model types: 9to5 and part time with home office. some calculations and excel-formulas differ, so there is a special handling within the vba-files.

* examples for 9to5: jane doe and max mustermann
* examples for part time with homeoffice: john doe and monika musterfrau


### automation
on start of a new month a new sheet is added automatically, so no one has to care about that. in this case there will be also a (monthly) reminder to plan paid leave if there are too many holidays left in relation to remaining days of the year.

as of 7/20 manually adding a new sheet is prohibited to prevent the initialization wizard from starting because it does not find a set date on the last sheet. 

on first opening of the file the user will be prompted to initialise the sheet. this will update the initial sheet to the current month and write the latest hours and holidays to the table. afterwards the user can personalize additional information within the sheet and start tracking. all surrounding information but the time and holiday entries will be copied to the next month, so there is no need to insert it regularly.

*there are formulas that have to be written to the new monthly sheet by vba. remember to change these too as you change formulas in the sheets. local tinted formulas (eg "wennfehler", ugly german for "iferror") can be found within the locals-module and update on initialization and while adding new sheets. all other formulas are simply arithmetic.*

### security
the sheets are protected by default, only relevant cells can be changed by the user. on the first change after opening the user will have to enter a password. if this is not set already a personal password can be chosen. if forgotten a new one can be chosen as well. there will be no prompt until the next opening of the document. this reduces the risk of manipulation by accident or other employees.

### don't tell anyone
the security is inversely proportional to the tech savvyness of the users. there is a very hidden sheet containing the masterpassword to unlock and relock sheets while initializing or creating the monthly sheet.
here the user passwords are stored as well, complemented by timestamp of creation and user account. in case of integrity concerns these information might give a start for investigating. if you consider enhancing security protect the vba code with a password as well, but ponder on tech savvyness of employees vs. long term accessability even after you leave the company with the passwords...
this sheet is also used for session persistent values that can not otherwise be handled due to vbas behaviour.

## maintainability
i had to learn this one the hard way. on developing and testing i had to change the codebase several times in about 30 beta testers sheets without dumping their values. eventually i learned about importing modules. if you provide a subfolder with the main module codes these will be imported/updated on every opening of the sheet. if this is not possible the modules remain in their last imported version. you can hide the subfolder vb_library, make it read_only by account management or provide it temporarily after changes.

if you change the layout of the tables make sure to adjust the cell addresses (A1 nad R1C1 notations both apply) within the essentials-module:

settings:
* addresses of settings in Essential.persistent
* columns of password storage in Secure.passwordHandler

info-sheet:
* address of absenceList for updating in Essentials.updateAbsence

timetable-sheets:
* columns of date, days and absence in Essentials.absenceHandler
* rolumns and rows for day counting in Essentials.countDays
* addresses of cells to be set plus formulas in Essentials.init
* addresses of cells to be set, read plus formulas in Essentials.addSheets
* addresses of cells to be read in Essentials.holidayReminder
* addresses of cells to reset with local formulas and conditional formatting in Locals.updateXLSfunctions

### flaws
opening the file for the first time from the web or a network path will excel be loading it in protected mode. this causes an issue that can only be bypassed by reopening the file for excel will trust the source from then on. there will be an information about this, as this was the easiest way after several insufficent tries to handle this (leaving protected mode delays unprotecting after initializing code. there is no application.wait available coming from protected view).

passwords are stored in plain text. whether you like that or not, it makes it a lot easier to track possible vulnerabilities and editing sheets.

all this might not satisfy all security concerns but is considered reasonable.

adjustments within the trust center might be necessary.

there might be errors on opening multiple timetables at once, most notably with excel 2010. i still haven't learned why. all tests succeeded being used solo. field test showed errors and crashes sometimes, most probably due to faulty input, resulting in loss of a few inputs. i still have no clue what the colleagues entered to lead to this behaviour. you're most welcome to educate me on this!

on opening the file for initialization from the assistant, the wizard will be hidden beneath the browser that has to be minimized first.