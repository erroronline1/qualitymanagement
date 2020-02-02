# what to do with vba-files
the tables and documents will retrieve their vba code from here as they instrinsically contain not much more than import functions and basic settings of language and relative path to this folder as of january 2020 (major refactoring!).
the files are prepared to work on their own if no import file is found. after import modules are installed and only overwritten if the remote files are found next time opening.

supplying the source folder has the benefit of changes affecting all working draft documents automatic. be careful as well as glad changes have to be only done in one location mostly. yay!

hopefully settings have to be done within the locals-modules only. here you can customize columns and rows in case you slightly edit the tables structure but not the behaviour, customize some values and language chunks. if you copy any locals-module you can set up additional languages that will be accessed as soon as the language is set within the office files directly. just make sure to keep  Attribute VB_Name = "Locals" 

while serving for illustratory purposes in the first place all ..._illustration.vba-files have a secondary functional purpose as well.
if you have to change code for the main module / ThisDocument-class, there is a module prepared that will import the source code from the Document_ThisDocument_illustration.vba to overwrite, that you can implement (preferably temporary) from within the essentials-module. use case: changing paths, language or adding custom subs or funtions.

## document_-modules
these are the modules for word-documents like the [draft documents in force](../documents/), containing versions control, publishing and registering.
Events like Document_Open() and App_DocumentBeforeSave() in the ThisDocument-code-module point to public functions within the essential-module thus executing always the latest imported routines.

## admin_-modules
these modules are in use of the [administrative excel sheets](../administration/) for maintaining and exporting diverse lists like document-lists, stocklist, etc. reusable functions can be found in the essentials-module, special behaviours are in the explicit module (based on the filename).
Events like Workbook_Open() and Workbook_BeforeSave() in the ThisWorkbook-code-module point to public functions within the essential-module thus executing always the latest imported routines.

## timetable_-modules
these modules work like the document_-modules and serve the same for every accessing [timetable-file](../timetables/). in this sample structure these can be found within the timetable-folder, but this is up to you. just make sure to point to the right directory from the ThisWorbook-code-module.
Events like Workbook_Open() and Workbook_BeforeSave() in the ThisWorkbook-code-module point to public functions within the essential-module thus executing always the latest imported routines.
