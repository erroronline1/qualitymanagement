Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|       by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit

Public Function monitorSetup() As Collection
    ' this has to be a function, because a public variable gets emptied after finishing the open routine for some freaking reason
    Set monitorSetup = Locals.monitorTransferSchedule()
End Function

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As Collection
    Set setup = setupTransferSchedule()
    
    Dim mrow As Long
    Dim mcol As Long
    
    'get divider for colorizing top part and fetching properties from the bottom part
    Dim matrixDivider As Range
    With ActiveSheet.Range("A:A")
        Set matrixDivider = .Find(What:=setup("matrix.maxRow"), _
                        After:=.Cells(.Cells.Count), _
                        LookIn:=xlValues, _
                        LookAt:=xlWhole, _
                        SearchOrder:=xlByRows, _
                        SearchDirection:=xlNext, _
                        MatchCase:=False)
        If matrixDivider Is Nothing Then
            MsgBox setup("matrix.error")
            Exit Sub
        End If
    End With
    
    'get values and background colors from to collection, take non-word-character-separated values into account
    Dim matrixallrows As Integer: matrixallrows = ActiveSheet.Range("A" & Rows.Count).End(xlUp).Row
    Dim legendRange As Variant: legendRange = ActiveSheet.Range("A" & matrixDivider.Row + 1 & ":A" & matrixallrows)
    Dim conditionalFormat As New Collection
    Dim regEx As New RegExp
    Dim PatternMatch

    With regEx
        .Global = True
        .Pattern = "\w+"
    End With
    Dim cellContent As Object
    For mrow = LBound(legendRange, 1) To UBound(legendRange, 1)
        'set color for full cell value
        conditionalFormat.Add Cells(matrixDivider.Row + mrow, 1).Interior.Color, Cells(matrixDivider.Row + mrow, 1).Value
        'set color for partial values
        Set cellContent = regEx.Execute(Cells(matrixDivider.Row + mrow, 1).Value)
        On Error Resume Next 'in case collection keys already exists
        For Each PatternMatch In cellContent '(0).SubMatches
            conditionalFormat.Add Cells(matrixDivider.Row + mrow, 1).Interior.Color, PatternMatch
        Next PatternMatch
        On Error GoTo 0
    Next mrow
    
    'maximum columns of matrix to colorize
    Dim matrixcols As Integer: matrixcols = Essentials.LastRowOrColumn(ThisWorkbook, "cols", ActiveSheet.Name, 1, "A", False)
    'load ranges into one-dimensional array variable variant _
    to avoid uneccessary interaction between excel-shets and vba for performance reasons
    Dim msheet As Variant: msheet = ActiveSheet.Range("A1:" & Essentials.convertColumn("2letter", matrixcols) & matrixDivider.Row)

    Application.ScreenUpdating = False
    On Error Resume Next
    For mrow = LBound(msheet, 1) To UBound(msheet, 1) 
        For mcol = LBound(msheet, 2) To UBound(msheet, 2) + 1
            'there is no lightweight way to check if a kex exists in a collection, therefore forcing values and error handling
            Cells(mrow, mcol).Interior.ColorIndex = xlNone
            If Not VarType(msheet(mrow, mcol)) = VbVarType.vbInteger Then Cells(mrow, mcol).Interior.Color = conditionalFormat(msheet(mrow, mcol))
        
            If mrow < matrixDivider.Row And mrow Mod 2 And Not mcol Mod 2 Then
                Cells(mrow, mcol).Borders(xlEdgeLeft).Color = RGB(220, 220, 220)
                Cells(mrow, mcol).Borders(xlEdgeLeft).LineStyle = xlContinuous
            End If
            If mrow < matrixDivider.Row And mrow Mod 2 Then
                Cells(mrow, mcol).Borders(xlEdgeBottom).Color = RGB(220, 220, 220)
                Cells(mrow, mcol).Borders(xlEdgeBottom).LineStyle = xlContinuous
            End If
        
        Next mcol
    Next mrow
    On Error GoTo 0
    Application.ScreenUpdating = True

    Select Case MsgBox(setup("initiate.Confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, setup("initiate.Title"))
    Case vbYes
		Essentials.exportXLS2PDF setup
    'Case vbNo
    End Select
    
End Sub
