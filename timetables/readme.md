# one word or three to the time tables

these are microsoft office documents with some vba-macro code implemented

**unfortunately the excel-functions and sheet-code-names are german only for me having no access to an english environment. you have to translate them to your language if necessary. marking and counting weekends has to be set up changing the values of "sa" and "so" in formulas and conditional formatting**

## there might be better solutions
if you have efficient electronic supported methods for time tracking of the employees or no need to track working time at all, please carry on!

## i come from worse
until today we keep track of work time on paper. every employee writes down starting and ending time as well as breaks, has to calculate everthing at the end of the month and supervisors have to keep track of umpteen sheets, recalculate these and make sure all employees come for the work hours they are paid for. keeping track of their own timetables means infinite paper copies of past sheets. and in the end it is all about trust. and possible misuse.

## welcome to the 21st century
this is where automation might be beneficial. having to [use a hammer as a screwdriver](https://github.com/erroronline1/qualitymanagement#use-case) i decided for excel and did a neat excel timetable. as these are accessible through the assistant as well all sheets are accessible by all employees. this rose some concerns about the risk of manipulation by the hr so there was a additional security layer implemented.

### calculations
the sheets calculate the effective work hours within the month based on weekly hours, count working days and take several special cases in account to reduce these if necessary (weekends, holidays, sick leave, etc.). breaks are deducted by default according to german work laws, unless the registered breaks are longer than the required minimum. holidays are counted as well and subtracted from the annual amount. every sheet fetches the values from the previous month.
all in all every employee can look up exactly the state of current hours and holidays, can review all previous months and doesn't have to calculate everything manually.

### automation
on start of a new month a new sheet is added automatically, so no one has to care about that. in this case there will be also a (monthly) reminder to plan paid leave if there are to many holidays left in relation to remaining days of the year.

on first opening of the file the user will be prompted to initialise the sheet. this will update the initial sheet to the current month and write the latest hours and holidays to the table. afterwards the user can personalize additional information within the sheet and start tracking. all surrounding information but the time and holiday entries will be copied to the next month, so there is no need to insert it regularly.

*there are formulas that have to be written to the new monthly sheet by vba. remember to change these too as you change formulas in the sheets.*

### security
the sheets are protected by default, only relevant cells can be changed by the user. on the first change after opening the user will have to enter a password. if this is not set already a personal password can be chosen. if forgotten a new one can be chosen as well. there will be no prompt until the next opening of the document. this reduces the risk of manipulation by accident or other employees.

### don't tell anyone
the security is inversely proportional to the tech savvyness of the users. there is a hidden sheet containing the masterpassword to unlock and relock sheets while initializing or creating the monthly sheet.
here the user passwords are stored as well, complemented by timestamp of creation and user account. in case of integrity concerns these information might give a start for investigating.