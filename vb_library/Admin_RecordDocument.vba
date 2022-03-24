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
    Set monitorSetup = Locals.monitorRecordDocument()
End Function

Public Sub openRoutine()
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Dim setup As Collection
    Set setup = setupRecordDocument()
    
    Select Case MsgBox(setup("initiate.Confirm"), vbYesNo + vbDefaultButton2 + vbQuestion, setup("initiate.Title"))
    Case vbYes
        Dim docname: docname = Left(ThisWorkbook.Name, InStr(ThisWorkbook.Name, ".") - 1)
        Essentials.recordRelease setup
        Essentials.exportXLS2PDF setup, docname
        Select Case MsgBox(setup("export.xlsArchive"), vbYesNo + vbDefaultButton2 + vbQuestion)
        Case vbYes
            Essentials.exportXLS setup, docname & "(" & Essentials.recordReleaseUserInput & ")"
       'Case vbNo
        End Select
   'Case vbNo
    End Select
    
End Sub
