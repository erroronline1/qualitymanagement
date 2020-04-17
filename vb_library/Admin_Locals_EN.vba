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

Public Function setupTransferSchedule() As Collection
    Set setupTransferSchedule = New Collection
	setupTransferSchedule.Add "Legend", "matrix.maxRow"
	setupTransferSchedule.Add "Workmatrix could not be determinated, missing keyword >Legend< in column A." & vbnewline & vbnewline & "processing aborted.", "matrix.error"	
	setupTransferSchedule.Add "Export PDF?", "initiate.Title"
	setupTransferSchedule.Add "Publish plan?" & vbNewLine & "CAUTION! If destination file is already opened Excel will crash.", "initiate.Confirm"
    setupTransferSchedule.Add "PDF des Ausbildungsplanes bei den Nachweisdokumenten bereitstellen?", "export.xlsPrompt"
    setupTransferSchedule.Add "E:\Quality Managment\thirdType\Transferschedule.pdf", "export.xlsDefaultFile"
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

Public Function setupInternalDocuments() As Collection
    Set setupInternalDocuments = New Collection
    setupInternalDocuments.Add Item:="DocumentList", key:="documentlist.sheet" 'select sheet to process content
    setupInternalDocuments.Add "B", "documentlist.displayColumn" 'customize column, taking displayed document name from for norm checking
    setupInternalDocuments.Add "E", "documentlist.linkColumn" 'customize link column, processing file links for export
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
            "export document bundles to the assistant?" & vbNewLine & vbNewLine & _
            "It is not recommended to execute this step in context of document registration!", "initiate.Confirm"
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
End Function