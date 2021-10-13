Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit

Public Function monitorSetup() As Collection
    ' this has to be a function, because a public variable gets emptied after finishing the open routine for some freaking reason
    Set monitorSetup = Locals.monitorTicketSystem()
End Function

Public Sub openRoutine()
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As Collection
    Set setup = setupTicketSystem()
    Application.DisplayAlerts = False
        
    On Error GoTo error
    'select js-file to export to
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=setup("export.defaultFile"), FileFilter:="JavaScript Files (*.js), *.js", Title:=setup("export.prompt"))
    If fileSaveName <> False Then
        'set up dynamic range of matrix
        'maximum rows of matrix according to main column
        Dim matrixallrows As Integer: matrixallrows = Essentials.LastRowOrColumn(ThisWorkbook, "rows", setup("matrix.sheet"), setup("matrix.headerRow"), setup("matrix.startColumn"), Null)
        'maximum columns of matrix according to header row or setup("matrix.maxColumns")
        Dim matrixcols As Integer: matrixcols = Essentials.LastRowOrColumn(ThisWorkbook, "cols", setup("matrix.sheet"), setup("matrix.headerRow"), setup("matrix.startColumn"), setup("matrix.maxColumns"))
        'load ranges into one-dimensional array variable variant _
        to avoid uneccessary interaction between excel-shets and vba for performance reasons
        Dim msheet As Variant: msheet = ThisWorkbook.Worksheets(setup("matrix.sheet")).Range(setup("matrix.startColumn") & setup("matrix.headerRow") & ":" & Essentials.convertColumn("2letter", matrixcols) & matrixallrows)
        'loop through the matrix and set up JS-Object row-wise
        Dim mrow As Long
        Dim mcol As Long
        Dim intermediate As String
        Dim regEx As New RegExp
        Dim cellContent As Object
        Dim exportSanitization As String
        Dim cellPattern As String
        Dim patternMatch

        Dim finally As String
        finally = "//this file was automatically created by <" & ThisWorkbook.Name & ">" & vbNewLine & vbNewLine & _
            setup("export.objectName") & "={content:[" & vbNewLine

        'header descriptions
        finally = finally & "[" & _
            Chr(34) & setup("header.column1") & Chr(34) & ", " & _
            Chr(34) & setup("header.column2") & Chr(34) & ", " & _
            Chr(34) & setup("header.column4") & Chr(34) & ", " & _
            Chr(34) & setup("header.column5") & Chr(34) & ", " & _
            Chr(34) & setup("header.column7") & Chr(34) & ", " & _
            Chr(34) & setup("header.column8") & Chr(34) & ", " & _
            Chr(34) & setup("header.column9") & Chr(34) & ", " & _
            "]," & vbNewLine 

        For mrow = LBound(msheet, 1) To UBound(msheet, 1)
            If setup("export.dontSkipEmpty") Or msheet(mrow, setup("m.contentcolumn")) <> "" Then
                'clear intermediate result for row
                intermediate = "["
                For mcol = LBound(msheet, 2) To UBound(msheet, 2)
                    cellPattern = Locals.TicketSystemPattern(mcol)
                    If cellPattern <> "" Then
                        With regEx
                            .Global = True
                            .pattern = cellPattern
                        End With
                        Set cellContent = regEx.Execute(SanitizeString(msheet(mrow, mcol)))

                        For Each patternMatch in cellContent(0).Submatches
                        exportSanitization = ""
                        'sanitizing special cases
                        If patternMatch <> "null" then exportSanitization = patternMatch
                        intermediate = intermediate & Chr(34) & exportSanitization & Chr(34) & ", "
                        Next patternMatch
                    End If
                Next mcol
                finally = finally & intermediate & "]," & vbNewLine
            End If
        Next mrow
        finally = finally & "]};"
        Essentials.WriteFile fileSaveName, finally, False   

        'clear table and set focus to make insertion easier next time
        ThisWorkbook.Worksheets(setup("matrix.sheet")).Range("A1:" & Essentials.convertColumn("2letter", matrixcols) & matrixallrows).Delete
        ThisWorkbook.Worksheets(setup("matrix.sheet")).Range("A1").select
        MsgBox setup("export.success"), vbInformation
    End If
    Application.DisplayAlerts = True
    Exit Sub

error:
    MsgBox setup("export.error"), vbExclamation
End Sub
