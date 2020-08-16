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
    setupAuditPlanner.Add "Liste für Assistenten bereitstellen?", "export.prompt" 'save dialogue header, customize to your language
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
    setupStocklist.Add "Liste für Assistenten bereitstellen?", "export.prompt" 'save dialogue header, customize to your language
    setupStocklist.Add "stocklist_data", "export.objectName" 'name of json-object
    setupStocklist.Add True, "export.dontSkipEmpty"'whether to skip empty cells or not depending on structure of assistants processing algorithm
    setupStocklist.Add "3", "m.contentcolumn" 'customize query column (numbered), output only if content is set
End Function

Public Function setupTransferSchedule() As Collection
    Set setupTransferSchedule = New Collection
	setupTransferSchedule.Add "Legende", "matrix.maxRow"
	setupTransferSchedule.Add "Verarbeitungsmatrix konnte nicht ermittelt werden, es fehlt das Stichwort >Legende< in Spalte A." & vbnewline & vbnewline & "Vorgang abgebrochen.", "matrix.error"	
	setupTransferSchedule.Add "PDF exportieren?", "initiate.Title"
	setupTransferSchedule.Add "Soll der Plan als PDF exportiert werden?" & vbNewLine & "ACHTUNG! Sollte die Datei bereits geöffnet sein wird Excel abstürzen.", "initiate.Confirm"
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
    setupTicketSystem.Add "Liste für Assistenten bereitstellen?", "export.prompt" 'save dialogue header, customize to your language
    setupTicketSystem.Add "ticketorder_data", "export.objectName" 'name of json-object
    setupTicketSystem.Add false, "export.dontSkipEmpty"'whether to skip empty cells or not depending on structure of assistants processing algorithm
    setupTicketSystem.Add "1", "m.contentcolumn" 'customize query column (numbered), output only if content is set
    setupTicketSystem.Add "Daten wurden bereitgestellt und die Tabelle zur nächsten Verwendung geleert.", "export.success" 'success message
    setupTicketSystem.Add "Es waren keine Daten verfügbar!", "export.error" 'error message
    setupTicketSystem.Add "Beleg Nummer", "header.column1" 'column header for filtered column
    setupTicketSystem.Add "Bestellt am", "header.column2" 'column header for filtered column
    setupTicketSystem.Add "Artikel", "header.column4" 'column header for filtered column
    setupTicketSystem.Add "Geliefert am", "header.column5" 'column header for filtered column
    setupTicketSystem.Add "Bestellte Menge", "header.column7" 'column header for filtered column
    setupTicketSystem.Add "Gelieferte Menge", "header.column8" 'column header for filtered column
    setupTicketSystem.Add "Warenrückstand", "header.column9" 'column header for filtered column
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
    setupExternalExport.Add Item:="Listen für den Assistenten bereitstellen?", Key:="initiate.Confirm" 'query to export
    setupExternalExport.Add "Listen veröffentlichen?", "initiate.Title" 'title for query to export
    setupExternalExport.Add "Kopie der Liste ohne Code bereitstellen?", "export.xlsPrompt"
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
    setupExternalDocuments.Add "Liste der externen Dokumente für den Assistenten bereitstellen?", "export.prompt"
    setupExternalDocuments.Add "Export abgebrochen, es wurde keine Zieldatei gewählt.", "export.ErrorMsg"
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
    setupExternalContracts.Add "Liste der externen Verträge für den Assistenten bereitstellen?", "export.prompt"
    setupExternalContracts.Add "Export abgebrochen, es wurde keine Zieldatei gewählt.", "export.ErrorMsg"
End Function

Public Function setupInternalDocuments() As Collection
    Set setupInternalDocuments = New Collection
    setupInternalDocuments.Add Item:="DocumentList", key:="documentlist.sheet" 'select sheet to process content
    setupInternalDocuments.Add "B", "documentlist.displayColumn" 'customize column, taking displayed document name from for norm checking
    setupInternalDocuments.Add "D", "documentlist.linkColumn" 'customize link column, processing file links for export
    setupInternalDocuments.Add "E", "documentlist.searchTermColumn" 'customize column for additional search terms for the assistant, processing file links for export
    setupInternalDocuments.Add "F", "documentlist.startColumn" 'customize column, starting point for matrix for norm checking
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
    setupInternalDocuments.Add "Inhalte veröffentlichen?", "initiate.Title"
    setupInternalDocuments.Add "Kopie der Liste ohne Code bereitstellen," & vbNewLine & _
            "Liste der Dokumente för den Assistenten bereitstellen," & vbNewLine & _
            "Dokumentenpakete für den Assistenten bereitstellen??" & vbNewLine & vbNewLine & _
            "Es wird nicht empfohlen die Bereitstellung im Rahmen der Dokumentenregistrierung durchzuführen!", "initiate.Confirm"
    'document list
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentlookup_int.js", "export.listdefaultFile"
    setupInternalDocuments.Add "Liste interner Dokumente für den Assistenten bereitstellen?", "export.listPrompt"
    setupInternalDocuments.Add "Dateipfad für DOCM-Dateien...", "export.replaceFromTitle"
    setupInternalDocuments.Add "Bitte den Pfad der DOCM-Dateien angeben der durch die nächste Eingabe ersetzt werden soll.", "export.replaceFromPrompt"
    setupInternalDocuments.Add "E:\Quality Management\documents", "export.replaceFromDefaultPath"
    setupInternalDocuments.Add "Dateipfad für PDF-Dateien...", "export.replaceToTitle"
    setupInternalDocuments.Add "Bitte den Pad der PDF-Dateien Angeben, der den Pfad der DOCM-Dateien ersetzt..", "export.replaceToPrompt"
    setupInternalDocuments.Add "E:\Quality Management\published", "export.replaceToDefaultPath"
    setupInternalDocuments.Add "Export abgebrochen, es wurde keine Zieldatei gewählt.", "export.ErrorMsg"
    'document bundles
    setupInternalDocuments.Add "Dokumentenpakete für den Assistenten bereitstellen?", "export.bundlePrompt"
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentbundles.js", "export.bundleDefaultFile"
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\", "export.bundleDefaultFolder"
    'export without code
    setupInternalDocuments.Add "Excel-Datei ohne Code veröffentlichen?", "export.xlsPrompt"
    setupInternalDocuments.Add "E:\Quality Management\published\list of documents.xlsx", "export.xlsDefaultFile"
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
    setupDRM.Add "Rechte für den Assistenten bereitstellen?", "initiate.Title"
    setupDRM.Add "Kennwörtertabelle exportieren?", "initiate.Confirm"
    setupDRM.Add "E:\Quality Management\assistant\library\core\core.drm.js", "export.defaultFile"
    setupDRM.Add "Liste der Rechte für den Assistenten bereitstellen?", "export.prompt"
    setupDRM.Add "Export abgebrochen, es wurde keine Zieldatei gewählt.", "export.ErrorMsg"
End Function