Attribute VB_Name = "Locals"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Option Explicit
Public holidays As Object

Public Function Language() As Collection
    Set Language = New Collection
    
    'language chunks for security
    Language.Add Item:="Provide personal password", Key:="setPasswordTitle"
    Language.Add "Please enter a personal password to avoid foreign changes to your timetable. You are responsible for the safety of your password.", "setPasswordText"
    Language.Add "Confirm personal password", "setPasswordConfirmTitle"
    Language.Add "Please enter your password again for confirmation.", "setPasswordConfirmText"
    Language.Add "The passwords did not match!", "setPasswordError"
    Language.Add "OK", "setPasswordOK"
    Language.Add "Cancel", "setPasswordCancel"

    Language.Add "Secured input", "queryPasswordTitle"
    Language.Add "Confirm password once to apply changes. In case you have forgotten or did not set a password click <cancel> to have further steps:", "queryPasswordText"
    Language.Add "New Password", "resetPasswordTitle"
    Language.Add "Do you want to set up a new password?", "resetPasswordText"
    Language.Add "A wrong password has been used.", "queryPasswordError"
    Language.Add "OK", "queryPasswordOK"
    Language.Add "Cancel", "queryPasswordCancel"

    'language chunks for input verification
    Language.Add "Forbidden Input", "invalidInputTitle"
    Language.Add "You are not allowed to enter absence and time at once!", "invalidInputText"

    'language chunks for initialization and holiday reminder
    Language.Add "You just switched from protected view. For everything to work properly please reopen the file. This is because of an Excel bug. Afterwards everything should work flawless.", "restartFromProtectedView"

    Language.Add "Reminder For Paid Leave", "holidayReminderTitle"
    Language.Add "Please plan for your paid leave. There have to be taken ", "holidayReminderChunk0"
    Language.Add " days of paid leave within the next ", "holidayReminderChunk1"
    Language.Add " days.", "holidayReminderChunk2"

    Language.Add "Initialize", "initWelcomeTitle"
    Language.Add "Now we can start." & vbNewLine & vbNewLine & "The timetable will start with the current month." & vbNewLine & vbNewLine & "Prior to the first use you have to enter two values to get the calculations working. Afterwards you can customize the sheet directly according to the info-sheet - consider the highlighted cells as well." & vbNewLine & vbNewLine & "Later you will be asked for setting up a personal password. Directions through the process will start...", "initWelcomeText"
    Language.Add "Remaining Holidays", "initHolidayTitle"
    Language.Add "Please enter the amount of remaining holidays (or 0)", "initHolidayText"
    Language.Add "Current amount of hours", "initTimeTitle"
    Language.Add "Please enter the current amount of tracked hours (or 0)", "initTimeText"
    Language.Add "Abort", "initCancelTitle"
    Language.Add "Initialization could not be finished. You will be asked again on reopening this file." & vbNewLine & vbNewLine & "Withour proper initialization unauthorized changes will not be undone.", "initCancelText"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set absence reasons
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Absence() As Collection
	'fuzzy handling: if you want to delete values add some empty key-pairs to overwrite. won't happen too often though
    Set Absence = New Collection
    Absence.Add Item:="", Key:="null"
    Absence.Add "Sick", "sick"
    Absence.Add "Vacation", "vacation"
    Absence.Add "overtime compensation", "overtime" 'this key is called by Essentials.countDays and affects the calculation of overtime (full overtime compensation)
    Absence.Add "public holiday", "public_holiday" 'this key is called by Essentials.absenceHandler and Essentials.countDays and affects the calculation of overtime (full overtime add up)
    Absence.Add "vocational school", "vocational_school"
    Absence.Add "business trip", "business_trip"
    Absence.Add "parantal leave", "parental_leave"
    Absence.Add "see comment", "see_comment"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set public holidays according to your area
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function setHolidays(ByVal year As String) As Collection
    Set setHolidays = New Collection
    setHolidays.Add Item:=year, Key:="year"
    Dim eastersunday: eastersunday = CDate(IIf(year = 2079, 7, 0) + (Fix(Format$(CDbl(DateSerial(year, 4, day((CDbl(Minute(year / 38)) / 2) + 1516)) / 7), "0")) * 7) - 6)
    Dim hDays As Object
    Set hDays = CreateObject("Scripting.Dictionary")
			hDays.Add "New Year", "1.1"
			hDays.Add "Epiphany", "1.6"
			hDays.Add "May Day", "5.1"
			hDays.Add "German Unification", "10.3"
			hDays.Add "Hallowmas", "11.1"
			hDays.Add "Christmas Eve", "12.24"
			hDays.Add "1st Christmas Day", "12.25"
			hDays.Add "2nd Christmas Day", "12.26"
			hDays.Add "New Years Eve", "12.31"
			hDays.Add "Good Friday", Format(DateAdd("d",-2,eastersunday),"m.d")
			hDays.Add "Easter Monday", Format(DateAdd("d",1,eastersunday),"m.d")
			hDays.Add "Ascension Day", Format(DateAdd("d",39,eastersunday),"m.d")
			hDays.Add "Pentecost", Format(DateAdd("d",50,eastersunday),"m.d")
			hDays.Add "Corpus Christ", Format(DateAdd("d",60,eastersunday),"m.d")
    setHolidays.Add hDays, "days"
