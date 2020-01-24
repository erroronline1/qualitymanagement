'timetracking with excel
'2020 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license
'set selectedLanguage in the Workbook_Open-sub and customize your language and location specific values in the Locale module

'be aware that changing the tables layout will have an effect on the code as well.
'make sure to update sheets and code on either side
'see explicit init-function, addSheets-sub and holidayReminder-sub as well as vacationHandler-sub in essential module

Option Explicit
Public selectedLanguage As String

Private Sub Workbook_Open()
    selectedLanguage = "EN"
    'load essentials as module and execute opening procedure
    Dim Essentials
    Set Essentials = CreateObject("Scripting.Dictionary")
    Essentials.Add "Essentials", ThisWorkbook.Path & "\vb_library\Essentials.bas"

    If importModules(Essentials) Then asyncOpen
End Sub

Private Sub asyncOpen()
    Essentials.OpenRoutine
End Sub

Private Sub Workbook_BeforeSave(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Essentials.CloseRoutine
End Sub

Public Function importModules(ByVal libraries As Object) As Boolean
    Dim lib As Variant, modloop As Variant
    On Error Resume Next
    Application.DisplayAlerts = False
    'rename existing modules and import external modules
    For Each lib In libraries
        With ThisWorkbook.VBProject.VBComponents
            'renaming to _old because sometimes modules are removed on finishing of the code only, resulting in enumeration of module names
            .Item(lib).Name = lib & "_OLD"
            .Import libraries(lib)
        End With

    Next lib
    'if no external modules have been found rename existing modules to default name
    For Each lib In libraries
        Dim loaded As Boolean
        For Each modloop In ThisWorkbook.VBProject.VBComponents
            If (modloop.Name = lib) Then loaded = True: Exit For
        Next modloop
        
        If loaded Then
            ThisWorkbook.VBProject.VBComponents.Remove ThisWorkbook.VBProject.VBComponents(lib & "_OLD")
        Else
            ThisWorkbook.VBProject.VBComponents(lib & "_OLD").Name = lib
        End If
    Next lib
    Application.DisplayAlerts = True
    On Error GoTo 0
    importModules = True
End Function