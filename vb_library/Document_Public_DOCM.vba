'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' functions for public interactive docm-documents that show/hide paragraphs based on selected checkboxes
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Option Explicit

Private Sub Document_ContentControlOnExit(ByVal ContentControl As ContentControl, Cancel As Boolean)
    Dim cc As ContentControl
    For Each cc In ThisDocument.ContentControls
        'checkboxes have no type attribute to check against, therefore the need of _
        error handling on Checked-property that is checkbox-only in this usecase
        On Error Resume Next
        if ThisDocument.Bookmarks.Exists("text" & cc.Tag) then
            ThisDocument.Bookmarks("text" & cc.Tag).Range.Font.Hidden = Not cc.Checked
            ThisDocument.Bookmarks("notext" & cc.Tag).Range.Font.Hidden = cc.Checked
        end if
    Next
End Sub

Private Sub Document_Close()
    ThisDocument.Saved = True
End Sub