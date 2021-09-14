Attribute VB_Name = "Essentials"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|   by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit
Public PDFFile As String
Public DOCMFile As String
Public currentDocumentVersion as Variant
Public setup As Collection
Public newDOC As Document

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' general module handler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Modules() As Object
    Set Modules = CreateObject("Scripting.Dictionary")
    Modules.Add "Locals", ThisDocument.parentPath & "vb_library\" & "Document_Locals_" & ThisDocument.selectedLanguage & ".vba"
    Modules.Add "Rewrite", ThisDocument.parentPath & "vb_library\" & "RewriteMain.vba"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' events
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
sub MAKE_THIS_DOCUMENT_A_RECORD_DOCUMENT()
    ' run this macro to avoid version control
    ThisDocument.Variables("version") = False
end sub
sub MAKE_THIS_DOCUMENT_A_VERSIONED_DOCUMENT()
    ' run this macro to start version control
    ThisDocument.Variables("version") = 1
end sub

Public Sub openRoutine()
    If ThisDocument.importModules(Modules()) Then asyncOpen
End Sub

Public Sub asyncOpen()
    Rewrite.rewriteMain ThisDocument, "ThisDocument", ThisDocument.parentPath & "vb_library\Document_ThisDocument.vba"
    Set setup = Locals.setup
    If Word.Application.Visible Then
        ' save as docvar for persistence, because calling userform results in a state loss. _
        see sub publish() below for slightly more information
        ThisDocument.Variables("parentPath").Value = ThisDocument.parentPath
        PDFFile = ""
        DOCMFile = ""
        ' if currentDocumentVersion is false version control is deactivated and file registration is limited
        currentDocumentVersion = ThisDocument.Variables("version").value
        On Error Resume Next
        UpdateDocumentFields
        publishButton "add"
    Else
        MsgBox setup("startup.execution")
    End If
End Sub

Public Sub closeRoutine()
    publishButton "remove"
End Sub

Public Sub publishButton(action As String)
    ''''' adds or removes a macrobutton on the end of the content '''''
    Select Case action
    Case "add"
        ' set cursor to the documents last position
        Selection.EndKey Unit:=wdStory
        ' create a link to macro
        Dim publish: Set publish = ActiveDocument.Fields.Add(Range:=Selection.Range, Type:=wdFieldEmpty, Text:= _
            "MACROBUTTON  Essentials.publish " & setup("startup.macrobutton") _
            , PreserveFormatting:=False)
    Case "remove"
        ' remove fields containing macrobuttons
        Dim f
        For Each f In ActiveDocument.Fields
            If InStr(f.Code.Text, "MACROBUTTON") Then f.Delete
        Next
    End Select
End Sub

Public Sub publish()
    ' after creation and destruction of custom user input public values get lost
    Set setup = Locals.setup
    ThisDocument.parentPath = ActiveDocument.Variables("parentPath").Value
    ' if currentDocumentVersion is false version control is deactivated and file registration is limited
    currentDocumentVersion = ThisDocument.Variables("version").value

    publishButton "remove" ' not useful in published documents...
    Dim formatquery As New Collection
    If currentDocumentVersion Then
        formatquery.Add Item:=setup("initiate.versionedTitle"), Key:="caption"
        formatquery.Add Replace(setup("initiate.versionedConfirm"), "{version}", currentDocumentVersion + 1), "label"
    Else
        formatquery.Add Item:=setup("initiate.recordTitle"), Key:="caption"
        formatquery.Add setup("initiate.recordConfirm"), "label"
    End If
    formatquery.Add setup("initiate.options"), "options"
    formatquery.Add setup("initiate.cancel"), "cancel"
    formatquery.Add setup("initiate.labelHeight"), "height"
    
    Select Case customUserInput(formatquery)
        Case setup("initiate.options")(0)
            AutoVersioning
        Case setup("initiate.options")(1)
            ManualVersioning
    End Select
    ' show all bookmarks
    hideBookmarks "text", False
    hideBookmarks "notext", False

    publishButton "add" ' readd after everything
End Sub

Public Sub AutoVersioning()
    If currentDocumentVersion And currentDocumentVersion <> -1 Then
        currentDocumentVersion = currentDocumentVersion + 1
        ThisDocument.Variables("version").Value = currentDocumentVersion
    End If
    ThisDocument.Variables("releasedate").Value = format(Date, "yyyymmdd")
    
    UpdateAndExport
