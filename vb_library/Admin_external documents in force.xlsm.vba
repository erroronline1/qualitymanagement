Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As Collection
    Set Setup = Locals.setupExternalExport()

    Select Case MsgBox(Setup("initiate.Confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, Setup("initiate.Title"))
    Case vbYes
        Essentials.exportXLS Setup

        Set setup = Locals.setupExternalDocuments()
        'harmonize elements for intermodule compatibility
        setup.Add setup("matrix.sheet"), "documentlist.sheet"
        setup.Add setup("matrix.headerRow"), "documentlist.headerRow"
        setup.Add setup("matrix.displayColumn"), "documentlist.displayColumn"
        setup.add False, "documentlist.maxRows"
        Essentials.doclistExport setup, False, False
        
        Set setup = Locals.setupExternalContracts()
        'harmonize elements for intermodule compatibility
        setup.Add setup("matrix.sheet"), "documentlist.sheet"
        setup.Add setup("matrix.headerRow"), "documentlist.headerRow"
        setup.Add setup("matrix.displayColumn"), "documentlist.displayColumn"
        setup.add False, "documentlist.maxRows"
        Essentials.doclistExport setup, False, False

    'Case vbNo
    
    End Select
End Sub