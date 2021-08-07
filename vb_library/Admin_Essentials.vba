Attribute VB_Name = "Essentials"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit
Public fileSaveName As Variant
Public docFolder, pdfFolder As String
Public WritePermission As Boolean
Public monitorOverride As Boolean


''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' general module handler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Modules() As Object
    Set Modules = CreateObject("Scripting.Dictionary")
    Modules.Add "Locals", ThisWorkbook.parentPath & "vb_library\" & "Admin_Locals_" & ThisWorkbook.selectedLanguage & ".vba"
    Modules.Add "Specific", ThisWorkbook.parentPath & "vb_library\" & "Admin_" & ThisWorkbook.Name & ".vba"
    Modules.Add "Rewrite", ThisWorkbook.parentPath & "vb_library\RewriteMain.vba"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' events
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub openRoutine()
    If ThisWorkbook.importModules(Modules()) Then asyncOpen
End Sub

Public Sub asyncOpen()
    'Rewrite.rewriteMain ThisWorkbook, "DieseArbeitsmappe", ThisWorkbook.parentPath & "vb_library\Admin_ThisWorkbook_illustration.vba"
    Specific.openRoutine
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Specific.closeRoutine SaveAsUI, Cancel
End Sub

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' common and reusable functions
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function SanitizeString(ByVal output As String) As String
    output = Replace(output, Chr(34), "'")
    SanitizeString = Replace(output, "\", "/")
End Function

Public Sub WriteFile(ByVal path As Variant, content As String)
    Dim fso As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Dim oFile As Object
    Set oFile = fso.CreateTextFile(path, True, True)
    oFile.WriteLine content
    oFile.Close
    Set fso = Nothing
    Set oFile = Nothing
End Sub

Public Function LastRowOrColumn(ByVal WB As Workbook, ByVal rowcol As String, ByVal sheet As Variant, ByVal startrow As Variant, ByVal column As Variant, ByVal max As Variant) As Integer
    'returns integer of last row or colums for a given sheet with starting cell and maybe predefined maximum
    If rowcol = "rows" Then
        If max Then
            LastRowOrColumn = WB.Worksheets(sheet).Range(column & startrow).Row + max
        Else
            LastRowOrColumn = WB.Worksheets(sheet).Range(column & Rows.Count).End(xlUp).Row
        End If
    ElseIf rowcol = "cols" Then
        If max Then
            LastRowOrColumn = WB.Worksheets(sheet).Range(column & 1).column + max
        Else
            LastRowOrColumn = WB.Worksheets(sheet).Cells(startrow, Columns.Count).End(xlToLeft).column
        End If
    End If
End Function

Public Function convertColumn(ByVal destinationFormat As String, ByVal inputColumn As Variant) As Variant
    If destinationFormat = "2letter" Then
        convertColumn = Split(Cells(1, inputColumn).Address(True, False), "$")(0)
    ElseIf destinationFormat = "2number" Then
        convertColumn = Range(inputColumn & 1).column
    End If
End Function

Public Function Path2Link(ByVal path As Variant, ByVal replacePath As Boolean, ByVal fileFormat As String) As String
    'can replace path segments, extension and makes path html-comprehensible, which works for excel links as well
    If replacePath Then path = Replace(path, docFolder, pdfFolder)
    If fileFormat <> "" Then path = Replace(path, ".docm", "." & LCase(fileFormat))
    Path2Link = Replace(path, "\", "/")
End Function

Function collectionKeyExists(ByRef col As Collection, key As String) As Boolean
    Dim v As Variant
    On Error Resume Next
    v = IsObject(col.Item(key))
    collectionKeyExists = Not IsEmpty(v)
End Function

Public Sub basicTableToJSON(var As Collection)
    'writes basically the tables contents to a json object
    'dependent on a collection with values for _
    matrix - sheet with cells available for being checked _
    m.column - column to start range with matrix to check _
    m.headerrow - row to check for maximum number of columns if m.maxcolumns remains empty, actual descriptive header row _
    m.maxcolumns - maximum number of columns to include into matrix, _
            null if all, integer if non comparable columns are on the right side to the matrix _
    export.defaultFile - default file name with path _
    export.prompt - language dependent file selector title _
    export.objectName - json object name _
    export.dontSkipEmpty - add empty cells or not _
    m.contentColumn - depending on former setting, skips if cell in row of this column is empty
    
    'select js-file to export to
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.defaultFile"), FileFilter:="JavaScript Files (*.js), *.js", Title:=var("export.prompt"))
    If fileSaveName <> False Then
        'set up dynamic range of matrix
        'maximum rows of matrix according to main column
        Dim matrixallrows As Integer: matrixallrows = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.startColumn") & Rows.Count).End(xlUp).Row
        'maximum columns of matrix according to header row or var("matrix.maxColumns")
        Dim matrixcols As Integer: matrixcols = Essentials.LastRowOrColumn(ThisWorkbook, "cols", var("matrix.sheet"), var("matrix.headerRow"), var("matrix.startColumn"), var("matrix.maxColumns"))
        'load ranges into one-dimensional array variable variant _
        to avoid uneccessary interaction between excel-shets and vba for performance reasons
        Dim msheet As Variant: msheet = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.startColumn") & var("matrix.headerRow") & ":" & Essentials.convertColumn("2letter", matrixcols) & matrixallrows)
        'loop through the matrix and set up JS-Object row-wise
        Dim mrow As Long
        Dim mcol As Long
        Dim intermediate As String
        Dim entry As Long
        Dim finally As String
        finally = "//this file was automatically created by <" & ThisWorkbook.Name & ">" & vbNewLine & vbNewLine & _
            "var " & var("export.objectName") & "={content:[" & vbNewLine
        For mrow = LBound(msheet, 1) To UBound(msheet, 1)
            'clear intermediate result for row
            entry = entry + 1
            If var("export.dontSkipEmpty") Or msheet(mrow, var("m.contentcolumn")) <> "" Then
                intermediate = "["
                For mcol = LBound(msheet, 2) To UBound(msheet, 2)
                        intermediate = intermediate & Chr(34) & SanitizeString(msheet(mrow, mcol)) & Chr(34) & ", "
                Next mcol
                finally = finally & intermediate & "]," & vbNewLine
            End If
        Next mrow
        finally = finally & "]};"
        WriteFile fileSaveName, finally
    End If
End Sub

Public Sub doclistExport(var As Collection, ByVal replacePath As Boolean, ByVal alterFileExtention As Boolean)
    'dependent on a collection with values for _
    matrix - sheet with cells available for being checked _
    m.output - column with rows for being checked and entries to be returned as results _
    m.headerrow - row to check for maximum number of columns if m.maxcolumns remains empty, actual descriptive header row _
    m.maxcolumns - maximum number of columns to include into matrix, _
            null if all, integer if non comparable columns are on the right side to the matrix _

    'set up dynamic range of matrix
    'maximum rows of matrix according to main column
    Dim matrixallrows As Integer: matrixallrows = LastRowOrColumn(ThisWorkbook, "rows", var("documentlist.sheet"), var("documentlist.headerRow"), var("documentlist.displayColumn"), var("documentlist.maxRows"))
  
    Dim mexp As Variant: mexp = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.linkColumn") & var("matrix.headerRow") + 1 & ":" & var("matrix.linkColumn") & matrixallrows)
    Dim malt As Variant
    Dim maltvalue As String
    If var("matrix.displayAlternativeColumn") <> "" Then malt = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.displayAlternativeColumn") & var("matrix.headerRow") + 1 & ":" & var("matrix.displayAlternativeColumn") & matrixallrows)
    Dim msearch As Variant: msearch = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.searchTermColumn") & var("matrix.headerRow") + 1 & ":" & var("matrix.searchTermColumn") & matrixallrows)
    Dim mformat As Variant
    If collectionKeyExists(var, "matrix.documentFormat") Then mformat = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.documentFormat") & var("matrix.headerRow") + 1 & ":" & var("matrix.documentFormat") & matrixallrows)
    Dim documentFormat
    
    'export js-file with object containing file links _
    taking doc-files and changing docm-extension to pdf _
    using export-variables
    Dim fileSaveName As Variant
    Dim fileFormat As String
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.defaultFile"), FileFilter:="JavaScript Files (*.js), *.js", Title:=var("export.prompt"))
    If fileSaveName <> False Then
        If replacePath And (pdfFolder = "" Or docFolder = "") Then
            docFolder = InputBox(var("export.ReplaceFromPrompt"), var("export.ReplaceFromTitle"), var("export.ReplaceFromDefaultPath"))
            pdfFolder = InputBox(var("export.ReplaceToPrompt"), var("export.ReplaceToTitle"), var("export.ReplaceToDefaultPath"))
            End If
        If Not replacePath Or (replacePath And Not (pdfFolder = vbNullString And docFolder = vbNullString)) Then
            Dim content As String
            content = "//this file was automatically created by <" & ThisWorkbook.Name & ">" & vbNewLine & vbNewLine & _
                var("export.objectName") & "={content:[" & vbNewLine
            Dim mrow As Long
            For mrow = LBound(mexp, 1) To UBound(mexp, 1)
                If mexp(mrow, 1) <> "" Then
                    If var("matrix.displayAlternativeColumn") <> "" Then maltvalue = SanitizeString(malt(mrow, 1))
                    If alterFileExtention Then
                        documentFormat = CStr(mformat(mrow, 1))
                    Else
                        documentFormat = ""
                    End If
                    content = content & "[" & Chr(34) & Path2Link(mexp(mrow, 1), replacePath, documentFormat) & Chr(34) & "," & Chr(34) & maltvalue & Chr(34) & "," & Chr(34) & SanitizeString(msearch(mrow, 1)) & Chr(34) & "]," & vbNewLine
                End If
            Next mrow
            content = content + "]};"
            WriteFile fileSaveName, content
        Else
            MsgBox var("export.ErrorMsg")
        End If
    End If
End Sub

Public Sub exportXLS(var As Variant)
    'exports a excel-file without macros
    Dim fileSaveName As Variant
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.xlsDefaultFile"), FileFilter:="Excel (*.xlsx), *.xlsx", Title:=var("export.xlsPrompt"))
    If fileSaveName <> False Then
        ThisWorkbook.Sheets().Copy
        Dim WB As Workbook
        Set WB = ActiveWorkbook
        WB.SaveAs Filename:=fileSaveName, fileFormat:=xlOpenXMLWorkbook, _
            Password:="", WriteResPassword:="", ReadOnlyRecommended:=False, _
            CreateBackup:=False
        ActiveWorkbook.Close False
   End If
End Sub

Public Sub exportXLS2PDF(var As Variant)
    'exports a excel-file without macros
    Dim fileSaveName As Variant
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.xlsDefaultFile"), FileFilter:="PDF (*.pdf), *.pdf", Title:=var("export.xlsPrompt"))
    If fileSaveName <> False Then
                ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:=fileSaveName
        End If
End Sub

Public Sub createMail(ByVal rcpt As String, ByVal subject As String, ByVal mailtext As String)
    Dim eMail As Object
    Set eMail = CreateObject("Outlook.Application")
    Dim newmail As Object
    Set newmail = eMail.CreateItem(0)
    
    newmail.To = rcpt
    newmail.subject = subject
    newmail.HTMLBody = mailtext
    
    newmail.Display
    
    'release object references.
    Set eMail = Nothing
    Set newmail = Nothing
End Sub

Public Function getWritePermission() As Boolean
    getWritePermission = False
    Dim tempfile: tempfile = ActiveWorkbook.path & "\writepermission.temp"
    On Error GoTo denied
        Dim fso As Object
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim oFile As Object
        Set oFile = fso.CreateTextFile(tempfile, True, True)
        oFile.WriteLine "1"
        oFile.Close
        Set fso = Nothing
        Set oFile = Nothing
        
        Kill tempfile
        getWritePermission = True
denied:
    On Error GoTo 0
End Function

Public Sub monitorRowsColumns(ByVal Sh As Object, ByVal target As Range)
    ' load monitor setup, because a public variable gets emptied after finishing the open routine for some freaking reason
    Dim setup As New Collection
    Set setup = Specific.monitorSetup()
    Dim regEx As Object
    Set regEx = CreateObject("vbscript.regexp")
    regEx.Global = True
    Dim patternMatch
    Dim TargetPattern

    If Not target Is Nothing And (setup("monitor.rows")(0) Or setup("monitor.columns")(0)) And Not monitorOverride Then
        'proceed if Target-range is of format $123:$123 or $A:$A only
        regEx.pattern = "\$\d+:\$\d+"
        If regEx.Execute(target.Address).Count And setup("monitor.rows")(0) Then
            ' monitor deletion or insertion of rows
            Select Case MsgBox(setup("monitor.rows")(2), vbYesNo + vbDefaultButton2 + vbQuestion, setup("monitor.rows")(1))
                Case vbNo
                    monitorOverride = True
                    Application.undo
                    Exit Sub
            End Select
        End If
        regEx.pattern = "(\$\D:\$\D)"
        If regEx.Execute(target.Address).Count And setup("monitor.columns")(0) Then
            ' monitor deletion or insertion of rows
            Select Case MsgBox(setup("monitor.columns")(2), vbYesNo + vbDefaultButton2 + vbQuestion, setup("monitor.columns")(1))
                Case vbNo
                    monitorOverride = True
                    Application.undo
                    Exit Sub
            End Select
        End If
    End If
    monitorOverride = False
End Sub