End Sub

Public Sub ManualVersioning()
    ' ask for updating version and release date
    Dim futureVersion As String
    Dim releasedate As String
    If currentDocumentVersion Then
        futureVersion = InputBox(setup("manualVersioning.versionPrompt") & ": " & currentDocumentVersion, _
            setup("manualVersioning.versionTitle"), currentDocumentVersion + 1)
    End If
    releasedate = InputBox(setup("manualVersioning.releasedatePrompt") & ": " & ThisDocument.Variables("releasedate").Value, setup("manualVersioning.releasedateTitle"), format(Date, "yyyymmdd"))
    If currentDocumentVersion And isNumeric(futureVersion) Then
        If CInt(futureVersion) <> 0 Then currentDocumentVersion = futureVersion
        ThisDocument.Variables("version").Value = currentDocumentVersion
    End If
    If Not releasedate = vbNullString Then
        ThisDocument.Variables("releasedate").Value = releasedate
    End If
    ' guide through releasing new document version if user applied values only
    If Not releasedate = vbNullString Then
        UpdateAndExport
    End If
End Sub

Public Sub UpdateAndExport()
    UpdateDocumentFields
    
    Dim formatquery As New Collection
    formatquery.Add Item:=setup("format.caption"), Key:="caption"
    formatquery.Add setup("format.label"), "label"
    formatquery.Add setup("format.options"), "options"
    formatquery.Add setup("format.cancel"), "cancel"
    formatquery.Add setup("format.labelHeight"), "height"
    
    Select Case customUserInput(formatquery)
        Case setup("format.options")(0)
            PDFPublish
        Case setup("format.options")(1)
            DOCMPublish
    End Select
    ' variable loss after calling customUserInput
    currentDocumentVersion = ThisDocument.Variables("version").Value
    Archive
    If currentDocumentVersion Then
        UpdateListOfDocuments
    End If
End Sub

Public Sub UpdateDocumentFields()
    If currentDocumentVersion Then
        ThisDocument.Variables("title").Value = CreateObject("Scripting.FileSystemObject").GetBaseName(ThisDocument.Name)
    Else
        Dim defaulttitle: defaulttitle = CreateObject("Scripting.FileSystemObject").GetBaseName(ActiveDocument.Name)
        Dim doctitle: doctitle = InputBox(setup("initiate.recordTitleSet"), "", defaulttitle)
        If Not doctitle = vbNullString Then
            ActiveDocument.Variables("title").Value = doctitle
        Else
            ActiveDocument.Variables("title").Value = defaulttitle
        End If
    End If
    ' update of fields even in header, footer and textboxes
    Dim rngStory As Word.Range
    Dim lngJunk As Long
    Dim oShp As Shape
    lngJunk = ThisDocument.Sections(1).Headers(1).Range.StoryType
    For Each rngStory In ThisDocument.StoryRanges
    ' iterate through all linked stories/fields
        Do
            On Error Resume Next
            rngStory.Fields.Update
            If rngStory.ShapeRange.Count > 0 Then
                For Each oShp In rngStory.ShapeRange
                    If oShp.TextFrame.HasText Then
                        oShp.TextFrame.TextRange.Fields.Update
                    End If
                Next
            End If
            On Error GoTo 0
            ' get next linked story (if any)
            Set rngStory = rngStory.NextStoryRange
        Loop Until rngStory Is Nothing
    Next
End Sub

Public Sub hideBookmarks(prefix as string, flag as boolean)
    Dim cc As ContentControl
    For Each cc In ThisDocument.ContentControls
        ' checkboxes have no type attribute to check against, therefore the need of _
        error handling on Checked-property that is checkbox-only in this usecase
        On Error Resume Next
        If ThisDocument.Bookmarks.Exists(prefix & cc.Tag) Then
                ThisDocument.Bookmarks(prefix & cc.Tag).Range.Font.Hidden = flag
        End If
    Next
End Sub