End Function

Public Function publicHolidays(ByVal givenDate) As String
    publicHolidays = ""
    If VBA.VarType(givenDate) = 7 Then
        If holidays Is Nothing Then
            Set holidays = setHolidays(DatePart("yyyy", givenDate))
        ElseIf holidays("year") <> DatePart("yyyy", givenDate) Then
            Set holidays = setHolidays(DatePart("yyyy", givenDate))
        End If
        Dim hDay
        For Each hDay In holidays("days")
            If Format(givenDate, "m.d") = holidays("days")(hDay) Then publicHolidays = hDay: Exit For
        Next hDay
    End If
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' handle formulas for the timetracking sheets, also considering formulalocal
' these are the formulas that might have to be customized to your language. all other formulas within Essentials are considered
' universal arithmetic. if you change anything it will be updated on initialization and the last sheet on opening the file
' (e.g. for overwriting legacy code
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub updateXLSfunctions(ByVal cSheet As Variant)
    Application.ScreenUpdating = False
    'delete all conditional formats for given or latest sheet. must be unprotected
    If cSheet = "" Then
        ThisWorkbook.Sheets(Sheets.Count).Cells.FormatConditions.Delete
    Else
        ThisWorkbook.Sheets(cSheet).Cells.FormatConditions.Delete
    End If
    'conditional formatting on empty mandatory fields
    With Range("=D2:D5,D43")
        .FormatConditions.Add Type:=xlExpression, Formula1:="=ISTLEER(D2)"
        .FormatConditions(1).Interior.Color = RGB(240, 184, 183)
    End With
    'conditional formatting on regular non working days
    With Range("=$B$11:$B$41")
        .FormatConditions.Add Type:=xlExpression, Formula1:="=WENNFEHLER(NICHT(FINDEN(B11;$D$5))*FALSCH;WAHR)"
        .FormatConditions(1).Interior.Color = RGB(191, 191, 191)
    End With
    'conditional formatting on wrong break inputs
    With Range("=$F$11:$G$41")
        .FormatConditions.Add Type:=xlExpression, Formula1:="=UND(F11<>0;F11<15)"
        .FormatConditions(1).Font.Color = RGB(255, 192, 0)
    End With

    Dim row as Integer
    For row = 11 To 41
        'date list according to month
        If row = 11 Then Range("A" & row).FormulaLocal = "=DATUM(E1;D1;1)"
        If row > 11 Then Range("A" & row).FormulaLocal = "=WENNFEHLER(WENN(UND(A" & row - 1 & "<>" & Chr(34) & Chr(34) & ";A" & row - 1 & "+1<=MONATSENDE(A" & row - 1 & ";0));A" & row - 1 & "+1;" & Chr(34) & Chr(34) & ");" & Chr(34) & Chr(34) & ")"
        'day name
        Range("B" & row).FormulaLocal = "=TEXT(A" & row & ";" & Chr(34) & "TTT" & Chr(34) & ")"

        'update/insert holiday auto insertion on empty cells
        Dim udc As Variant
        udc = Range("C" & row).value
        If IsError(udc) Then udc = ""
        If udc = "" Then Range("C" & row).FormulaLocal = "=publicHolidays(A" & row & ")"

        If ThisWorkbook.Workmodel="Standard" Then
            'update/insert formula for auto short break on empty cells
            udc = Range("C" & row).value
            If IsError(udc) Then udc = ""
            If udc = "" Then Range("F" & row).FormulaLocal = "=WENN(E" & row & "-D" & row & "-(G" & row & "/60/24)>9/24;15;0)"
            'update/insert formula for auto long break on empty cells
            udc = Range("C" & row).value
            If IsError(udc) Then udc = ""
            If udc = "" Then Range("G" & row).FormulaLocal = "=WENN(E" & row & "-D" & row & ">6/24;30;0)"
        ElseIf ThisWorkbook.Workmodel="Homeoffice" Then
            'update/insert holiday auto insertion on empty cells
            udc = Range("C" & row).value
            If IsError(udc) Then udc = ""
            If udc = "" Then Range("C" & row).FormulaLocal = "=publicHolidays(A" & row & ")"
            'update/insert formula for auto short break on empty cells
            udc = Range("C" & row).value
            If IsError(udc) Then udc = ""
            If udc = "" Then Range("F" & row).FormulaLocal = "=WENN(E" & row & "-D" & row & ">6/24;WENN(E" & row & "-D" & row & ">9/24;45;30);0)"
        End If
    Next row

    'update countDays
    Range("D8").FormulaLocal = "=countDays(D5; " & Chr(34) & "workdays" & Chr(34) & "; TEIL(ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1);FINDEN(" & Chr(34) & "]" & Chr(34) & ";ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1))+1;31))"
    Range("D45").FormulaLocal = "=countDays(D5; " & Chr(34) & "vacation" & Chr(34) & "; TEIL(ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1);FINDEN(" & Chr(34) & "]" & Chr(34) & ";ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1))+1;31))"
    
    'sum monthly worktime
    Range("H43").FormulaLocal = "=SUMME(H11:H41)*24"
    'sum considering overtime and correction
    Range("H47").FormulaLocal = "=SUMME(H44:H46)"
    Application.ScreenUpdating = True
End Sub