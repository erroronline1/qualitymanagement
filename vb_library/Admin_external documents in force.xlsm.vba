Attribute VB_Name = "Specific"
'(c) 2020 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license

Option Explicit

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As Collection

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
End Sub