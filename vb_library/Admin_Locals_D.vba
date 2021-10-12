Attribute VB_Name = "Locals"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|   by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
' customize this collection to your language requirements and your structure of the excel sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
Private Const monitorRowsTitle As String ="Kann ich nicht empfehlen!"
Private Const monitorRowsPrompt As String ="Das Einfügen oder Löschen von Zeilen hat Auswirkungen auf die bedingte Formatierung und sollte dringend vermieden werden. Weißt Du was du tust und willst dennoch fortfahren?"
Private Const monitorColumnsTitle As String ="Kann ich nicht empfehlen!"
Private Const monitorColumnsPrompt As String ="Das Einfügen oder Löschen von Spalten hat Auswirkungen auf die allgemeine Funktion der VBA-Programmierung und sollte dringend vermieden werden. Wenn Du weiter machst muss beides geändert werden. Weißt Du was du tust und willst dennoch fortfahren?"

Public Function setupAuditPlanner() As Collection
    Set setupAuditPlanner = New Collection
    setupAuditPlanner.Add Item:="AUDITPLANNER", Key:="matrix.sheet" 'select sheet to process content
    setupAuditPlanner.Add "A", "matrix.startColumn" 'customize content column, starting point for matrix
    setupAuditPlanner.Add 2, "matrix.headerRow" 'customize header row, starting point for matrix
    setupAuditPlanner.Add Null, "matrix.maxColumns" 'customize last column, ending point for matrix, null value considers all columns regarding filled header columns
    setupAuditPlanner.Add "E:\Quality Management\assistant\library\module.data\auditplanner.data.js", "export.defaultFile" 'default path to export file
    setupAuditPlanner.Add "Liste für Assistenten bereitstellen?", "export.prompt" 'save dialogue header, customize to your language
    setupAuditPlanner.Add "auditplanner.data", "export.objectName" 'name of json-object
    setupAuditPlanner.Add False, "export.dontSkipEmpty" 'whether to skip empty cells or not depending on structure of assistants processing algorithm
    setupAuditPlanner.Add "3", "m.contentcolumn" 'customize query column (numbered), output only if content is set
End Function
Public Function monitorAuditPlanner() As Collection
    Set monitorAuditPlanner = New Collection
    monitorAuditPlanner.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorAuditPlanner.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
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
    setupTicketSystem.Add "E:\Quality Management\assistant\library\module.data\ticketorder.data.js", "export.defaultFile" 'default path to export file
    setupTicketSystem.Add "Liste für Assistenten bereitstellen?", "export.prompt" 'save dialogue header, customize to your language
    setupTicketSystem.Add "ticketorder.data", "export.objectName" 'name of json-object
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
    setupExternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentlookup_ext.data.js", "export.defaultFile"
    setupExternalDocuments.Add "documentlookup.data.ext", "export.objectName"
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
    setupExternalContracts.Add "E:\Quality Management\published\assistant\library\module.data\documentlookup_contract.data.js", "export.defaultFile"
    setupExternalContracts.Add "documentlookup.data.contract", "export.objectName"
    setupExternalContracts.Add "Liste der externen Verträge für den Assistenten bereitstellen?", "export.prompt"
    setupExternalContracts.Add "Export abgebrochen, es wurde keine Zieldatei gewählt.", "export.ErrorMsg"
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
    setupInternalDocuments.Add "documentlookup.data.int", "export.objectName" 'name of json-object
    setupInternalDocuments.Add "Inhalte veröffentlichen?", "initiate.Title"
    setupInternalDocuments.Add "Kopie der Liste ohne Code bereitstellen," & vbNewLine & _
            "Liste der Dokumente för den Assistenten bereitstellen," & vbNewLine & _
            "Dokumentenpakete für den Assistenten bereitstellen?", "initiate.Confirm"
    'document list
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentlookup_int.data.js", "export.listdefaultFile"
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
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\documentbundles.data.js", "export.bundleDefaultFile"
    setupInternalDocuments.Add "E:\Quality Management\assistant\library\module.data\", "export.bundleDefaultFolder"
    'export without code
    setupInternalDocuments.Add "Excel-Datei ohne Code veröffentlichen?", "export.xlsPrompt"
    setupInternalDocuments.Add "E:\Quality Management\published\list of documents.xlsx", "export.xlsDefaultFile"
    setupInternalDocuments.Add "Neue Versionsstände für Dokumente", "export.notificationSubject"
    setupInternalDocuments.Add "Hallo zusammen,<br><br>ab sofort gelten neue Versionsstände für folgende Dokumente:<br><br>{list}<br>Bitte wie immer beachten, dass alte Ausdrucke entsorgt und nicht mehr verwendet werden!", "export.notificationBody"
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
    setupDRM.Add "Rechte für den Assistenten bereitstellen?", "initiate.Title"
    setupDRM.Add "Kennwörtertabelle exportieren?", "initiate.Confirm"
    setupDRM.Add "E:\Quality Management\assistant\library\core\core.drm.js", "export.defaultFile"
    setupDRM.Add "Liste der Rechte für den Assistenten bereitstellen?", "export.prompt"
    setupDRM.Add "Export abgebrochen, es wurde keine Zieldatei gewählt.", "export.ErrorMsg"
