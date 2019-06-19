# one word or three to the core documents use

these are microsoft office documents with some vba-macro code implemented

## template_file.docm
this is the main template containing the macro for self version control and self registration. edit the variables on the start of the macro to your language settings and documentation structure.
there are three important and processed fields within the document:
* title, which is updated on load of the file
* version and release date

the field for page numbering is of no importance to the macro and can be deleted or moved. on saving you are asked if you want to update the version number and rlease date. you can set these automatically to the next version and the current date or set it manually. in either cases you will be processed through archiving, publishing and registering the document in der list of documents in force. if you have to do changes, don't want to change the version but want to export it (e.g. when editing with set release date) you will have to set the variables manually to the current state. if you cancel the initial request the file will be saved without version control.
you can archive the document without macros to avoid any accidential changes. the file name will be followed by the version number.
you can publish the document as an uneditable pdf file (but you could implement editable field with third party application).
afterwards on selecting the list of documents in force, the file will either add itself to the list or update its version, release date and number of pages.
 
## internal documents in force.xlsm
this list contains all documents in force, a link to the documents and the possiblity to assign their special task in fullfilling regulatory requirements. in sheet one the docm-documents will register themselves. you can assign checkpoints to the document. sheet two contains these checkpoints and all the assigned documents. in this way you can see directly if you match all checkpoints.

*as the docm-files register and update themselves, there is no checkout for documents that expire or go out of use. you will have to delete these lines manually*

on save the list of checkpoints will update (for the dropdown option in assigning in sheet one) and all documents assigned will be written beside the checkpoints in sheet two. checkpoints on cheet one will be considered based on the header row.
afterwards you can export the list of documents to the assistant. as the links for the files are processed for that you will have to input paths to be replaced and the equivalent insertions. you can set default paths for export and replacements within the macro to speed these things up.

## external documents in force.xlsm
this list contains external documents in force. beside having them registeres you can export these as well to the assistant on saving. while inserting links as registration there might be relative paths. this can be tweaked within the macro where you can assign replacements to tify things up.

## stocklist.xlsm
the stocklist might contains all products and materials that have permission from the companies head. i am aware there are better solutions for stock administration but by time of writing my own companies software is worse than using excel for that. so this *is* an advance. the export function on save makes the list accessible and searchable for all employees using the assistant hence optimizing dialogue with inventory control.

*please be aware that there are dependencies between column numbers and entries and the assistants filter function. the excel-list will be displayed in the same way within the assistant in the first place.*