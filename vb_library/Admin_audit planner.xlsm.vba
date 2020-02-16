Attribute VB_Name = "Specific"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

Option Explicit

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Essentials.basicTableToJSON Locals.setupAuditPlanner
End Sub