Public Sub Archive()
    ''''''' archive file without code, version number added to filename '''''''
    Dim fileSaveName As Variant
    Set fileSaveName = Application.FileDialog(msoFileDialogSaveAs)
    Dim archiveVersion
    If currentDocumentVersion Then
        archiveVersion = currentDocumentVersion
    Else
        archiveVersion = ThisDocument.Variables("releasedate").Value
    End If
    fileSaveName.InitialFileName = Replace(ThisDocument.FullName, ThisDocument.Variables("title"), ThisDocument.Variables("title") + "[" + archiveVersion + "]")
    fileSaveName.title = setup("archive.confirmPrompt")
    If fileSaveName.Show = -1 Then
        ' save changes to original document
        ThisDocument.Save
        ' show all bookmarks, just in case, to have all content visible
        hideBookmarks "text", False
        hideBookmarks "notext", False
        ' the next line copies the active document
        Set newDOC = Documents.Add(ThisDocument.FullName, True, wdNewBlankDocument, False)
        On Error Resume Next
        newDOC.Convert 'works in word2013 but possibly not word2010, hence error handling
        
        ' unlink fields and finalize content to avoid updates within the archived documents
        Dim oFld As field
        For Each oFld In newDOC.Fields
            oFld.Unlink
        Next
        
        ' the next line saves the copy to your location and name
        newDOC.SaveAs2 filename:=fileSaveName.SelectedItems(1), fileformat:=wdFormatXMLDocument
        ' next line closes the copy leaving you with the original document
        newDOC.Close
        MsgBox (fileSaveName.SelectedItems(1) & vbNewLine & setup("archive.successPrompt"))
    End If
End Sub

Public Sub PDFPublish()
    ''''''' publish as pdf '''''''
    With Application.FileDialog(msoFileDialogSaveAs)
        .InitialFileName = ThisDocument.path & "\" & CStr(ThisDocument.Variables("title").Value) & ".pdf"
        .AllowMultiSelect = False
        .title = setup("publish.pdfconfirmPrompt")
        If .Show = -1 Then
            ' show all available options for pdf
            hideBookmarks "text", False
            hideBookmarks "notext", True
            PDFFile = .SelectedItems(1)
            ' msoFileDialogSaveAs does not support filetypes, hence forcing extension
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

Public Sub DOCMPublish()
    ''''''' publish as interactive docm, protected content, usable form fields '''''''
    Dim fileSaveName As Variant
    Set fileSaveName = Application.FileDialog(msoFileDialogSaveAs)
    fileSaveName.InitialFileName = ThisDocument.path & "\" & CStr(ThisDocument.Variables("title").Value) & ".docm"
    fileSaveName.title = setup("publish.docmconfirmPrompt")
    If fileSaveName.Show = -1 Then
        ' msoFileDialogSaveAs does not support filetypes, hence forcing extension
        DOCMFile = fileSaveName.SelectedItems(1)
        DOCMFile = Replace(DOCMFile, ".doc", ".docm")
        DOCMFile = Replace(DOCMFile, ".docmx", ".docm")
        
        ' published docm-files must not be saved into the same folder, because they would overwrite the draft!!
        If DOCMFile = ThisDocument.path & "\" & CStr(ThisDocument.Variables("title").Value) & ".docm" Then
            If MsgBox(setup("publish.docmdestinationError"), vbRetryCancel + vbExclamation, setup("publish.docmdestinationErrorTitle")) = vbRetry Then
                DOCMPublish
            Else
                Exit Sub
            End If
        Else
        
            ' save changes to original document
            ThisDocument.Save
            ' unset all available options by default
            hideBookmarks "text", True
            hideBookmarks "notext", False

            ' the next line copies the active document, not displaying it most probably does not _
            initiate execution of macros and avoids issues on replacing them on runtime, at least it seems
            Set newDOC = Documents.Add("", True, wdNewBlankDocument, False)
            
            ThisDocument.Content.Copy
            dim rng
            Set rng = newDoc.Content
            rng.Collapse Direction:=wdCollapseEnd
            rng.Paste
            ' clear clipboard, otherwise an annoying msg popy up everytime because huge content is left there from copying
            Dim clscb As New DataObject 'object to use the clipboard
            clscb.SetText text:=Empty
            clscb.PutInClipboard 'put void into clipboard

            On Error Resume Next
            newDOC.Convert ' works in word2013 but possibly not word2010, hence error handling
            
            ' unlink fields and finalize content to avoid updates within the archived documents
            ' within body
            Dim oFld As field
            For Each oFld In newDOC.Fields
                oFld.Unlink
            Next
            ' within header, footer
            Dim rngStory As Word.Range
            Dim rngNext As Word.Range
            Dim lngJunk As Long
            Dim oShp As Shape
            lngJunk = ThisDocument.Sections(1).Headers(1).Range.StoryType
            For Each rngStory In ThisDocument.StoryRanges
            ' Iterate through all linked stories/fields
                Do
                    On Error Resume Next
                    rngStory.Fields.Update
                    rngStory.Fields.Unlink
                    ' occasionally linked headers
                    Set rngNext = rngStory.NextStoryRange
                    Do Until rngNext Is Nothing
                        ' Unlink fields in this header
                        rngNext.Fields.Unlink
                        ' Link to next story (if any)
                        Set rngNext = rngNext.NextStoryRange
                    Loop
                    On Error GoTo 0
                    ' get next linked story (if any)
                    Set rngStory = rngStory.NextStoryRange
                Loop Until rngStory Is Nothing
            Next
            
            ' rewrite macros and unload modules
            On Error Resume Next
            Dim Element As Object
            For Each Element In newDOC.VBProject.VBComponents
                newDOC.VBProject.VBComponents.Remove Element
            Next
            Rewrite.rewriteMain newDoc, "ThisDocument", ThisDocument.parentPath & "vb_library\Document_Public_DOCM.vba"

            ' docvar-field in textboxes seem to be unaffected by the unlinking procedure above _
            and i am not able to figure out why. so ffs the most relevant variables will be passed as well
            newDoc.Variables("version").Value = ThisDocument.Variables("version").Value
            newDoc.Variables("releasedate").Value = ThisDocument.Variables("releasedate").Value
            newDoc.Variables("title").Value = ThisDocument.Variables("title").Value

            ' protect content
            newDOC.Protect wdAllowOnlyFormFields, Password:="LoremIpsum"
            
            ' the next line saves the copy to your location and name
            newDOC.SaveAs2 filename:=DOCMFile, fileformat:=wdFormatXMLDocumentMacroEnabled
                    
            ' next line closes the copy leaving you with the original document
            newDOC.Close
            
            MsgBox (setup("publish.successPrompt") & " " & vbNewLine & DOCMFile)
        End If
    Else
        DOCMFile = ""
    End If
