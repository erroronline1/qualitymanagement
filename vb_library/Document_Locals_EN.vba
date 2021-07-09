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
' customize this collection to your language requirements and your structure of the listed documents excel sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function setup() As Collection
    Set setup = New Collection
    setup.Add Item:="Versioning and publishing are not available. The document has to be opened directly - not from the list of documents in force - for macros to take effect.", Key:="startup.execution"
    setup.Add ">>Doubleclick to set version and publish document<<", "startup.macrobutton"
    ' prompt to start version assignment
    setup.Add Item:="Update version and release date?", Key:="initiate.Title"
    setup.Add "The document '" & ThisDocument.Variables("title").Value & "' will be saved." & vbNewLine & vbNewLine & _
        "[Automatic] to update to version V" & ThisDocument.Variables("version").Value + 1 & "." & Format(Date, "yyyymmdd") & " automatically" & vbNewLine & vbNewLine & _
        "[Manually] to set version manually" & vbNewLine & vbNewLine & _
        "Archiving and publishing the current version and updating the list of documents in force can be done in either case." & vbNewLine & vbNewLine & "[Cancel] to keep current version", "initiate.confirm"
    setup.Add Array("Automatic", "Manually"), "initiate.options"
    setup.Add "Cancel", "initiate.cancel"
    setup.Add 200, "initiate.labelHeight" ' false for auto height for userform based on options, integer to set according to content
    ' prompt to set version manually
    setup.Add "Version", "manualVersioning.versionTitle"
    setup.Add "Enter new version or cancel to keep current", "manualVersioning.versionPrompt"
    setup.Add "Release date", "manualVersioning.releasedateTitle"
    setup.Add "Enter new release date or cancel to keep current", "manualVersioning.releasedatePrompt"
    ' prompt to archive current version without code
    setup.Add "Save a copy without code to archive?", "archive.confirmPrompt"
    setup.Add "saved. The file is stored in the archive without code so there is no risk of accidentally updating something.", "archive.successPrompt"
    ' prompt for format
    setup.Add Item:="Publish as...", Key:="format.caption"
    setup.Add "Publish document as PDF or interactive Word-document?" & vbNewLine & "Word-files are protected against changes and only allow entering form data." & _
        vbNewLine & vbNewLine & "The file extension will be set automatically, independent of the save-as-dialog stating.", "format.label"
    setup.Add Array("PDF", "DOCM"), "format.options"
    setup.Add "Cancel", "format.cancel"
    setup.Add False, "format.labelHeight"
    'prompt to publish document ad pdf-file
    setup.Add "Publish document as PDF-file? (Extension will be set automatically)", "publish.confirmPrompt"
    ' prompt to publish document as docm-file
    setup.Add "Publish document as interactive DOCM? (Extension will be set automatically)", "publish.docmconfirmPrompt"
    setup.Add "Select another location!", "publish.docmdestinationErrorTitle"
    setup.Add "The document must not be stored in the same location as the draft document!", "publish.docmdestinationError"
    setup.Add "Document published as", "publish.successPrompt"
    'prompt and structure to update list of documents in force
    setup.Add "Select Excel-list of documents in force to update version", "updateList.autoUpdatePrompt"
    setup.Add "Auto-update not possible!", "updateList.autoUpdateErrorTitle"
    setup.Add "There was no file selected!" & vbNewLine & "Try again or cancel?" & vbNewLine & "(update manually for the latter option)", "updateList.autoUpdateErrorPrompt"
    setup.Add "B", "updateList.documentTitle"
    setup.Add "C", "updateList.documentVersion"
    setup.Add "D", "updateList.documentHyperlink"
    setup.Add "E", "updateList.documentFormat"
    setup.Add "", "updateList.documentPDFHyperlink" ' the variable "updateList.documentPDFHyperlink" can be customized to update the list of documents _
        in case you want this to be. since i recommend docm-files to be handled as working files _
        and editing/publishing might take place on different dates, or you consider to store the pdfs _
        temporarily on a different location e.g. to make them editable in advance to publishing _
        this option is set empty by default in published version. as soon you set the value to the _
        desired column the link will be written to the list of documents in force if a published pdf file is saved
End Function

