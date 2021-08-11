Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|   by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit

Public Function monitorSetup() As Collection
    ' this has to be a function, because a public variable gets emptied after finishing the open routine for some freaking reason
    Set monitorSetup = Locals.monitorDRM()
End Function

Public Sub openRoutine()
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As New Collection
    Set setup = Locals.setupDRM()
    
    Select Case MsgBox(setup("initiate.Confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, setup("initiate.Title"))
    Case vbYes
        drmExport setup
    'Case vbNo
    End Select
End Sub


Public Sub drmExport(var As Variant)
    'exports a javascript-file with object containing permisions, names and password-hashes _
    using export-variables
    
    Dim fileSaveName As Variant
    fileSaveName = Application.GetSaveAsFilename(InitialFileName:=var("export.defaultFile"), FileFilter:="JavaScript Files (*.js), *.js", Title:=var("export.prompt"))
    If fileSaveName <> False Then
        Dim matrixallrows As Integer: matrixallrows = Essentials.LastRowOrColumn(ThisWorkbook, "rows", var("drm.sheet"), var("drm.headerRow"), var("drm.nameColumn"), var("drm.maxRows"))
        Dim mdrm As Variant: mdrm = ThisWorkbook.Worksheets(var("drm.sheet")).Range(var("drm.nameColumn") & var("drm.headerRow") + 1 & ":" & var("drm.hashColumn") & matrixallrows)
        Dim headerrow As Range
        Dim lrow As Long
        Dim nameColumn As Integer: nameColumn = Essentials.convertColumn("2number", var("drm.nameColumn"))
        Dim hashColumn As Integer: hashColumn = Essentials.convertColumn("2number", var("drm.hashColumn"))
        Dim intermediate As String
        
        Dim finally As String: finally = "//this file was automatically created by <" & ThisWorkbook.Name & ">" & vbNewLine & vbNewLine & _
            "if (typeof core === 'undefined') var core = {};" & vbNewLine & _
            "if (typeof core.var === 'undefined') core.var = {};" & vbNewLine & _
            "if (typeof core.var.drm === 'undefined') core.var.drm = {};" & vbNewLine & _
            vbNewLine
        
        'loop through list and add permission-sets to intermediate result
        For lrow = LBound(mdrm, 1) To UBound(mdrm, 1)
            If mdrm(lrow, nameColumn) <> "" Then
                If Trim(mdrm(lrow, hashColumn)) = "" Then
                    intermediate = intermediate & vbTab & "}," & vbNewLine & vbTab & "'" & mdrm(lrow, nameColumn) & "': {" & vbNewLine
                Else
                    intermediate = intermediate & vbTab & vbTab & "'" & mdrm(lrow, nameColumn) & "': '" & mdrm(lrow, hashColumn) & "'," & vbNewLine
                End If
            End If
        Next lrow

        If Len(intermediate) Then
            intermediate = Right(intermediate, Len(intermediate) - 3) & vbTab & "}" & vbNewLine
        End If
        'process the result-dictionary to the js-object output
        finally = finally & "core.var.drm.data = {"
        finally = finally & intermediate
        finally = finally & "};" & vbNewLine
        
        Essentials.WriteFile fileSaveName, finally, False
    Else
        MsgBox var("export.ErrorMsg")
    End If
End Sub