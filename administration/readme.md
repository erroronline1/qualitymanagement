# one word or three to the core documents use

these are microsoft office documents with some vba-code implemented

## template_file.docm
this is the main template containing the basic functions for importing modules for version control and registration. you have to set up basically the language code according to available local modules and the level of parental folders according to the relative vb_library location. this is one level up by default.
outsourced modules will be imported/updated if available.

there are three important and processed fields within the document:
* title, which is updated on load of the file
* version and release date

the field for page numbering is of no importance to the functions and can be deleted or moved.
according to the modules currently you are asked on saving if you want to update the version number and release date. you can set these automatically to the next version and the current date or set it manually. in either cases you will be processed through archiving, publishing and registering the document in the list of documents in force. if you have to do changes, don't want to change the version but want to export it (e.g. when editing with set release date) you will have to set the variables manually to the current state. if you cancel the initial request the file will be saved without version control.
you can archive the document without code to avoid any accidential changes. the file name will be followed by the version number.
you can publish the document as an uneditable pdf file (but you could implement editable field with third party application).
afterwards on selecting the list of documents in force, the file will either add itself to the list or update its version, release date and number of pages.
 
## internal documents in force.xlsm
this list contains all documents in force, a link to the documents and the possiblity to assign their special task in fullfilling regulatory requirements. the docm-documents will register themselves in sheet one on their individual save. you can assign alternate search terms and checkpoints to the document. sheet two contains these checkpoints and all the assigned documents. in this way you can see directly if you match all checkpoints.

*as the docm-files register and update themselves, there is no checkout for documents that expire or go out of use. you will have to delete these lines manually*

you can assign the documents to bundles in the third sheet where you have special use cases to use some of the documents everytime. this works similar to the assignment matrix for checkpoints. you can choose from your own documents or insert different paths to external files.

on save the list of checkpoints will update (for the dropdown option in assigning in sheet one) and all documents assigned will be written beside the checkpoints in sheet two. checkpoints on sheet one will be considered based on the header row. the list of documents for bundle assignment updates itself (insertion and deletion) and the bundles will be written like in the first sheets.
you will be prompted for exports. first step is to export the list without code for your colleagues without the risk of them messing something up. you will have to input paths to be replaced and the equivalent insertions. you can set default paths for export and replacements within the code to speed these things up. docm-links will be replaced with pdf-links and the document bundle matrix will be updated with links as well. *the resulting file might work as your backup plan in case the assistant is broken. or you do not want to use it ( not recommended ;) )* 
afterwards you can export the list of documents as well as the document bundles to the assistant. if you skip the first prompts the replace/insertion path will be asked for later. as long as the file is open the inputs will be remembered.

## external documents in force.xlsm
this list contains external documents in force and can contain other file lists. beside having them registered you can export these as well to the assistant on saving. while inserting links as registration there might be relative paths. this can be tweaked within the code where you can assign replacements to tidy things up. adding another sheet of file categories is easily done by adding another collection within the code, alter the sheet name and pass the collection to the export sub. remember to register the data-export to the assistants module as well. you can define alternative search terms as well as descriptions to filenames or urls to be displayed in the assistant in case the original files and urls lack a meaningful name.

## stocklist.xlsm
the stocklist might contain all products and materials that have permission from the companies head. i am aware there are better solutions for stock administration but by time of writing my own companies software is worse than using excel for that. so this *is* an advance. the export function on save makes the list accessible and searchable for all employees using the assistant hence optimizing dialogue with inventory control. excel might freeze on export if the list contains 6k+ items, but it just takes some time, so no worries.

## ticketorder.xlsm
this files purpose is purely for translation. it serves as an interface between your erp-software with item orders and the assistant. basically you can insert any data dump by the erp-software and it translates it to a javascript-object-file as a feedback loop for the tickerorder-module within the assistant. it makes sense to contain the generated ticket-ids within the order process in any field that might be dumped by the output. this definitely  has an effect on yout order process but might make communication more easy between inventory control and ordering persons.
*be aware that the pattern recognizing regexes in the imported vb_library/administration_Locals_XX.vba rely absolutely on the generated data by your erp-software and have to be customized to your individual situation!*

## audit planner.xlsm
the audit planner can be filled with a question set for internal audits. by exporting the list to the assistant the question set can be used to generate or customize the annual questionnaire (to the relief of the quality manager) and becomes accessible to the employees to reduce obstructions due to regulatory vocabulary.

*please be aware that there are dependencies between column numbers and entries and the assistants filter function. the excel-list will be displayed in the same way within the assistant in the first place.*

## thoughts and considerations
on export of files to pdf the file dialogue does not show pdf files. you will be asked to provide a file name with default docm-extension that will be changed automatically. this is due to the fact that vba `Application.FileDialog(msoFileDialogSaveAs)` does not support `.Filter`. existant files will not be displayed and just be overwritten.