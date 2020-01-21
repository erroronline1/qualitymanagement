Attribute VB_Name = "Locals"

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

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
    Language.Add "holiday", "publicHoliday" 'also used in formula in addSheets-sub
    
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
    Language.Add "Initialization could not be finished. You will be asked again on reopening this file.", "initCancelText"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set public holidays according to your area
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function publicHolidays(ByVal givenDate) As String
	publicHolidays=""
	If VBA.VarType(givenDate) = "7" Then
		Dim year: year = DatePart("yyyy", givenDate)
		Dim eastersunday: eastersunday = CDate(IIf(year = 2079, 7, 0) + (Fix(Format$(CDbl(DateSerial(year, 4, day((CDbl(Minute(year / 38)) / 2) + 1516)) / 7), "0")) * 7) - 6)

		Dim holidays As Object
		Set holidays = CreateObject("Scripting.Dictionary")
			holidays.Add "New Year", "1.1"
			holidays.Add "Epiphany", "1.6"
			holidays.Add "May Day", "5.1"
			holidays.Add "German Unification", "10.3"
			holidays.Add "Hallowmas", "11.1"
			holidays.Add "Christmas Eve", "12.24"
			holidays.Add "1st Christmas Day", "12.25"
			holidays.Add "2nd Christmas Day", "12.26"
			holidays.Add "New Years Eve", "12.31"
			holidays.Add "Good Friday", Format(DateAdd("d",-2,eastersunday),"m.d")
			holidays.Add "Easter Monday", Format(DateAdd("d",1,eastersunday),"m.d")
			holidays.Add "Ascension Day", Format(DateAdd("d",39,eastersunday),"m.d")
			holidays.Add "Pentecost", Format(DateAdd("d",50,eastersunday),"m.d")
			holidays.Add "Corpus Christ", Format(DateAdd("d",60,eastersunday),"m.d")

		Dim hDay
		For Each hDay in holidays
			if Format(givenDate,"m.d")= holidays(hDay) then publicHolidays=hDay: Exit For
		Next hDay
	End If
End Function
