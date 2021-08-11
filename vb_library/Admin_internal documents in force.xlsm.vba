Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit
Public openedFromWordFlag As Boolean

Public Function monitorSetup() As Collection
    ' this has to be a function, because a public variable gets emptied after finishing the open routine for some freaking reason
    Set monitorSetup = Locals.monitorInternalDocuments()
End Function

Public Sub openRoutine()
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As New Collection
    Set setup = Locals.setupInternalDocuments
    updateContent setup
    
    If Not openedFromWordFlag Then
        Select Case MsgBox(setup("initiate.Confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, setup("initiate.Title"))
        Case vbYes
            exportXLS setup
            ' harmonize elements for intermodule compatibility
            setup.Add setup("documentlist.sheet"), "matrix.sheet"
            setup.Add setup("documentlist.linkColumn"), "matrix.linkColumn"
            setup.Add setup("documentlist.headerRow"), "matrix.headerRow"
            setup.Add setup("documentlist.documentFormat"), "matrix.documentFormat"
            setup.Add setup("documentlist.searchTermColumn"), "matrix.searchTermColumn"
            setup.Add "", "matrix.displayAlternativeColumn"
            setup.Add setup("export.listdefaultFile"), "export.defaultFile"
            setup.Add setup("export.listPrompt"), "export.prompt"
            
            Essentials.doclistExport setup, True, True
            bundleExport setup
        'Case vbNo
        End Select
    End If
End Sub

Public Sub openedFromWord(ByVal flag As Boolean)
    ' if opened by word document this sub is called, public var set and exports disabled
    openedFromWordFlag = flag
End Sub

Public Sub updateContent(var As Collection)
    ''''' update and process document list and norm dependencies '''''

    'to make the result more comprehensible add =IF(A3<>"";IF(B3="";TRUE;FALSE);FALSE) _
    for conditional format in the column beside the checklist (e.g. range =$B$3:$B$400)
    
    'setup range object of checklist (column)
    Dim rng As Range
    With ThisWorkbook.Worksheets(var("normcheck.sheet"))
        Set rng = .Range(.Cells(var("normcheck.headerRow") + 1, var("normcheck.startColumn")), .Cells(.Rows.Count, var("normcheck.startColumn")).End(xlUp))
    End With
    'update name for matrix-dropdown according to range
    With ThisWorkbook.Names(var("normcheck.rangeName"))
        .RefersTo = rng
    End With
    
    'assign documents to norm check
    'hand over customizable variables from top of script
    Dim assignment As New Collection
    assignment.Add var("documentlist.sheet"), "matrix.sheet"
    assignment.Add var("documentlist.displayColumn"), "matrix.displayColumn"
    assignment.Add var("documentlist.startColumn"), "matrix.startColumn"
    assignment.Add var("documentlist.headerRow"), "matrix.headerRow"
    assignment.Add var("documentlist.maxRows"), "matrix.maxRows"
    assignment.Add var("documentlist.maxColumns"), "matrix.maxColumns"
    assignment.Add var("normcheck.sheet"), "compare.sheet"
    assignment.Add var("normcheck.startColumn"), "compare.displayColumn"
    assignment.Add var("normcheck.headerRow"), "compare.headerRow"
    assignment.Add rng, "compare.range"
    assignment.Add "doclist", "caller" 'since the assignment works twisted for the current calling subs the function has to be told for whom the result has to be prepared

    Dim data() As Variant: data = Assign(assignment)
    'redimension result array to second column to fit it into the corresponding range within checklist
    Dim insert() As Variant: ReDim insert(UBound(data, 1), 0)
    Dim i As Variant
    For i = LBound(data, 1) To UBound(data, 1)
        insert(i, 0) = data(i, 1)
    Next i

    'insert result to the right of checklist column
    Range(rng.Offset(0, 1), rng.Offset(0, 1)).Value = insert
    ''''' update document list range name for dropdown in document bundles '''''

    'setup range object of checklist (column)
    'Dim rng As Range
    With ThisWorkbook.Worksheets(var("documentlist.sheet"))
        Set rng = .Range(.Cells(var("documentlist.headerRow") + 1, var("documentlist.displayColumn")), .Cells(.Rows.Count, var("documentlist.displayColumn")).End(xlUp))
    End With
    'update name for matrix-dropdown according to range
    With ThisWorkbook.Names(var("documentlist.rangeName"))
        .RefersTo = rng
    End With
End Sub

Public Sub bundleExport(var As Collection)
    'exports a javascript-file with object containing file links _
    taking doc-files and changing docm-extension to pdf _
    using export-variables
    
    Dim fileSaveName As Variant
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.bundleDefaultFile"), FileFilter:="JavaScript Files (*.js), *.js", Title:=var("export.bundlePrompt"))
    If fileSaveName <> False Then
        If pdfFolder = "" Or docFolder = "" Then
        docFolder = InputBox(var("export.ReplaceFromPrompt"), var("export.ReplaceFromTitle"), var("export.ReplaceFromDefaultPath"))
        pdfFolder = InputBox(var("export.ReplaceToPrompt"), var("export.ReplaceToTitle"), var("export.ReplaceToDefaultPath"))
        End If
        If Not (pdfFolder = vbNullString And docFolder = vbNullString) Then
            Dim matrixallrows As Integer: matrixallrows = Essentials.LastRowOrColumn(ThisWorkbook, "rows", var("documentlist.sheet"), var("documentlist.headerRow"), var("documentlist.displayColumn"), var("documentlist.maxRows"))
            Dim mlink As Variant: mlink = ThisWorkbook.Worksheets(var("documentlist.sheet")).Range(var("documentlist.displayColumn") & var("documentlist.headerRow") + 1 & ":" & var("documentlist.linkColumn") & matrixallrows)
            Dim headerrow As Range
            Dim lrow As Long
            Dim files As Variant
            Dim file As Variant
            Dim path As String
            Dim intermediate As String
            Dim bundlemaxcolumns As Variant: bundlemaxcolumns = Essentials.LastRowOrColumn(ThisWorkbook, "cols", var("bundles.sheet"), var("bundles.headerRow"), var("bundles.displayColumn"), var("bundles.maxColumns"))
            Dim mformat As Variant
            If Essentials.collectionKeyExists(var, "documentlist.documentFormat") Then mformat = ThisWorkbook.Worksheets(var("documentlist.sheet")).Range(var("documentlist.documentFormat") & var("documentlist.headerRow") + 1 & ":" & var("documentlist.documentFormat") & matrixallrows)
            Dim documentFormat: documentFormat = ""
            
            Dim finally As String: finally = "//this file was automatically created by <" & ThisWorkbook.Name & ">" & vbNewLine & vbNewLine & _
                "var EXCEPTIONS={" & vbNewLine
            
            'assign exceptions
            With ThisWorkbook.Worksheets(var("bundles.sheet"))
                Set headerrow = .Cells.Find(what:=var("bundles.exceptionHeader"), After:=.Cells(1, 1), _
                LookIn:=xlValues, lookat:=xlPart, SearchOrder:=xlByRows, _
                SearchDirection:=xlNext, MatchCase:=False, SearchFormat:=False)
            End With
            Dim assignment As New Collection
            assignment.Add var("bundles.sheet"), "matrix.sheet"
            assignment.Add var("bundles.displayColumn"), "matrix.displayColumn"
            assignment.Add var("bundles.startColumn"), "matrix.startColumn"
            assignment.Add headerrow.Row, "matrix.headerRow"
            assignment.Add 2, "matrix.maxRows"
            assignment.Add bundlemaxcolumns, "matrix.maxColumns"
            assignment.Add var("documentlist.sheet"), "compare.sheet"
            assignment.Add var("documentlist.displayColumn"), "compare.displayColumn"
            assignment.Add var("documentlist.headerRow"), "compare.headerRow"
            assignment.Add "docbundles", "caller" 'since the assignment works twisted for the current calling subs the function has to be told for whom the result has to be prepared
            Dim data() As Variant: data = Assign(assignment)
            
            Dim bundle As Integer
            For bundle = LBound(data, 1) To UBound(data, 1)
                intermediate = ""
                If data(bundle, 0) <> "" Then
                    If bundle = 1 Then finally = finally & "noserialprint:[" & vbNewLine
                    If bundle = 2 Then finally = finally & "addtobundle:[" & vbNewLine
                    files = Split(data(bundle, 1), ";")
                    For Each file In files
                        path = ""
                        documentFormat = ""
                        'loop through document list, compare document titles and add corresponding file link to intermediate result
                            For lrow = LBound(mlink, 1) To UBound(mlink, 1)
                                If Not IsEmpty(mformat) Then documentFormat = CStr(mformat(lrow, 1))
                                If Trim(mlink(lrow, 1)) = Trim(file) Then
                                path = Essentials.Path2Link(mlink(lrow, UBound(mlink, 2)), True, documentFormat)
                            End If
                        Next lrow
                        If path = "" Then path = Essentials.Path2Link(Trim(file), True, documentFormat)
                        intermediate = intermediate & Chr(34) & path & Chr(34) & "," & vbNewLine
                    Next file
                    finally = finally & intermediate & "]," & vbNewLine
                End If
            Next bundle
            finally = finally & "};" & vbNewLine
            
            'reset collection
            Set assignment = New Collection
            
            'assign document bundles
            With ThisWorkbook.Worksheets(var("bundles.sheet"))
                Set headerrow = .Cells.Find(what:=var("bundles.bundleHeader"), After:=.Cells(1, 1), _
                LookIn:=xlValues, lookat:=xlPart, SearchOrder:=xlByRows, _
                SearchDirection:=xlNext, MatchCase:=False, SearchFormat:=False)
            End With
            assignment.Add var("bundles.sheet"), "matrix.sheet"
            assignment.Add var("bundles.displayColumn"), "matrix.displayColumn"
            assignment.Add var("bundles.startColumn"), "matrix.startColumn"
            assignment.Add headerrow.Row, "matrix.headerRow"
            assignment.Add var("bundles.maxRows"), "matrix.maxRows"
            assignment.Add bundlemaxcolumns, "matrix.maxColumns"
            assignment.Add var("documentlist.sheet"), "compare.sheet"
            assignment.Add var("documentlist.displayColumn"), "compare.displayColumn"
            assignment.Add var("documentlist.headerRow"), "compare.headerRow"
            assignment.Add "docbundles", "caller" 'since the assignment works twisted for the current calling subs the function has to be told for whom the result has to be prepared
            data = Assign(assignment)

            'result dictionary for bundles
            Dim resultbundles As Object
            Set resultbundles = CreateObject("Scripting.Dictionary")
            Dim resultbundlekey As String
            
            For bundle = LBound(data, 1) To UBound(data, 1)
                intermediate = ""
                If data(bundle, 0) <> "" Then
                    files = Split(data(bundle, 1), ";")
                    For Each file In files
                        path = ""
                        documentFormat = ""
                        'loop through document list, compare document titles and add corresponding file link to intermediate result
                        For lrow = LBound(mlink, 1) To UBound(mlink, 1)
                            If Not IsEmpty(mformat) Then documentFormat = CStr(mformat(lrow, 1))
                            If Trim(mlink(lrow, 1)) = Trim(file) Then
                                path = Essentials.Path2Link(mlink(lrow, UBound(mlink, 2)), True, documentFormat)
                            End If
                        Next lrow
                        If path = "" Then path = Essentials.Path2Link(Trim(file), True, documentFormat)
                        intermediate = intermediate & Chr(34) & path & Chr(34) & "," & vbNewLine
                    Next file
                    'add intermediate result to result array. at the moment this groups to two groups based on the last character group of _
                    bundle name. given more different character groups will result in multiple outputs of different secondary groups
                    resultbundlekey = Left(data(bundle, 0), InStrRev(data(bundle, 0), " "))
                    resultbundlekey = Replace(Trim(resultbundlekey), " ", "_")
                    If Not resultbundles.exists(resultbundlekey) Then
                        resultbundles(resultbundlekey) = "primary:[" & vbNewLine & intermediate & "]," & vbNewLine
                    Else
                        resultbundles(resultbundlekey) = resultbundles(resultbundlekey) & "secondary:[" & vbNewLine & intermediate & "],"
                    End If
                End If
            Next bundle
            'process the result-dictionary to the js-object output
            finally = finally & "var documentbundles_data={" & vbNewLine
            Dim res As Variant
            For Each res In resultbundles.keys
                finally = finally & res & ":{" & vbNewLine & resultbundles(res) & vbNewLine & "}," & vbNewLine
            Next res
            finally = finally & "};" & vbNewLine
            
            Essentials.WriteFile fileSaveName, finally, False
        Else
            MsgBox var("export.ErrorMsg")
        End If
    End If
End Sub

Public Function Assign(var As Variant) As Variant
    'returns an two dimensional array of concatenated strings that list up special matches to assigned values within the sheets
   
    'set up dynamic range of matrix
    'maximum rows of matrix according to main column or var("matrix.maxRows")
    Dim matrixallrows As Integer: matrixallrows = Essentials.LastRowOrColumn(ThisWorkbook, "rows", var("matrix.sheet"), var("matrix.headerRow"), var("matrix.displayColumn"), var("matrix.maxRows"))
    'maximum columns of matrix according to header row or var("matrix.maxColumns")
    Dim matrixcols As Integer: matrixcols = Essentials.LastRowOrColumn(ThisWorkbook, "cols", var("matrix.sheet"), var("matrix.headerRow"), var("matrix.displayColumn"), var("matrix.maxColumns"))
    'load ranges into one-dimensional array variable variant _
    to avoid uneccessary interaction between excel-shets and vba for performance reasons
    Dim msheet As Variant: msheet = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.startColumn") & var("matrix.headerRow") + 1 & ":" & Essentials.convertColumn("2letter", matrixcols) & matrixallrows)
    Dim mcomp As Variant: mcomp = ThisWorkbook.Worksheets(var("matrix.sheet")).Range(var("matrix.displayColumn") & var("matrix.headerRow") + 1 & ":" & var("matrix.displayColumn") & matrixallrows)
    Dim csheet As Variant
    If var("caller") = "doclist" Then csheet = var("compare.range").Offset(1, 0).Resize(var("compare.range").Rows.Count - 1).Cells
    If var("caller") = "docbundles" Then csheet = msheet
    
    'loop through the ranges and compare matrix values with checklist values
    Dim crow As Long
    Dim mrow As Long
    Dim mcol As Long
    'result array to be 2 dimensional with key (0) and value (1)
    Dim result() As Variant: ReDim Preserve result(UBound(csheet, 1), 1)
    Dim key As String
    Dim intermediate As String
    
    For crow = LBound(csheet, 1) To UBound(csheet, 1)
    'clear intermediate result for row
        intermediate = ""
        If var("caller") = "doclist" Then
            For mrow = LBound(msheet, 1) To UBound(msheet, 1)
                For mcol = LBound(msheet, 2) To UBound(msheet, 2)
                    key = csheet(crow, 1)
                    If msheet(mrow, mcol) <> "" And msheet(mrow, mcol) = csheet(crow, 1) Then
                        intermediate = intermediate & mcomp(mrow, 1) & "; "
                    End If
                Next mcol
            Next mrow
        ElseIf var("caller") = "docbundles" Then
            For mcol = LBound(msheet, 2) To UBound(msheet, 2)
                key = mcomp(crow, 1)
                If msheet(crow, mcol) <> "" Then
                    intermediate = intermediate & msheet(crow, mcol) & "; "
                End If
            Next mcol
        End If
        'beautify output and add to result dictionary
        If Len(intermediate) > 1 Then intermediate = Left(intermediate, Len(intermediate) - 2)
        result(crow, 0) = key
        result(crow, 1) = intermediate
    Next crow
    Assign = result
End Function

Public Sub exportXLS(ByVal var As Collection)
    'exports an excel-file without code _
    file paths are changed to pdf and document bundles will have links to the files _
    this public file will work as a plan b to access documents in charge and document bundles in case the assistant is broken
    
    Dim fileSaveName As Variant
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.xlsDefaultFile"), FileFilter:="Excel (*.xlsx), *.xlsx", Title:=var("export.xlsPrompt"))
    If fileSaveName <> False Then
        If pdfFolder = "" Or docFolder = "" Then
        docFolder = InputBox(var("export.ReplaceFromPrompt"), var("export.ReplaceFromTitle"), var("export.ReplaceFromDefaultPath"))
        pdfFolder = InputBox(var("export.ReplaceToPrompt"), var("export.ReplaceToTitle"), var("export.ReplaceToDefaultPath"))
        End If
        If Not (pdfFolder = vbNullString And docFolder = vbNullString) Then
            Dim matrixallrows As Integer: matrixallrows = ThisWorkbook.Worksheets(var("documentlist.sheet")).Range(var("documentlist.linkColumn") & Rows.Count).End(xlUp).Row
            Dim mrow As Long
          
            ' read novel documents and create notification email
            Dim list As String
            For mrow = var("documentlist.headerRow") To var("documentlist.headerRow") + matrixallrows
                If ThisWorkbook.Sheets(var("documentlist.sheet")).Range(var("documentlist.novelColumn") & mrow).value <> "" Then
                    list = list & ThisWorkbook.Sheets(var("documentlist.sheet")).Range(var("documentlist.displayColumn") & mrow).value & _
                        " " & ThisWorkbook.Sheets(var("documentlist.sheet")).Range(var("documentlist.versionColumn") & mrow).value & _
                        "<br>"
                    ThisWorkbook.Sheets(var("documentlist.sheet")).Range(var("documentlist.novelColumn") & mrow).value = ""
                End If
            Next mrow
            if list <> "" Then Essentials.createMail "", var("export.notificationSubject"), Replace(var("export.notificationBody"), "{list}", list)
            
            ' export file
            Dim WB As Excel.Workbook
            Set WB = Workbooks.Add
            Dim rng As Range
            Dim mformat As Variant
            If Essentials.collectionKeyExists(var, "documentlist.documentFormat") Then mformat = ThisWorkbook.Worksheets(var("documentlist.sheet")).Range(var("documentlist.documentFormat") & var("documentlist.headerRow") + 1 & ":" & var("documentlist.documentFormat") & matrixallrows)
            Dim documentFormat: documentFormat = ""

            ThisWorkbook.Sheets(Array(var("documentlist.sheet"), var("normcheck.sheet"), var("bundles.sheet"))).Copy before:=WB.Worksheets(1)
            With WB.Worksheets(var("documentlist.sheet"))
                Set rng = .Range(.Cells(var("documentlist.headerRow") + 1, var("documentlist.linkColumn")), .Cells(.Rows.Count, var("documentlist.linkColumn")).End(xlUp))
            End With

            'replace file links in overview with pdf-path
            Dim mexp As Variant: mexp = rng
            Dim insert() As Variant: ReDim insert(UBound(mexp, 1), 0)
            For mrow = LBound(mexp, 1) To UBound(mexp, 1)
                If mexp(mrow, 1) <> "" Then
                        If Not IsEmpty(mformat) Then documentFormat = CStr(mformat(mrow, 1))
                        insert(mrow, 0) = Essentials.Path2Link(mexp(mrow, 1), True, documentFormat)

                        WB.Worksheets(var("documentlist.sheet")).Hyperlinks.Add _
                            Anchor:=WB.Worksheets(var("documentlist.sheet")).Range(var("documentlist.linkColumn") & var("documentlist.headerRow") + mrow), _
                            Address:=Essentials.Path2Link(mexp(mrow, 1), True, documentFormat), _
                            TextToDisplay:=Essentials.Path2Link(mexp(mrow, 1), True, documentFormat)
                End If
            Next mrow
            'insert result to the right of checklist column
            Range(rng.Offset(-1, 0), rng.Offset(0, 0)).Value = insert

            'insert links to documentbundles
            Dim matrixcols As Integer: matrixcols = Essentials.LastRowOrColumn(WB, "cols", var("bundles.sheet"), var("bundles.headerRow"), var("bundles.startColumn"), var("bundles.maxColumns"))
            matrixallrows = Essentials.LastRowOrColumn(WB, "rows", var("bundles.sheet"), var("bundles.headerRow"), var("bundles.displayColumn"), var("bundles.maxRows"))
            Dim compareallrows As Integer: compareallrows = Essentials.LastRowOrColumn(WB, "rows", var("documentlist.sheet"), var("documentlist.headerRow"), var("documentlist.displayColumn"), var("documentlist.maxRows"))
            'load ranges into one-dimensional array variable variant _
            to avoid uneccessary interaction between excel-shets and vba for performance reasons
            Dim msheet As Variant: msheet = WB.Worksheets(var("bundles.sheet")).Range(var("bundles.startColumn") & var("bundles.headerRow") + 1 & ":" & Essentials.convertColumn("2letter", matrixcols) & matrixallrows)
            Dim csheet As Variant: csheet = WB.Worksheets(var("documentlist.sheet")).Range(var("documentlist.displayColumn") & var("documentlist.headerRow") + 1 & ":" & var("documentlist.linkColumn") & compareallrows)
            Dim crow As Long
            Dim mcol As Long
            For mrow = LBound(msheet, 1) To UBound(msheet, 1)
                For mcol = LBound(msheet, 2) To UBound(msheet, 2)
                    If msheet(mrow, mcol) <> "" Then
                        'write content as link (in case it will not be found, e.g. external documents
                        WB.Worksheets(var("bundles.sheet")).Hyperlinks.Add _
                        Anchor:=WB.Worksheets(var("bundles.sheet")).Range(Essentials.convertColumn("2letter", mcol + 1) & mrow + var("bundles.headerRow")), _
                        Address:=msheet(mrow, mcol), _
                        TextToDisplay:=msheet(mrow, mcol)
                        For crow = LBound(csheet, 1) To UBound(csheet, 1)
                            If msheet(mrow, mcol) = csheet(crow, 1) Then
                                'overwrite content link if found in document list
                                WB.Worksheets(var("bundles.sheet")).Hyperlinks.Add _
                                Anchor:=WB.Worksheets(var("bundles.sheet")).Range(Essentials.convertColumn("2letter", mcol + 1) & mrow + var("bundles.headerRow")), _
                                Address:=csheet(crow, UBound(csheet, 2)), _
                                TextToDisplay:=csheet(crow, 1)
                            End If
                        Next crow
                    End If
                Next mcol
            Next mrow
            WB.SaveAs Filename:=fileSaveName, fileFormat:=xlOpenXMLWorkbook, _
                Password:="", WriteResPassword:="", ReadOnlyRecommended:=False, _
                CreateBackup:=False
            ActiveWorkbook.Close False
        Else
            MsgBox var("export.ErrorMsg")
        End If
   End If
End Sub
