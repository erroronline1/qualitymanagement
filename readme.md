# a quality management software
while it makes way more sense to automate quality management using assistive technology and digitalizing everything, this is not always possible. so this quality management software has a very specific use case depending on your environment:

* your quality managment and documentation is still mainly paper-based
* your quality manager is fed up with manual version control, archiving, publishing and keeping the overview list of documents clean
* your company does not have the ressources to test out different expensive qm-software-solutions until you find one to suit your needs
* employees have access to the it-infrastructure and printers, e.g. via network and group-accounts
* your it-department is stubborn and unflexible so you have to make use of the tools you have access to, even if you have to fasten screws with a hammer because you don't get a screwdriver
* your company relies on microsoft windows and microsoft office (not sure about use of the documents macros for other platforms)

[by error on line 1](http://erroronline.one) but feel free to use and modify at your own risk according to the license outlined below.

this quality management software has been in use in context to [iso 13485:2015](https://www.iso.org/search.html?q=13485%3A2016)

there have been some significant changes to the core documents as well as to the assistant. i decided to make this a new version. in case you need previous sourcecodes these can be found as a branch in the public repository.

# the core documents
## use case
the office documents come with built-in vba-macros to handle document version control, its overview and export-handling. employees use mainly unchangeable pdf-files to fill out during workflow. each document registers and manages itself (kind of).

## what the documents do
style the blueprints according to your desired corporate design whatever you like and however word allows you to. just make sure you don't delete the in-built fields.
customize the variables within the vba-macros.

in general this system
* supports your version control
* supports you being backed up at any time
* makes sure you took every aspect into account regarding the norm - but you can modify checkpoints to your needs
* makes sure everyone has access to documents and functions you decide to is supposed to - in case your quality manager calls in sick there is still access to the system (as supposed to a software i saw whose document access was fully dependent on profile login and license number)
* supports free word design choices (as supposed to the aforementioned softwares styling limitations due to use of .rtf-templates)

## requirements
* one somewhat experienced office user to customize the document-blueprints and vba-macros
* microsoft office 2010+ (tested with office 2010, 2016 and 2019 professional, word and excel)

# the assistant
## use case
this tool serves as an assitive layer to access your companies documents in form of a web-app with read-only-properties.

## what this tool does
this tool provides your company with an application to have an easier access to your quality management system. if you provide your employees with access via this assistant it might be way more easy to have them use only the latest documentation version. it does access files that could be reached by file-explorer as well, but avoiding the latter way prevents the employees to make copies that may become obsolete, at least to some degree.

* global access to documentation for every employee
* easy lookup methods for finding documents regardless of storage path, in case alternative search term are provided it is even more easy to find these
* automated update of contents with built-in vba-interface
* compatible to ms ie11 because it was built for it, tested successfully with firefox, chrome and edge as well
* easily extendable with modules for various custom data automation

## requirements
* one webdeveloper to customize the application for your companies needs and provide you with desired additional modules
* network access for every employee to access the assistant only from one source
* serial print of document packages requires active-x which is only available in ie11. this option will not be shown if not accessible
* patience with coworkers blaming 'your' assistant for every network failure, printer settings and their inability to read the literal hints and descriptions

# but i am no programmer!
to customize this software to your needs it is definitely neccessary to have someone change values within the vba-macros as well as the javascript configuration files. you might at least know someone who does this as a hobby and is happy to do that for you for a couple of drinks. or after these...
if you are worried your coding employee leaves, at least the assistant can be maintained by any webdeveloper/webdeveloping agency that knows javascript. also there is no need of compiling since all source codes are openly accessible.

# details
## the documents
the vba-macros can be customized quite easily for i tried to have all important parts split to functions to be able to enable/disable these on demand as well as using variables to customize easily. in the best case all you have to do is to change the variables at the beginning of the macro-code. this applies to both docm and xlsm files.

* customize the variables for prompts to your language
* you can provide default paths within the macro - but paths will always be selectable
* you can change rows and columns within the macro-setup of tables in case you want to provide different information on save of word-files
* you will be guided through version control and can choose whether to auto-update version and release date or set these manually
* archiving files with latest version number
* exporting files to unchangeable pdf (you might want to overhaul them to editable forms, but that requires additional software)
* updating the list of current documents in force

on save of excel-lists
* there will be an automated check if you have your documents fitting to all queried aspects
* you will be asked if you want to export/update the files list for the assistant application

*caveat: since every document contains the code to register itself, changes of the vba-code have to be done in every file later on. an update of the codebase might be possible following [this tutorial by charles pearson](http://www.cpearson.com/excel/vbe.aspx) but i did not include this out of fear to have problems with our companies security and antivir settings.*

### overview of documents in force and assertion of checkpoints
![documents in force](assets/docm_documentsinforce.png)

### overview of matched checkpoints
![checkpoints](assets/docm_checkpoints.png)

### overview of document bundles
![document bundles](assets/docm_documentbundles.png)

## the assistant
there is a main html-file in the root folder, a core folder with the core function framework, a config-file and themes. then there are module- and data-folders where you can define modules with any desired javascript-functionality to automate things. everyone has access to these and can make use of them. therefore any employee has the same ressources and hopefully outputs. note that the current version makes excessive use of the [vanillaJS-libraray](http://vanilla.js-com). in case you have restricted access to your it i can recommend [notepad++ portabale](https://notepad-plus-plus.org/download/) out of personal experience.

* the assistant is built using js-ecmascript 5 on purpose because of required compatibility to ms ie11. unfortunately this still is the default browser to date in many companies. the css is not compatible to previous versions of ie
* the assistant is designed to handle multiple language support, comes with english and german and can be extended as desired. extend the lang-objects in every module, the config-file and register the languages in this config-file to make them available.
* the core-object provides readable function-calls and globally usable variables. general configuration takes place in core/config.js. this file contains a variable that extents the core-object with global variables and commonly uses language-bricks.
* built-in core-functions provide a search-function that has multi-word and fuzzy-search handling, language-handler, script-import, local-storage- or cookie-handler, repetitive design pattern implementation (icons, inputs, etc.), history handling and some more. get access or extend these functions with `core.function.FUNCTIONNAME`, global variables with `core.var.VARNAME`. i recommend this pattern to modules as well, defining a module-object with `{moduleFileName}.function.FUNCTIONNAME` and `{moduleFileName}.var.VARNAME`. the handler for multi-language-support of the application  (`core.function.lang()`) makes built-in automated use of this pattern.
* data files are stored in a different folder hoping that changes to the backend don't mess up data that might be accessed through different persons than the maintainer of the application
* users can be informed about changes using the changelog in core/user_information.js. add your own changes and the information will popup automatically on start
* since most of my colleagues don't mind messing around to learn something, there is a short-tip function whose entries can be extended in accordance to your modules
* settings will be stored in local storage or cookies (depending on browser support) so everything depends on the local machine in addition to user login. in case everything is stored with cookies if the browsers history is cleaned on exit all setting will be gone as well. the storage method handles local-storage support with cookies as a fallback. this means there is finally support for chrome with an issue with cookie storage of local sites as well as ie11 without local storage
* you can monitor the performance (currently implemented for tracking asynchronous loading and processing) in the console if you enable it in the settings

*be aware that there are dependencies between the assistants datafiles, their objects and handling, and the documents vba and table-structure. it might become neccessary to change things on both sides.*


![assistant home screen](assets/assistant_home.png)

### comes with different themes
![assistant themes](assets/assistant_themes.png)

### search less, find more directly from the home screen
![assistant global search](assets/assistant_globalsearch.png)

### customize the assistants behaviour
![assistant settings](assets/assistant_settings.png)

### provided modules within open-source distribution
the provided modules are filled with dummies. the general multi-language support was added in advance of making this application open source and comprehensible. some module-data-files might lack of multi-language content. in production this feature might or might not make sense. you are free to implement this feature for your self.

* document lookup ![assistant document lookup](assets/assistant_documentlookup.png)
* predefined document bundles ![assistant document bundles](assets/assistant_documentbundles.png)
* inventory / stock list ![assistant stocklist](assets/assistant_stocklist.png)
* default texts for correspondence ![assistant correspondence](assets/assistant_correspondence.png)
* mail tools for serial mails, signature composer and not-available-notice  ![assistant mail tools](assets/assistant_mailtools.png)
* help (simplyfied for me not being english native and should be customized to your own companies comprehension of interwebz and nerd-stuff-thingies) ![assistant help](assets/assistant_help.png)

### thoughts and considerations
i tried to implement a preview on search forms using datalists. while it is not a big problem to update these dynamically i ran into two major issues: the cross-browser behaviour is very different and quirky. and using this in combination with fuzzy search and 6k+ items in stock-list everything slows horribly down. it would have been nice to have but ended up in some hours wasted.

# miscellaneous
* the provided folder structure is not neccessarily your first choice and just a sample. but if you customize that you should change at least the default paths within the vba-macros
* even if you don't want to use the assistant, the documents semiautomated version control might be useful for you. on the other hand the assistant is hardly possible to populate without the documents unless you write your own routines for that.
* i'd recommend an educated access-management. it may be a good idea to store docm-templates in a folder with restricted access to qm-managers, deputies and ceo, while access to pdfs and the assistant application should be granted for everyone.
* before implementing this system to your company make sure your decisions for documenting the system itself are reliable (e.g. rows and columns in the list of documents in force in dependency to the vba-macro within the self registering docm-files). otherwise you might have to change a lot of code in a lot of documents. this isn't fun.
* the assistant is designed to hopefully seamlessly transition into windows 10 fluent design that is still to come to my company as time of writing. styling and icon set was selected with this intention. i don't want to collide with foreign rights and hope this will be recognized as the reverence it is intended to be.

# disclaimer
use at your own responsibility. as this system is or has been in real use with me being responsible, i did my best to make everything flawless. i also tried to make the documentation and comments as meaningful as i could. als always there might be parts that once seemed to be self-explanatory so a little bit of advanced javascript skills might come in handy.

this system does neither provide you with the content of your quality management system nor the neccessary structure. you will have to set this one up for yourself. but this system might be flexible enough to match your needs in regards of version control, publishing and company wide access. i really tried to make the best hammer for screwing i could. of course i sewed everything to fit my own companies needs and quality management system. if your company decides for more fields you might have to take a deeper look into vba programming to customize that.
but as the current deputy quality manager i strongly recommend to reconsider which type of information and extent your documentation must have to fit the norm.

i was not able to find information if there are special requirements for a quality management software. regarding iso 13485 there are no restrictions what to use. you will have to take your own responsibility for any kind of software - even an amateurs work. you will just have to rate the risk, how to handle that and set up the process of validation of software application for this. as this software supports your paper-based documentation it is up to your own document content, process definitions and reliable form completion by your employees to make sure your qm/documentation meets all regulatory requirements.

# license
a quality management software - automate your paper based qms

copyright (c) 2019  [by error on line 1](http://erroronline.one)

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version. 

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. 

You should have received a copy of the GNU General Public License along with this program; if not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).
