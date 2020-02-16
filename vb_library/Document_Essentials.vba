Attribute VB_Name = "Essentials"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit
Public ActiveVersioning As Boolean
Public PDFFile As String
Public setup As Collection

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' general module handler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Modules() as Object
    Set Modules= CreateObject("Scripting.Dictionary")
    Modules.Add "Locals", ThisDocument.parentPath & "vb_library\" & "Document_Locals_" & ThisDocument.selectedLanguage & ".vba"
    'Modules.Add "Rewrite", ThisDocument.parentPath & "vb_library\" & "RewriteMain.vba"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' events
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub openRoutine()
    If ThisDocument.importModules(Modules()) Then asyncOpen
End Sub

Public Sub asyncOpen()
    'Rewrite.rewriteMain ThisDocument, "ThisDocument", "E:\Quality Management\vb_library\Document_ThisDocument_illustration.vba"

    Set setup = Locals.setup

    ActiveVersioning = True
    On Error Resume Next
    UpdateDocumentFields
End Sub

Public Sub closeRoutine(ByVal Doc As Document, SaveAsUI As Boolean, Cancel As Boolean)
    'run procedures only if this window is active/in focus, not while autosaving other files in background _
    Application.MacroContainer.Name = Doc makes sure to run only this files code. without this the _
    version control routines will be called from every opened document with the same code
    If Doc.ActiveWindow.Active And Application.MacroContainer.Name = Doc Then
      
        If Not Cancel And ActiveVersioning Then
            Select Case MsgBox(setup("initiate.confirm") & setup("initiate.confirmYes") & setup("initiate.confirmNo") & setup("initiate.confirmCancel") _
                , vbYesNoCancel + vbDefaultButton2 + vbQuestion, setup("initiate.Title"))
            Case vbYes
                AutoVersioning
            Case vbNo
                ManualVersioning
            End Select
        End If
    End If
End Sub

Public Sub AutoVersioning()
    Dim version As String
    If ThisDocument.Variables("version").Value = vbNullString Then
        version = 0
    Else
        version = ThisDocument.Variables("version").Value
    End If
    
    ThisDocument.Variables("version").Value = version + 1
    ThisDocument.Variables("releasedate").Value = Format(Date, "yyyymmdd")
    
    UpdateAndExport
End Sub

Public Sub ManualVersioning()
    'ask for updating version and release date
    Dim version As String
    Dim releasedate As String
    version = InputBox(setup("manualVersioning.versionPrompt") & ": " & ThisDocument.Variables("version").Value, _
        setup("manualVersioning.versionTitle"), ThisDocument.Variables("version").Value + 1)
    releasedate = InputBox(setup("manualVersioning.releasedatePrompt") & ": " & ThisDocument.Variables("releasedate").Value, setup("manualVersioning.releasedateTitle"), Format(Date, "yyyymmdd"))
    If Not version = vbNullString Then
        ThisDocument.Variables("version").Value = version
    End If
    If Not releasedate = vbNullString Then
        ThisDocument.Variables("releasedate").Value = releasedate
    End If
    'guide through releasing new document version if user applied values only
    If Not (version = vbNullString And releasedate = vbNullString) Then
        UpdateAndExport
    End If
End Sub

Public Sub UpdateAndExport()
    UpdateDocumentFields
    Archieve
    PDFPublish
    UpdateListOfDocuments
End Sub

Public Sub UpdateDocumentFields()
    ThisDocument.Variables("title").Value = CreateObject("Scripting.FileSystemObject").GetBaseName(ThisDocument.Name)
    'update of fields even in header, footer and textboxes
    Dim rngStory As Word.Range
    Dim lngJunk As Long
    Dim oShp As Shape
    lngJunk = ThisDocument.Sections(1).Headers(1).Range.StoryType
    For Each rngStory In ThisDocument.StoryRanges
    'Iterate through all linked stories/fields
        Do
            On Error Resume Next
            rngStory.Fields.Update
            Select Case rngStory.StoryType
            Case 6, 7, 8, 9, 10, 11
                If rngStory.ShapeRange.Count > 0 Then
                    For Each oShp In rngStory.ShapeRange
                        If oShp.TextFrame.HasText Then
                            oShp.TextFrame.TextRange.Fields.Update
                        End If
                    Next
                End If
            Case Else
                'Do Nothing
            End Select
            On Error GoTo 0
            'Get next linked story (if any)
            Set rngStory = rngStory.NextStoryRange
        Loop Until rngStory Is Nothing
    Next
End Sub