End Sub

Public Sub UpdateListOfDocuments()
    ''''''' update list of documents in force '''''''
    Dim objFile As Variant
    Dim file As String
    Dim xlApp As Object, xlWB As Object, xlSheet As Object
    Dim i As Long, rCount As Long, bXStarted As Boolean
    Dim strPath As String
    
    ' open file dialog for selecting data export file (path)
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
        ' open file and define workbook and -sheet
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
        
        ' set flag within excel file to control from where it was opened _
        sub has to be present in file. their handler processes the value, _
        e.g preventing certain executions that would mess something up
        xlApp.Run "Specific.openedFromWord", True
        
        Set xlSheet = xlWB.Sheets(1)
        
        ' find the last empty line of the worksheet and define range
        rCount = xlSheet.Range(setup("updateList.documentTitle") & xlSheet.Rows.Count).End(-4162).Row
        rCount = rCount + 1
        
        ' change rCount from range to row-number of existing identifier to update if existent
        For i = 1 To rCount
            If xlSheet.Range(setup("updateList.documentTitle") & i).Value = ThisDocument.Variables("title").Value Then
                rCount = i
                Exit For
            End If
        Next
        
        ' update or insert values for title and version in dependent columns
        ThisDocument.Repaginate 'occasionally update site numbers
        xlSheet.Range(setup("updateList.documentNovel") & rCount).Value = "*"
        xlSheet.Range(setup("updateList.documentTitle") & rCount).Value = ThisDocument.Variables("title").Value
        xlSheet.Range(setup("updateList.documentVersion") & rCount).Value = "V" + CStr(currentDocumentVersion) + _
            "." + CStr(ThisDocument.Variables("releasedate").Value)
        ' link to word document
        xlSheet.Hyperlinks.Add Anchor:=xlSheet.Range(setup("updateList.documentHyperlink") & rCount), _
            Address:=ThisDocument.FullName, _
            TextToDisplay:=ThisDocument.FullName
        ' format of published file
        Dim fileformat: fileformat = ""
        If PDFFile <> "" Then fileformat = "PDF"
        If DOCMFile <> "" Then fileformat = "DOCM"
        If fileformat <> "" Then xlSheet.Range(setup("updateList.documentFormat") & rCount).Value = CStr(fileformat)
        
        ' link to published pdf document in case a column is specified above. unlike the other values this is not mandatory
        If setup("updateList.documentPDFHyperlink") <> "" And (PDFFile <> "" Or DOCMFile <> "") Then
            xlSheet.Hyperlinks.Add Anchor:=xlSheet.Range(setup("updateList.documentPDFHyperlink") & rCount), _
            Address:=PDFFile & DOCMFile, _
            TextToDisplay:=PDFFile & DOCMFile
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