End Function
Public Function monitorDRM() As Collection
    Set monitorDRM = New Collection
    monitorDRM.Add Array(False, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorDRM.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns" 
End Function


Public Function setupVendorList() As Collection
    Set setupVendorList = New Collection
    ' export values
    setupVendorList.Add "Export des Lieferantenverzeichnisses?", "export.confirmTitle" 'title for query to export
    setupVendorList.Add "Kopie des Lieferantenverzeichnisses bei den Nachweisdokumenten bereitstellen?", "export.confirm" 'query to export
    setupVendorList.Add "Excel-Datei ohne Code veröffentlichen?", "export.xlsPrompt"
    setupVendorList.Add "E:\Quality Management\published\vendor list.xlsx", "export.xlsDefaultFile"
    'runtime values
    setupVendorList.Add "Ein Doppelklick auf die manuell anzufordernden Dokumente im Lieferantenverzeichnis oder die Unterlagen bei den Materialien im Hautkontakt erstellt automatisch " & _
            "eine eMail mit der passenden Anfrage an den Lieferanten. " & vbNewLine & _
            "Das Datum der Anfrage wird bei Versandbestätigung automatisch eingetragen" & vbNewLine & vbNewLine & _
            "Eine Änderung des Zelleninhalts in dieser Spalte des Lieferantenverzeichnisses ist nur über das Eingabefeld oben möglich. " & vbNewLine & _
            "Bei der Pflege des Verzeichnisses sollte in der Spalte mit den manuell anzufordernden Dokumenten " & _
            "auf aussagekräftige und sprachlich passende Titel geachtet werden." & vbNewLine & _
            "Eine Anpassung der eMail ist aber jederzeit möglich." & vbNewLine & vbNewLine & _
            "Eine Änderung der Spalten muss unter Umständen auch in der VBA-Programmierung für den eMail-Versand sowie die bedingte Formatierung berücksichtigt werden! Um Zurückhaltung wird gebeten." _
            , "runtime.prompt" 'hint on startup
    setupVendorList.Add "Wurde die eMail abgeschickt?", "runtime.mailSent" 'confirmation query on sending email manually demanding documents
    setupVendorList.Add "dd.mm.yyyy", "runtime.dateFormat" 'date format to populate last-demand-field with
    setupVendorList.Add "Es besteht keine Schreibberechtigung. Änderungen würden nicht gespeichert werden. Wende Dich an deine zuständigen MitarbeiterInnen.", "runtime.writeError" 'warning on missing write permissions
    setupVendorList.Add "Es fehlt eine eMail-Adresse. Bitte eine eMail-Adresse (und Kundennummer) im Lieferantenverzeichnis eintragen.", "runtime.missingRcptError" 'warning if email-adress is missing
    setupVendorList.Add "Dieser Lieferant befindet sich nicht (mehr) im zugelassenen Lieferantenverzeichnis!", "runtime.illegalVendorError" 'warning if vendor is not found in the vendor-sheet, e.g. gone out of business or sorted out 
    ' vendor tracing value
    setupVendorList.Add "VendorList", "vendor.sheetName" 'select sheet to process content
    setupVendorList.Add "3", "vendor.rowOffset" 'customize row, where contents start 
    setupVendorList.Add "A", "vendor.vendorColumn" 'customize column for vendor names
    setupVendorList.Add "F", "vendor.documentColumn" 'customize column for documents to demand manually
    setupVendorList.Add "G", "vendor.dateColumn" 'customize column to populate with latest request
    setupVendorList.Add "H", "vendor.downloadColumn" 'customize column with automated document types
    setupVendorList.Add "I", "vendor.customerColumn" 'customize column with your customer id for respective vendors
    setupVendorList.Add "J", "vendor.rcptColumn" 'customize column with email-adress of respective vendors
    setupVendorList.Add "Dokumentenanfrage für {documents}", "vendor.mailSubject" 'subject for request-mail, {documents} will be replaced according to vendor.documentColumn
    setupVendorList.Add "Sehr geehrte Damen und Herren,<br /><br />" & _
            "um eine Konformität der von uns gelieferten orthopädischen Hilfsmittel jederzeit bescheinigen zu können, " & _
            "müssen wir die erforderlichen Zertifikate und Dokumente im Rahmen unseres Qualitätsmanagementsystems vorhalten. " & _
            "{download} die wir bereits in der Vergangenheit von Ihnen erhalten haben. Wir benötigen von Ihnen die aktuellen Dokumente betreffend<br /><br /><i>{documents}</i><br /><br />" & _
            "für eines oder mehrere Ihrer Produkte, die wir von Ihnen beziehen, bzw. bezüglich Ihres Unternehmens. " & _
            "{customer}Wir freuen uns über eine zeitnahe Zusendung der Dokumente, per eMail an " & _
            "<a href=""mailto:mail@company.tld"">mailto:mail@company.tld</a>, oder per Post oder Fax an die unten stehende Adresse oder Faxnummer. " & _
            "Sollten Sie in der Zwischenzeit die Dokumente frei zugänglich auf Ihre Internetseite zur Verfügung stellen, teilen Sie uns bitte den Speicherort mit. " & _
            "<br /><br />Mit freundlichen Grüßen<br /><br />" & _
            "Ihre Firma<br />" & _
            "Straße<br />" & _
            "Ort<br />" & _
            "Telefon<br />" & _
            "Fax" & _
            "<br /><br /><small>Dies ist eine automatisiert erstellte eMail.</small>" _
            , "vendor.mailBody" 'body for request-mail, {documents}, {download} and {customer} will be conditionally replaced with following chunks
    setupVendorList.Add "Einige Ihrer Unterlagen konnten wir bereits von Ihrer Internetseite beziehen. Leider fehlen uns aber noch einige Dokumente, ", "vendor.ifDownload" 'if some documents can be downloaded
    setupVendorList.Add "Dazu bitten wir Sie um Zusendung der erforderlichen aktuellen Unterlagen, ", "vendor.ifNotDownload" 'if no documents can be downloaded
    setupVendorList.Add "Unsere Kundennummer bei Ihnen lautet: {customer}<br />", "vendor.ifCustomer" 'if customer id for respective vendor is given
    setupVendorList.Add "Es scheint alles schon da zu sein?!", "vendor.noDemand" 'if documents id empty or populated with a dash
    ' material tracing values
    setupVendorList.Add "MaterialTracing", "material.sheetName" 'select sheet to process content
    setupVendorList.Add "6", "material.rowoffset" 'customize row, where contents start 
    setupVendorList.Add "A", "material.materialColumn" 'customize column for material names and order ids
    setupVendorList.Add "B", "material.vendorColumn" 'customize column for vendor names
    setupVendorList.Add "D", "material.documentColumn" 'customize column for documents to demand manually
    setupVendorList.Add "E", "material.dateColumn" 'customize column to populate with latest request
    setupVendorList.Add "{documents} für {material}", "material.mailSubject" '{documents} and {material} will be replaced according to material.documentColumn and .materialColumn
    setupVendorList.Add "Sehr geehrte Damen und Herren,<br /><br />" & _
            "um eine Konformität der von uns gelieferten orthopädischen Hilfsmittel jederzeit bescheinigen zu können, " & _
            "müssen wir die erforderlichen Zertifikate und Dokumente im Rahmen unseres Qualitätsmanagementsystems vorhalten. " & _
            "{evidence}Wir bevorzugen einen oder meherere folgender Nachweise:<br /><ul>" & _
            "<li>Biokompatibilitätsnachweise nach ISO 10993,</li>" & _
            "<li>Konformitätserklärungen nach ISO 13485,</li>" & _
            "<li>Berichte über die Prüfung der Zytotoxizität und Karzerogenität von akkreditierten Prüflaboren</li>" & _
            "</ul>" & _
            "{customer}Sofern Sie die Erklärungen / Berichte nicht selbst ausgeben akzeptieren wir auch die Erklärungen / Berichte Ihrer Lieferanten " & _
            "mit einer Erklärung von Ihnen dass es sich bei Ihrem Handelsnamen um das entsprechende Produkt handelt. " & _
            "Beachten Sie bitte, dass sich jeder Ihrer Kunden über eine Aktualität der Unterlagen von nicht älter als 5 Jahren freut. " & _
            "Wir freuen uns über eine zeitnahe Zusendung der Dokumente, per eMail an " & _
            "<a href=""mailto:mail@company.tld"">mailto:mail@company.tld</a>, oder per Post oder Fax an die unten stehende Adresse oder Faxnummer. " & _
            "Sollten Sie in der Zwischenzeit die Dokumente frei zugänglich auf Ihre Internetseite zur Verfügung stellen, teilen Sie uns bitte den Speicherort mit. " & _
            "<br /><br />Mit freundlichen Grüßen<br /><br />" & _
            "Ihre Firma<br />" & _
            "Straße<br />" & _
            "Ort<br />" & _
            "Telefon<br />" & _
            "Fax" & _
            "<br /><br /><small>Dies ist eine automatisiert erstellte eMail. Wir bitten um Verständnis falls Sie mehrere Anfragen für unterschiedliche Materialien erhalten.</small>" _
            , "material.mailBody" 'body for request-mail, {evidence} and {customer} will be condidionally replaced with following/preceding chunks
    setupVendorList.Add "Materialunbedenklichkeitsnachweise", "material.defaultEvidence" 'default if no document types are given yet
    setupVendorList.Add "In der Vergangenheit haben wir von Ihnen die <br /><br /><i>{documents} für {material}</i><br /><br /> erhalten und bitten nun um die Zusendung aktueller Unterlagen. ", "material.ifDocuments" 'if document types are given, {documents} and {material will be replaced}
    setupVendorList.Add "Wir bitten Sie um die Zusendung aktueller <br /><br /><i>Materialunbedenklichkeitsnachweise für {material}</i>.<br /><br />", "material.ifNotDocuments" 'if no document types are given yet, {material} will be replaced
    setupVendorList.Add "Es fehlt der Lieferant!", "material.missingVendorError" 'warning if material misses vendor assignment
End Function
Public Function monitorVendorList() As Collection
    Set monitorVendorList = New Collection
    monitorVendorList.Add Array(True, monitorRowsTitle, monitorRowsPrompt), "monitor.rows"
    monitorVendorList.Add Array(True, monitorColumnsTitle, monitorColumnsPrompt), "monitor.columns"
End Function