Public Sub Archieve()
    ''''''' archive file without code, version number added to filename ''''''''
    Dim fileSaveName As Variant
    Set fileSaveName = Application.FileDialog(msoFileDialogSaveAs)
    fileSaveName.InitialFileName = Replace(ThisDocument.FullName, ThisDocument.Variables("title"), ThisDocument.Variables("title") + "[" + ThisDocument.Variables("version") + "]")
    fileSaveName.title = setup("archive.confirmPrompt")
    If fileSaveName.Show = -1 Then
        'Save changes to original document
        ActiveVersioning = False 'disable versioning on autosave and in exported file
        ThisDocument.Save
        'the next line copies the active document
        Application.Documents.Add ThisDocument.FullName
        'the next line saves the copy to your location and name
        On Error Resume Next
        ActiveDocument.Convert 'works in word2013 but possibly not word2010, hence error handling
        ActiveDocument.SaveAs2 filename:=fileSaveName.SelectedItems(1), FileFormat:=wdFormatXMLDocument
        'next line closes the copy leaving you with the original document
        ActiveDocument.Close
        MsgBox (fileSaveName.SelectedItems(1) & vbNewLine & setup("archive.successPrompt"))
        ActiveVersioning = True 'enable versioning on autosave and in exported file again
    End If
End Sub

Public Sub PDFPublish()
    ''''''' publish as pdf ''''''''
    With Application.FileDialog(msoFileDialogSaveAs)
        .InitialFileName = ThisDocument.path & "\" & CStr(ThisDocument.Variables("title").Value) & ".pdf"
        .AllowMultiSelect = False
        .Title = setup("publish.confirmPrompt")
        If .Show = -1 Then
            PDFFile = .SelectedItems(1)
            PDFFile = Replace(PDFFile, ".docm", ".pdf")
            PDFFile = Replace(PDFFile, ".docx", ".pdf")
            PDFFile = Replace(PDFFile, ".doc", ".pdf")
            ThisDocument.ExportAsFixedFormat _
                OutputFileName:=PDFFile, _
                ExportFormat:=wdExportFormatPDF
            MsgBox (setup("publish.successPrompt") & " " & vbNewLine & PDFFile)
        Else
            PDFFile = ""
        End If
    End With
End Sub

Public Sub UpdateListOfDocuments()
    ''''''' update list of documents in force ''''''''
    Dim objFile As Variant
    Dim file As String
    Dim xlApp As Object, xlWB As Object, xlSheet As Object
    Dim i As Long, rCount As Long, bXStarted As Boolean
    Dim strPath As String
    
    'Open file dialog for selecting data export file (path)
    With Application.FileDialog(msoFileDialogFilePicker)
        .InitialFileName = ThisDocument.path & "\" 'Environ("USERPROFILE") & "\"
        .AllowMultiSelect = False
        .title = setup("updateList.autoUpdatePrompt")
        .Show
        For Each objFile In .SelectedItems
            strPath = objFile
        Next objFile
    End With
    
    If strPath = "" Then
        If MsgBox(setup("updateList.autoUpdateErrorPrompt"), _
        vbRetryCancel + vbExclamation, setup("updateList.autoUpdateErrorTitle")) = vbRetry Then UpdateAndExport
    Else
        'open file and define workbook and -sheet
        On Error Resume Next
        Set xlApp = GetObject(, "Excel.Application")
        If Err <> 0 Then
            Application.StatusBar = "Please wait while Excel source is opened ... "
            Set xlApp = CreateObject("Excel.Application")
            xlApp.Application.Visible = True
            bXStarted = True
        End If
        On Error GoTo 0
        Set xlWB = xlApp.Workbooks.Open(strPath)
        Set xlSheet = xlWB.Sheets(1)
        
        'Find the last empty line of the worksheet and define range
        rCount = xlSheet.Range(setup("updateList.documentTitle") & xlSheet.Rows.Count).End(-4162).Row
        rCount = rCount + 1
        
        'change rCount from range to row-number of existing identifier to update if existent
        For i = 1 To rCount
            If xlSheet.Range(setup("updateList.documentTitle") & i).Value = ThisDocument.Variables("title").Value Then
                rCount = i
                Exit For
            End If
        Next
        
        'update or insert values for title ans version in dependent columns
        ThisDocument.Repaginate 'occasionally update site numbers
        xlSheet.Range(setup("updateList.documentTitle") & rCount).Value = ThisDocument.Variables("title").Value
        xlSheet.Range(setup("updateList.documentVersion") & rCount).Value = "V" + CStr(ThisDocument.Variables("version").Value) + _
            "." + CStr(ThisDocument.Variables("releasedate").Value)
        xlSheet.Range(setup("updateList.documentPages") & rCount).Value = ThisDocument.ComputeStatistics(wdStatisticPages)
        'link to word document
        xlSheet.Hyperlinks.Add Anchor:=xlSheet.Range(setup("updateList.documentHyperlink") & rCount), _
        Address:=ThisDocument.FullName, _
        TextToDisplay:=ThisDocument.FullName
        'link to published pdf document in case a column is specified above
        If setup("updateList.documentPDFHyperlink") <> "" And PDFFile <> "" Then
            xlSheet.Hyperlinks.Add Anchor:=xlSheet.Range(setup("updateList.documentPDFHyperlink") & rCount), _
            Address:=PDFFile, _
            TextToDisplay:=PDFFile
        End If
        
        xlWB.Close
        If bXStarted Then
            xlApp.Quit
        End If
            
    End If
    Set xlApp = Nothing
    Set xlWB = Nothing
    Set xlSheet = Nothing
End Sub