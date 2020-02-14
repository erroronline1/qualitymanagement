Attribute VB_Name = "Locals"
'(c) 2020 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
' customize this collection to your language requirements and your structure of the listed documents excel sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function setup() As Collection
    Set setup = New Collection
    'prompt to start version assignment
    setup.Add Item:="Update version and release date?", Key:="initiate.Title"
    setup.Add "The document '" & ThisDocument.Variables("title").Value & "' will be saved." & vbNewLine & vbNewLine, "initiate.confirm"
    setup.Add "[Yes] to update to version V" & ThisDocument.Variables("version").Value + 1 & "." & Format(Date, "yyyymmdd") & " automatically" & vbNewLine, "initiate.confirmYes"
    setup.Add "[No] to set version manually" & vbNewLine & vbNewLine, "initiate.confirmNo"
    setup.Add "Archiving and publishing the current version and updating the list of documents in force can be done in either case." & vbNewLine & vbNewLine & "[Cancel] to keep current version", "initiate.confirmCancel"
    'prompt to set version manually
    setup.Add "Version", "manualVersioning.versionTitle"
    setup.Add "Enter new version or cancel to keep current", "manualVersioning.versionPrompt"
    setup.Add "Release date", "manualVersioning.releasedateTitle"
    setup.Add "Enter new release date or cancel to keep current", "manualVersioning.releasedatePrompt"
    'prompt to archive current version without code
    setup.Add "Save a copy without code to archive?", "archive.confirmPrompt"
    setup.Add "saved. The file is stored in the archive without code so there is no risk of accidentally updating something.", "archive.successPrompt"
    'prompt to publish document ad pdf-file
    setup.Add "Publish document as PDF-file? (Extension will be set automatically)", "publish.confirmPrompt"
    setup.Add "Document published as", "publish.successPrompt"
    'prompt and structure to update list of documents in force
    setup.Add "Select Excel-list of documents in force to update version", "updateList.autoUpdatePrompt"
    setup.Add "Auto-update not possible!", "updateList.autoUpdateErrorTitle"
    setup.Add "There was no file selected!" & vbNewLine & "Try again or cancel?" & vbNewLine & "(update manually for the latter option)", "updateList.autoUpdateErrorPrompt"
    setup.Add "B", "updateList.documentTitle"
    setup.Add "C", "updateList.documentVersion"
    setup.Add "D", "updateList.documentPages"
    setup.Add "E", "updateList.documentHyperlink"
    setup.Add "", "updateList.documentPDFHyperlink"
    'the variable "updateList.documentPDFHyperlink" can be customized to update the list of documents _
    in case you want this to be. since i recommend docm-files to be handled as working files _
    and editing/publishing might take place on different dates, or you consider to store the pdfs _
    temporarily on a different location e.g. to make them editable in advance to publishing _
    this option is set empty by default in published version. as soon you set the value to the _
    desired column the link will be written to the list of documents in force if a published pdf file is saved
End Function

