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
    Essentials.WritePermission = Essentials.getWritePermission
    
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
    Select Case MsgBox(setup("export.confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, setup("export.confirmTitle"))
    Case vbYes
        Essentials.exportXLS setup
    End Select
End Sub