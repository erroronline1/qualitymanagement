Attribute VB_Name = "Specific"
'(c) 2020 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license

Option Explicit

Public Sub closeRoutine(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    Essentials.basicTableToJSON Locals.setupStocklist
End Sub