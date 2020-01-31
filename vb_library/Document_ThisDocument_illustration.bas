'(c) 2019 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license

Option Explicit
Public selectedLanguage As String
Public parentPath
Public WithEvents App As Word.Application

Private Sub Document_Open()
    Set App = Word.Application
    
    selectedLanguage = "EN"
    
    'get parent path to vb_libraries to be imported
    Dim path() As String
    path() = Split(ThisDocument.path, "\")
    Dim i As Integer
    parentPath = ""
    For i = 0 To UBound(path) - 1 'according to upward steps in folder hierarchy
        parentPath = parentPath & path(i) & "\"
    Next i
    
    'load essentials as module and execute opening procedure
    Dim Essentials
    Set Essentials = CreateObject("Scripting.Dictionary")
    Essentials.Add "Essentials", parentPath & "vb_library\Document_Essentials.bas"

    If importModules(Essentials) Then asyncOpen
End Sub

Private Sub asyncOpen()
    Essentials.openRoutine
End Sub

Private Sub App_DocumentBeforeSave(ByVal Doc As Document, SaveAsUI As Boolean, Cancel As Boolean)
    Essentials.closeRoutine Doc, SaveAsUI, Cancel
End Sub


Public Function importModules(ByVal libraries As Object) As Boolean
    Dim lib As Variant, modloop As Variant
    On Error Resume Next
    Application.DisplayAlerts = False
    'rename existing modules and import external modules
    For Each lib In libraries
        If Len(Dir(libraries(lib))) > 0 Then
            With ThisDocument.VBProject.VBComponents
                'renaming to _old because sometimes modules are removed on finishing of the code only, resulting in enumeration of module names
                .Item(lib).Name = lib & "_OLD"
                .Import libraries(lib)
            End With
        End If
    Next lib
    'if no external modules have been found rename existing modules to default name
    For Each lib In libraries
        Dim loaded As Boolean
        For Each modloop In ThisDocument.VBProject.VBComponents
            If (modloop.Name = lib) Then loaded = True: Exit For
        Next modloop
        
        If loaded Then
            ThisDocument.VBProject.VBComponents.Remove ThisDocument.VBProject.VBComponents(lib & "_OLD")
        Else
            ThisDocument.VBProject.VBComponents(lib & "_OLD").Name = lib
        End If
    Next lib
    Application.DisplayAlerts = True
    On Error GoTo 0
    importModules = True
End Function