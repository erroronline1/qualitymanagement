Attribute VB_Name = "Locals"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
' customize this collection to your language requirements and your structure of the excel sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
Private Const monitorRowsTitle As String ="I do not recommend!"
Private Const monitorRowsPrompt As String ="The deletion or insertion of rows affects the conditional format and should be avoided. Are you aware of what you are doing and want to proceed anyway?"
Private Const monitorColumnsTitle As String ="I do not recommend!"
Private Const monitorColumnsPrompt As String ="The deletion or insertion of columns affects the VBA-code and should be avoided. In case you proceed you will have to change on both sides.  Are you aware of what you are doing and want to proceed anyway?"

Public Function setupAuditPlanner() As Collection
    Set setupAuditPlanner = New Collection
    setupAuditPlanner.Add Item:="AUDITPLANNER", Key:="matrix.sheet" 'select sheet to process content
    setupAuditPlanner.Add "A", "matrix.startColumn" 'customize content column, starting point for matrix
    setupAuditPlanner.Add 2, "matrix.headerRow" 'customize header row, starting point for matrix
    setupAuditPlanner.Add Null, "matrix.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupAuditPlanner.Add "E:\Quality Management\assistant\library\module.data\auditplanner.js", "export.defaultFile" 'default path to export file
    setupAuditPlanner.Add "Export list to the assistant?", "export.prompt" 'save dialogue header, customize to your language
    setupAuditPlanner.Add "auditplanner_data", "export.objectName" 'name of json-object
    setupAuditPlanner.Add False, "export.dontSkipEmpty" 'whether to skip empty cells or not depending on structure of assistants processing algorithm
    setupAuditPlanner.Add "3", "m.contentcolumn" 'customize query column (numbered), output only if content is set
End Function
Public Function monitorAuditPlanner() As Collection
    Set monitorAuditPlanner = New Collection
    monitorAuditPlanner.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorAuditPlanner.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function


Public Function setupStocklist() As Collection
    Set setupStocklist = New Collection
    setupStocklist.Add Item:="ARTICLEMANAGER", Key:="matrix.sheet" 'select sheet to process content
    setupStocklist.Add "A", "matrix.startColumn" 'customize content column, starting point for matrix
    setupStocklist.Add 1, "matrix.headerRow" 'customize header row, starting point for matrix
    setupStocklist.Add Null, "matrix.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupStocklist.Add "E:\Quality Management\assistant\library\module.data\stocklist.js", "export.defaultFile" 'default path to export file
    setupStocklist.Add "Export list to the assistant?", "export.prompt" 'save dialogue header, customize to your language
    setupStocklist.Add "stocklist_data", "export.objectName" 'name of json-object
    setupStocklist.Add True, "export.dontSkipEmpty"'whether to skip empty cells or not depending on structure of assistants processing algorithm
    setupStocklist.Add "3", "m.contentcolumn" 'customize query column (numbered), output only if content is set
