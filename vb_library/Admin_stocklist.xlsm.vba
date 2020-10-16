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
    Set monitorSetup = Locals.monitorStocklist()
End Function

Public Sub openRoutine()
End Sub

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Essentials.basicTableToJSON Locals.setupStocklist
End Sub