Public Function customUserInput(ByRef promptVar As Collection) As String
    ' creates a temporary userform to return a selected option by button _
    expects a collection with _
    window-caption, label and cancel-button-caption as string _
    options as an array of string. _
    false height calculates the form height by number of options, integer overrides for longer label content. _
    returns the selected options value or false on cancel _
 _
    7.2021: for some reason, i was unable to find about after several hours of research, _
    this leads to a state loss, yeeting any public variable and Word-Application-instance into the void _
    therefore the behaviour of triggering versioning and publishing had to be refactored from _
    Application.DocumentBeforeSave event to adding a form field triggering the macros
    
    ' hide vbe window to prevent screen flashing
'    Application.VBE.MainWindow.Visible = False
    
    Dim TempForm: Set TempForm = ThisDocument.VBProject.VBComponents.Add(3)
    ' add options
    Dim buttons As Object
    Set buttons = CreateObject("Scripting.Dictionary")
    Dim buttonsAction As New Collection
    Dim button
    For button = 0 To UBound(promptVar("options"))
        Set buttons(button) = TempForm.Designer.Controls.Add("forms.CommandButton.1")
        buttonsAction.Add "ActiveDocument.Variables(" & Chr(34) & "userInput" & Chr(34) & ").Value = " & Chr(34) & CStr(promptVar("options")(button)) & Chr(34) & ": Me.Hide"
        
        With buttons(button)
            .Caption = CStr(promptVar("options")(button))
            .Height = 18
            .Width = 57
            .Left = 240
            .Top = 8 + 22 * button
        End With
    Next
    
    ' add cancel button
    Set buttons(UBound(promptVar("options")) + 1) = TempForm.Designer.Controls.Add("forms.CommandButton.1")
    buttonsAction.Add "ActiveDocument.Variables(" & Chr(34) & "userInput" & Chr(34) & ").Value = False: Me.Hide"
    With buttons(UBound(promptVar("options")) + 1)
        .Caption = promptVar("cancel")
        .Height = 18
        .Width = 57
        .Left = 240
        .Top = 8 + 22 * (UBound(promptVar("options")) + 1)
    End With
    
    ' determine form height or override with given height for larger label
    Dim formHeight
    If promptVar("height") Then
        formHeight = promptVar("height")
    Else
        formHeight = 16 + 22 * (buttons.Count + 2)
    End If
    
    ' add label
    Dim NewLabel: Set NewLabel = TempForm.Designer.Controls.Add("forms.label.1")
    With NewLabel
        .Caption = promptVar("label")
        .Width = 204
        .Height = formHeight - 48
        .Left = 8
        .Top = 8
    End With
    
    ' add event-handler subs for the buttons & userform
    Dim X As Integer
    Dim btn
    With TempForm.CodeModule
        X = .CountOfLines
        .insertlines X + 1, "Private Sub UserForm_Initialize()"
        .insertlines X + 2, "'Application.EnableCancelKey = xlErrorHandler"
        .insertlines X + 3, "End Sub"
        For btn = 0 To buttons.Count - 1
            .insertlines X + 3 * btn + 1, "Sub CommandButton" & btn + 1 & "_Click()"
            .insertlines X + 3 * btn + 2, buttonsAction(btn + 1)
            .insertlines X + 3 * btn + 3, "End Sub"
        Next
    End With
    
    ' adjust the form
    With TempForm
        .Properties("Caption") = promptVar("caption")
        .Properties("Width") = 315
        .Properties("Height") = formHeight
        .Properties("StartUpPosition") = 2 ' screen center
    End With
    
    ' show the form
    VBA.UserForms.Add(TempForm.Name).Show
    
    ' pass the variable back
    customUserInput = ActiveDocument.Variables("userInput").Value
    
    ' delete the form
    ThisDocument.VBProject.VBComponents.Remove VBComponent:=TempForm
End Function
