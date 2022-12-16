Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|       by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit
Private isOpen

Public Function monitorSetup() As Collection
    ' this has to be a function, because a public variable gets emptied after finishing the open routine for some freaking reason
    Set monitorSetup = Locals.monitorVendorList()
End Function

Public Sub openRoutine()
    Essentials.WritePermission = Essentials.WriteFile(ActiveWorkbook.path & "\writepermission.temp", "1", True)
    
    If Essentials.WritePermission Then
        Dim setup As New Collection
        Set setup = Locals.setupVendorList

        ' update sheets to recent code
        Rewrite.rewriteMain ThisWorkbook, Sheets(setup("vendor.sheetName")).CodeName, ThisWorkbook.parentPath & "vb_library\" & "Admin_vendorlist.vendorlist.vba"
        Rewrite.rewriteMain ThisWorkbook, Sheets(setup("material.sheetName")).CodeName, ThisWorkbook.parentPath & "vb_library\" & "Admin_vendorlist.materialtracing.vba"

        MsgBox setup("runtime.prompt")
    End If
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As New Collection
    Set setup = Locals.setupVendorList
    ' match risk grid if set in locals
    On Error Resume Next
    MsgBox setup("riskGrid.hint")
    Application.ScreenUpdating = False
    Dim vendorallrows As Integer: vendorallrows = LastRowOrColumn(ThisWorkbook, "rows", setup("vendor.sheetName"), setup("vendor.rowOffset"), setup("vendor.vendorColumn"), False)
    Dim vendors As Variant: vendors = ThisWorkbook.Worksheets(setup("vendor.sheetName")).Range(setup("vendor.vendorColumn") & setup("vendor.rowOffset") & ":" & setup("vendor.riskgridmatchColumn") & vendorallrows)

    Dim riskgrid As Workbook: Set riskgrid = Workbooks.Open(setup("riskGrid.src"), True, True)
    Dim riskallrows As Integer: riskallrows = LastRowOrColumn(riskgrid, "rows", setup("riskGrid.sheet"), setup("riskGrid.startRow"), setup("riskGrid.column"), False)
    Dim riskvendors As Range: Set riskvendors = riskgrid.Worksheets(setup("riskGrid.sheet")).Range(setup("riskGrid.column") & setup("riskGrid.startRow") & ":" & setup("riskGrid.column") & riskallrows)
    
    Dim certificatecolumn: certificatecolumn = convertColumn("2number", setup("vendor.certificatecolumn")) - convertColumn("2number", setup("vendor.vendorColumn")) + 1
    Dim matchcolumn: matchcolumn = convertColumn("2number", setup("vendor.riskgridmatchColumn")) - convertColumn("2number", setup("vendor.vendorColumn")) + 1
    Dim vendorRow As Long
    Dim match As Long
    
    For vendorRow = LBound(vendors, 1) To UBound(vendors, 1)
        If vendors(vendorRow, certificatecolumn) = "" Then
            On Error Resume Next
            match = 0
            vendors(vendorRow, matchcolumn) = 0
            match = WorksheetFunction.match(vendors(vendorRow, 1), riskvendors, 0)
            If match > 0 Then
            vendors(vendorRow, matchcolumn) = 1
            End If
        End If
    Next vendorRow
    ' repaste modified range into sheet
    ThisWorkbook.Worksheets(setup("vendor.sheetName")).Range(setup("vendor.vendorColumn") & setup("vendor.rowOffset") & ":" & setup("vendor.riskgridmatchColumn") & vendorallrows) = vendors
    riskgrid.Close False ' close without saving
    Set riskgrid = Nothing
    Application.ScreenUpdating = True

    ' conditional export
    Select Case MsgBox(setup("export.confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, setup("export.confirmTitle"))
    Case vbYes
        Essentials.exportXLS setup
    End Select
End Sub