End Function
Public Function monitorStocklist() As Collection
    Set monitorStocklist = New Collection
    monitorStocklist.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorStocklist.Add Array(False, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function


Public Function setupTransferSchedule() As Collection
    Set setupTransferSchedule = New Collection
    setupTransferSchedule.Add "Legend", "matrix.maxRow"
    setupTransferSchedule.Add "Workmatrix could not be determinated, missing keyword >Legend< in column A." & vbnewline & vbnewline & "processing aborted.", "matrix.error"	
    setupTransferSchedule.Add "Export PDF?", "initiate.Title"
    setupTransferSchedule.Add "Publish plan?" & vbNewLine & "CAUTION! If destination file is already opened Excel will crash.", "initiate.Confirm"
    setupTransferSchedule.Add "Publish PDF of transfer schedule?", "export.xlsPrompt"
    setupTransferSchedule.Add "E:\Quality Managment\thirdType\Transferschedule.pdf", "export.xlsDefaultFile"
End Function
Public Function monitorTransferSchedule() As Collection
    Set monitorTransferSchedule = New Collection
    monitorTransferSchedule.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorTransferSchedule.Add Array(False, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function


Public Function setupTicketSystem() As Collection
    Set setupTicketSystem = New Collection
    setupTicketSystem.Add Item:="TICKETS", Key:="matrix.sheet" 'select sheet to process content
    setupTicketSystem.Add "A", "matrix.startColumn" 'customize content column, starting point for matrix
    setupTicketSystem.Add 1, "matrix.headerRow" 'customize header row, starting point for matrix
    setupTicketSystem.Add Null, "matrix.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupTicketSystem.Add "E:\Quality Management\assistant\library\module.data\ticketorder.js", "export.defaultFile" 'default path to export file
    setupTicketSystem.Add "Export List to the assistant?", "export.prompt" 'save dialogue header, customize to your language
    setupTicketSystem.Add "ticketorder_data", "export.objectName" 'name of json-object
    setupTicketSystem.Add false, "export.dontSkipEmpty"'whether to skip empty cells or not depending on structure of assistants processing algorithm
    setupTicketSystem.Add "1", "m.contentcolumn" 'customize query column (numbered), output only if content is set
    setupTicketSystem.Add "Data successfully exported. The table has been cleared for next use.", "export.success" 'success message
    setupTicketSystem.Add "There was no data available!", "export.error" 'error message setupTicketSystem.Add "Beleg Nummer", "header.column1" 'column header for filtered column
    setupTicketSystem.Add "Order record", "header.column1" 'column header for filtered column
    setupTicketSystem.Add "Ordered on", "header.column2" 'column header for filtered column
    setupTicketSystem.Add "Item description", "header.column4" 'column header for filtered column
    setupTicketSystem.Add "Delivered on", "header.column5" 'column header for filtered column
    setupTicketSystem.Add "Ordered amount", "header.column7" 'column header for filtered column
    setupTicketSystem.Add "Delivered Amount", "header.column8" 'column header for filtered column
    setupTicketSystem.Add "Backlog amount", "header.column9" 'column header for filtered column
End Function
Public Function monitorTicketSystem() As Collection
    Set monitorTicketSystem = New Collection
    monitorTicketSystem.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorTicketSystem.Add Array(False, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function
Public Function TicketSystemPattern(byVal columnNumber As String) as String
    ' these regex patterns are strongly dependent on your erp-data. structure of development platform looked like _
    [null]  [orderRecordNumber, 2020-02-05 00:00:00.0]  [vendorCode, iDontKnow]  [iDontKnow, something something item description]  [deliverDate]  [null]  [1.0]  [0.0]  [1.0]  [unitCode]  [iDontKnow]  [null]  [iDontCare] _
    containing encrypted ids for vendor, package size, etc. that are of too little importance to be extensive decrypted _
    this will have to be customized to your erp-system. case numbers according to table columns
    Select Case columnNumber
        Case 2 'extract order date                  
            TicketSystemPattern = "\[(.+?),(.+?)\]"
        Case 4 'extract item description
            TicketSystemPattern = "\[.+?,(.+?)\]"
        Case 5 'extract delivery date
            TicketSystemPattern = "\[(.*?)\]"
        Case 7 'extract ordered number
            TicketSystemPattern = "\[(.*?)\]"
        Case 8 'extract deliveres number
            TicketSystemPattern = "\[(.*?)\]"
        Case 9 'extract delivery difference
            TicketSystemPattern = "\[(.*?)\]"
        Case Else
            TicketSystemPattern = ""
    End Select
End Function


Public Function setupExternalExport() As Collection
    Set setupExternalExport = New Collection
    setupExternalExport.Add Item:="Export lists to the assistant?", Key:="initiate.Confirm" 'query to export
    setupExternalExport.Add "Export lists to the assistant?", "initiate.Title" 'title for query to export
    setupExternalExport.Add "Publish a copy of the list without code?", "export.xlsPrompt"
    setupExternalExport.Add "E:\Quality Management\published\list of external documents.xlsx", "export.xlsDefaultFile"
End Function
Public Function setupExternalDocuments() As Collection
    Set setupExternalDocuments = New Collection
    setupExternalDocuments.Add Item:="DocumentList", Key:="matrix.sheet" 'select sheet to process content
    setupExternalDocuments.Add "B", "matrix.displayColumn" 'customize column, taking displayed document name from for norm checking
    setupExternalDocuments.Add "B", "matrix.linkColumn" 'customize link column, processing file links for export
    setupExternalDocuments.Add "C", "matrix.displayAlternativeColumn" 'customize column for alternative display name
    setupExternalDocuments.Add "D", "matrix.searchTermColumn" 'customize column for search terms
    setupExternalDocuments.Add 3, "matrix.headerRow" 'customize header row, starting point for matrix
    setupExternalDocuments.Add Null, "matrix.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    'export variables
    setupExternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentlookup_ext.js", "export.defaultFile"
    setupExternalDocuments.Add "documentlookup_ext_data", "export.objectName"
    setupExternalDocuments.Add "Export list of external documents to the assistant?", "export.prompt"
    setupExternalDocuments.Add "Aborting export as there was no location selected!", "export.ErrorMsg"
End Function
Public Function setupExternalContracts() As Collection
    Set setupExternalContracts = New Collection
    setupExternalContracts.Add Item:="Contracts", Key:="matrix.sheet" 'select sheet to process content
    setupExternalContracts.Add "B", "matrix.displayColumn" 'customize column, taking displayed document name from for norm checking
    setupExternalContracts.Add "B", "matrix.linkColumn" 'customize link column, processing file links for export
    setupExternalContracts.Add "C", "matrix.displayAlternativeColumn" 'customize column for alternative display name
    setupExternalContracts.Add "D", "matrix.searchTermColumn" 'customize column for search terms
    setupExternalContracts.Add 3, "matrix.headerRow" 'customize header row, starting point for matrix
    setupExternalContracts.Add Null, "matrix.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns   
    'export variables
    setupExternalContracts.Add "E:\Quality Management\published\assistant\library\module.data\documentlookup_contract.js", "export.defaultFile"
    setupExternalContracts.Add "documentlookup_contract_data", "export.objectName"
    setupExternalContracts.Add "Export list of external contracts to the assistant?", "export.prompt"
    setupExternalContracts.Add "Aborting export as there was no location selected!", "export.ErrorMsg"
End Function
Public Function monitorExternalDocuments() As Collection
    Set monitorExternalDocuments = New Collection
    monitorExternalDocuments.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorExternalDocuments.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function


Public Function setupInternalDocuments() As Collection
    Set setupInternalDocuments = New Collection
    setupInternalDocuments.Add Item:="DocumentList", key:="documentlist.sheet" 'select sheet to process content
    setupInternalDocuments.Add "A", "documentlist.novelColumn" 'customize column, mark novel versions prior to publishing public list
    setupInternalDocuments.Add "B", "documentlist.displayColumn" 'customize column, taking displayed document name from for norm checking
    setupInternalDocuments.Add "C", "documentlist.versionColumn" 'customize column, taking displayed document version for email notification
    setupInternalDocuments.Add "D", "documentlist.linkColumn" 'customize link column, processing file links for export
    setupInternalDocuments.Add "E", "documentlist.documentFormat" 'customize column for published file types for the assistant, processing file links for export
    setupInternalDocuments.Add "F", "documentlist.searchTermColumn" 'customize column for additional search terms for the assistant, processing file links for export
    setupInternalDocuments.Add "G", "documentlist.startColumn" 'customize column, starting point for matrix for norm checking
    setupInternalDocuments.Add 2, "documentlist.headerRow" 'customize header row, starting point for matrix
    setupInternalDocuments.Add Null, "documentlist.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupInternalDocuments.Add Null, "documentlist.maxRows" 'customize last row, ending point for matrix, null value considers all rows output columns
    setupInternalDocuments.Add "documents", "documentlist.rangeName" 'range name for selection in bundle assignment
    
    setupInternalDocuments.Add "Checkpoints", "normcheck.sheet" 'select sheet to process content for checking norm
    setupInternalDocuments.Add "A", "normcheck.startColumn" 'customize column starting point to check against
    setupInternalDocuments.Add "2", "normcheck.headerRow" 'customize row starting point to check against
    setupInternalDocuments.Add "Norm", "normcheck.rangeName" 'range name for selection in norm assignment
    
    setupInternalDocuments.Add "DocumentBundles", "bundles.sheet" 'select sheet to process bundle assignment
    setupInternalDocuments.Add "A", "bundles.displayColumn" 'customize column, taking displayed name for bundle title
    setupInternalDocuments.Add "B", "bundles.startColumn" 'customize column, starting point for matrix for bundle definitions
    setupInternalDocuments.Add "2", "bundles.headerRow" 'intentionally string, customize NUMBER of headerrow as starting point for exporting the code free excel file
    setupInternalDocuments.Add "EXCEPTIONS", "bundles.exceptionHeader" 'customize header TITLE, starting point for matrix for exceptional bundle definitions
        'ok. quick and dirty: the first exceptional row is for no_serial_print, the second for additional documents. _
        this is hard coded as i have currently no idea how to handle this in terms of elegance, user friendlyness and multi language support _
        feel free to modify within the bundleExport-sub
    setupInternalDocuments.Add "DOCUMENTBUNDLES", "bundles.bundleHeader" 'customize header title, starting point for matrix for standard bundle definitions
    setupInternalDocuments.Add Null, "bundles.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupInternalDocuments.Add Null, "bundles.maxRows" 'customize last row, ending point for matrix, null value considers all rows output columns
        
    'export variables
    setupInternalDocuments.Add "documentlookup_int_data", "export.objectName" 'name of json-object
    setupInternalDocuments.Add "Provide content to external view?", "initiate.Title"
    setupInternalDocuments.Add "Save copy without code," & vbNewLine & _
            "export list of documents to the assistant," & vbNewLine & _
            "export document bundles to the assistant?", "initiate.Confirm"
    'document list
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentlookup_int.js", "export.listdefaultFile"
    setupInternalDocuments.Add "Export list to the assistant?", "export.listPrompt"
    setupInternalDocuments.Add "Input path of docm-files...", "export.replaceFromTitle"
    setupInternalDocuments.Add "Please input path of docm-files that will be replaced with the next input.", "export.replaceFromPrompt"
    setupInternalDocuments.Add "E:\Quality Management\documents", "export.replaceFromDefaultPath"
    setupInternalDocuments.Add "Input path of pdf-files...", "export.replaceToTitle"
    setupInternalDocuments.Add "Please input path of docm-files that will replace the path of the docm-files.", "export.replaceToPrompt"
    setupInternalDocuments.Add "E:\Quality Management\published", "export.replaceToDefaultPath"
    setupInternalDocuments.Add "Aborting export as there was no location selected!", "export.ErrorMsg"
    'document bundles
    setupInternalDocuments.Add "Export bundles to the assistant?", "export.bundlePrompt"
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentbundles.js", "export.bundleDefaultFile"
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\", "export.bundleDefaultFolder"
    'export without code
    setupInternalDocuments.Add "Publish a copy of the list without code?", "export.xlsPrompt"
    setupInternalDocuments.Add "E:\Quality Management\published\list of documents.xlsx", "export.xlsDefaultFile"
    setupInternalDocuments.Add "New document versions", "export.notificationSubject"
    setupInternalDocuments.Add "Hello everyone,<br><br>following documents have a new version as of today:<br><br>{list}<br>Please cease to use old versions and destroy printouts!", "export.notificationBody"
End Function
Public Function monitorInternalDocuments() As Collection
    Set monitorInternalDocuments = New Collection
    monitorInternalDocuments.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorInternalDocuments.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function

    
Public Function setupDRM() As Collection
    Set setupDRM = New Collection
    setupDRM.Add Item:="DRM", key:="drm.sheet" 'select sheet to process content
    setupDRM.Add "A", "drm.nameColumn" 'customize column, taking displayed name for bundle title
    setupDRM.Add "B", "drm.hashColumn" 'customize column, starting point for matrix for bundle definitions
    setupDRM.Add "2", "drm.headerRow" 'intentionally string, customize NUMBER of headerrow as starting point for exporting the code free excel file
    setupDRM.Add Null, "drm.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupDRM.Add Null, "drm.maxRows" 'customize last row, ending point for matrix, null value considers all rows output columns
    'export variables
    setupDRM.Add "Export permissions to the assistant?", "initiate.Title"
    setupDRM.Add "Export password tables?", "initiate.Confirm"
    setupDRM.Add "E:\Quality Management\assistant\library\core\core.drm.js", "export.defaultFile"
    setupDRM.Add "Export permissions to the assistant?", "export.prompt"
    setupDRM.Add "Aborting export as there was no location selected!", "export.ErrorMsg"
End Function
Public Function monitorDRM() As Collection
    Set monitorDRM = New Collection
    monitorDRM.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorDRM.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns" 
End Function


Public Function setupVendorList() As Collection
    Set setupVendorList = New Collection
    ' export values
    setupVendorList.Add "Export of vendor list?", "export.confirmTitle" 'title for query to export
    setupVendorList.Add "Publish a copy of the vendor list?", "export.confirm" 'query to export
    setupVendorList.Add "Publish a copy of the list without code?", "export.xlsPrompt"
    setupVendorList.Add "E:\Quality Management\published\vendor list.xlsx", "export.xlsDefaultFile"
    'runtime values
    setupVendorList.Add "A double click on the documents to demand automatically creates an email with a fitting request to the vendor. " & vbNewLine & _
            "The date of the request will be inserted on sent-confirmation." & vbNewLine & vbNewLine & _
            "Changing the cells values in this column is possible through the edit bar only. " & vbNewLine & _
            "On maintaining the list values on requested documents should be meaningful and appropriate." & vbNewLine & _
            "Editing still is possible at any time." & vbNewLine & vbNewLine & _
            "Changing columns and / or rows might make changes on the macro and the conditional formatting a necessity. Be careful about that!" _
            , "runtime.prompt" 'hint on startup
    setupVendorList.Add "Has the email been sent?", "runtime.mailSent" 'confirmation query on sending email manually demanding documents
    setupVendorList.Add "dd.mm.yyyy", "runtime.dateFormat" 'date format to populate last-demand-field with
    setupVendorList.Add "You lack write permissions. Changes will not be saved. Plase contact your responsible personnel", "runtime.writeError" 'warning on missing write permissions
    setupVendorList.Add "Missing email-adress. Please enter email-adress (and customer id) in the vendor list.", "runtime.missingRcptError" 'warning if email-adress is missing
    setupVendorList.Add "This vendor is not (anymore) in the vendor list!", "runtime.illegalVendorError" 'warning if vendor is not found in the vendor-sheet, e.g. gone out of business or sorted out 
    ' vendor tracing value
    setupVendorList.Add "VendorList", "vendor.sheetName" 'select sheet to process content
    setupVendorList.Add "3", "vendor.rowOffset" 'customize row, where contents start 
    setupVendorList.Add "A", "vendor.vendorColumn" 'customize column for vendor names
    setupVendorList.Add "F", "vendor.documentColumn" 'customize column for documents to demand manually
    setupVendorList.Add "G", "vendor.dateColumn" 'customize column to populate with latest request
    setupVendorList.Add "H", "vendor.downloadColumn" 'customize column with automated document types
    setupVendorList.Add "I", "vendor.customerColumn" 'customize column with your customer id for respective vendors
    setupVendorList.Add "J", "vendor.rcptColumn" 'customize column with email-adress of respective vendors
    setupVendorList.Add "Document request for {documents}", "vendor.mailSubject" 'subject for request-mail, {documents} will be replaced according to vendor.documentColumn
    setupVendorList.Add "Dear Madam or Sir,<br /><br />" & _
            "to be able to declare a conformity regarding ISO 13485 on our medical devices, " & _
            "we must be able to show the necessary certificates and documents in the course of our quality management system. " & _
            "{download} that we already got from you in the past. We need documents regarding<br /><br /><i>{documents}</i><br /><br />" & _
            "for one or some products we obtained from you, or your company in general. " & _
            "{customer}We are happy to receive the documents in a timely manner by email to " & _
            "<a href=""mailto:mail@company.tld"">mailto:mail@company.tld</a>, by postal service or fax to the following adress or fax-number. " & _
            "If in the meantime the documents are available on your website kindly inform us about the location. " & _
            "<br /><br />With kind regards<br /><br />" & _
            "Company<br />" & _
            "Street<br />" & _
            "City<br />" & _
            "Phone<br />" & _
            "Fax" & _
            "<br /><br /><small>This is an automatic produced letter.</small>" _
            , "vendor.mailBody" 'body for request-mail, {documents}, {download} and {customer} will be conditionally replaced with following chunks
    setupVendorList.Add "We were already able to obtain some of your documents from your website. Unfortunately, some document are still missing, ", "vendor.ifDownload" 'if some documents can be downloaded
    setupVendorList.Add "We kindly ask you to provide us with the necessary documents, ", "vendor.ifNotDownload" 'if no documents can be downloaded
    setupVendorList.Add "Our customer id is: {customer}<br />", "vendor.ifCustomer" 'if customer id for respective vendor is given
    setupVendorList.Add "Everything seems to be there already?!", "vendor.noDemand" 'if documents id empty or populated with a dash
    ' material tracing values
    setupVendorList.Add "MaterialTracing", "material.sheetName" 'select sheet to process content
    setupVendorList.Add "6", "material.rowoffset" 'customize row, where contents start 
    setupVendorList.Add "A", "material.materialColumn" 'customize column for material names and order ids
    setupVendorList.Add "B", "material.vendorColumn" 'customize column for vendor names
    setupVendorList.Add "D", "material.documentColumn" 'customize column for documents to demand manually
    setupVendorList.Add "E", "material.dateColumn" 'customize column to populate with latest request
    setupVendorList.Add "{documents} for {material}", "material.mailSubject" '{documents} and {material} will be replaced according to material.documentColumn and .materialColumn
    setupVendorList.Add "Dear Madam or Sir,<br /><br />" & _
            "to be able to declare a conformity regarding ISO 13485 on our medical devices, " & _
            "we must be able to show the necessary certificates and documents in the course of our quality management system. " & _
            "{evidence}We prefer one of the following evidence documents:<br /><ul>" & _
            "<li>Proof of biocompatibility according to ISO 10993,</li>" & _
            "<li>Declaration of Conformity according to ISO 13485,</li>" & _
            "<li>Proof of negative cytotoxiticity and cancerogeniticity by accredited laboratories</li>" & _
            "</ul>" & _
            "{customer}In case you do not provide the documents of proof yourself we accept documents provided by your distributor " & _
            "with a declaration by you that your trade name correspondents to the respective product. " & _
            "Please consider any of your customers appreciates a topicality of your documents being not older than 5 years. " & _
            "We are happy to receive the documents in a timely manner by email to " & _
            "<a href=""mailto:mail@company.tld"">mailto:mail@company.tld</a>, by postal service or fax to the following adress or fax-number. " & _
            "If in the meantime the documents are available on your website kindly inform us about the location. " & _
            "<br /><br />With kind regards<br /><br />" & _
            "Company<br />" & _
            "Street<br />" & _
            "City<br />" & _
            "Phone<br />" & _
            "Fax" & _
            "<br /><br /><small>This is an automatic produced letter. We apologize for the inconvenience in case you receive multiple requests for different products.</small>" _
            , "material.mailBody" 'body for request-mail, {evidence} and {customer} will be condidionally replaced with following/preceding chunks
    setupVendorList.Add "Proof of material safety", "material.defaultEvidence" 'default if no document types are given yet
    setupVendorList.Add "In the past we received <br /><br /><i>{documents} for {material}</i><br /><br /> and kindly ask you for sending current documents. ", "material.ifDocuments" 'if document types are given, {documents} and {material will be replaced}
    setupVendorList.Add "We kindly asko you the send current <i>proof of material safety for {material}</i>.<br /><br />", "material.ifNotDocuments" 'if no document types are given yet, {material} will be replaced
    setupVendorList.Add "Missing vendor!", "material.missingVendorError" 'warning if material misses vendor assignment
End Function
Public Function monitorVendorList() As Collection
    Set monitorVendorList = New Collection
    monitorVendorList.Add Array(True, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorVendorList.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function