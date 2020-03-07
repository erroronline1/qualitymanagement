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

Public Function Language() As Collection
    Set Language = New Collection
    
    'language chunks for security
    Language.Add Item:="Persönliches Kennwort vergeben", Key:="setPasswordTitle"
    Language.Add "Bitte ein persönliches Kennwort vergeben um Änderungen durch dritte zu vermeiden. Die Sicherheit des Kennworts obliegt der eigenen Verantwortung." & _
        vbNewLine & vbNewLine & "Vorschläge gibt es unter http://erroronline.one/column3/passwort.php", "setPasswordText"
    Language.Add "Persönliches Kennwort bestäigen", "setPasswordConfirmTitle"
    Language.Add "Bitte ein persönliches Kennwort zur Sicherheit erneut eingeben.", "setPasswordConfirmText"
    Language.Add "Die Kennwörter stimmen nicht überein!", "setPasswordError"
    Language.Add "OK", "setPasswordOK"
    Language.Add "Abbrechen", "setPasswordCancel"

    Language.Add "Geschützte Eingabe", "queryPasswordTitle"
    Language.Add "Zum Ändern bitte einmalig mit Kennwort bestätigen. Bei vergessenem oder noch nicht vergebenen Kennwort <Abbrechen> um weitere Schritte angezeigt zu bekommen:", "queryPasswordText"
    Language.Add "Neues Kennwort", "resetPasswordTitle"
    Language.Add "Soll ein neues Kennwort vergeben werden?", "resetPasswordText"
    Language.Add "Es wurde das falsche Kennwort eingegeben.", "queryPasswordError"
    Language.Add "OK", "queryPasswordOK"
    Language.Add "Abbrechen", "queryPasswordCancel"

    'language chunks for input verification
    Language.Add "unerlaubte Eingabe", "invalidInputTitle"
    Language.Add "Es dürfen nicht gleichzeitig Arbeitsfreistellungen und Uhrzeiten eingetragen werden!", "invalidInputText"

    'language chunks for initialization and holiday reminder
    Language.Add "Du kommst aus der geschützten Ansicht. Damit alles funktioniert bitte die Datei schließen und nochmals öffnen. Grund dafür ist ein Fehler in Excel. Danach sollte alles funktionieren.", "restartFromProtectedView"

    Language.Add "Urlaubswarnung", "holidayReminderTitle"
    Language.Add "Bitte Urlaub planen, sofern noch nicht geschehen. Es sind noch ", "holidayReminderChunk0"
    Language.Add " Tage in den nächsten ", "holidayReminderChunk1"
    Language.Add " Tagen zu nehmen.", "holidayReminderChunk2"

    Language.Add "Initialisierung", "initWelcomeTitle"
    Language.Add "Jetzt kann es losgehen!" & vbNewLine & vbNewLine & "Die Arbeitszeiterfassung wird mit mit dem aktuellen Monat gestartet." & _
        vbNewLine & vbNewLine & "Vor der ersten Benutzung müssen zwei Werte angegeben werden, damit die automatischen Berechnungen funktionieren. Nach deren Abschluss kannst Du die Angaben direkt auf dem Blatt ändern, so wie es in den Informationen steht - beachte ggf. auch die farblich markierten Bereiche." & _
        vbNewLine & vbNewLine & "Zudem wirst Du aufgefordert ein persönliches Kennwort zu erstellen. Du wirst im Folgenden durch den Prozess geleitet...", "initWelcomeText"
    Language.Add "Resturlaub", "initHolidayTitle"
    Language.Add "Bitte gib die Tage Resturlaub an (wenn Du von einer Erfassung auf Papier kommst, sonst 0)", "initHolidayText"
    Language.Add "Arbeitszeitübertrag", "initTimeTitle"
    Language.Add "Bitte gib den Arbeitszeitübertrag in Stunden an (wenn Du von einer Erfassung auf Papier kommst, sonst 0)", "initTimeText"
    Language.Add "Abbruch", "initCancelTitle"
    Language.Add "Die Initialisierung konnte nicht durchgeführt werden. Bei erneutem Öffnen der Datei wirst Du wieder dazu aufgefordert." & _
        vbNewLine & vbNewLine & "Ohne Initialisierung werden unauthorisierte Änderungen nicht rückgängig gemacht.", "initCancelText"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set absence reasons
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Absence() As Collection
	'fuzzy handling: if you want to delete values add some empty key-pairs to overwrite. won't happen too often though
    Set Absence = New Collection
    Absence.Add Item:="", Key:="null"
    Absence.Add "Krank", "sick"
    Absence.Add "Urlaub", "vacation"
    Absence.Add "Überzeit", "overtime" 'this key is called by Essentials.countDays and affects the calculation of overtime (full overtime compensation)
    Absence.Add "Feiertag", "public_holiday" 'this key is called by Essentials.absenceHandler and Essentials.countDays and affects the calculation of overtime (full overtime add up)
    Absence.Add "Berufsschule", "vocational_school"
    Absence.Add "Dienstreise", "business_trip"
    Absence.Add "Elternzeit", "parental_leave"
    Absence.Add "siehe Anmerkung", "see_comment"
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
			holidays.Add "Neujahr", "1.1"
			holidays.Add "Dreikönigstag", "1.6"
			holidays.Add "Maifeiertag", "5.1"
			holidays.Add "Tag der deutschen Einheit", "10.3"
			holidays.Add "Allerheiligen", "11.1"
			holidays.Add "Heiligabend", "12.24"
			holidays.Add "1.Weihnachtsfeiertag", "12.25"
			holidays.Add "2.Weihnachtsfeiertag", "12.26"
			holidays.Add "Silvester", "12.31"
			holidays.Add "Karfreitag", Format(DateAdd("d",-2,eastersunday),"m.d")
			holidays.Add "Ostermontag", Format(DateAdd("d",1,eastersunday),"m.d")
			holidays.Add "Himmelfahrt", Format(DateAdd("d",39,eastersunday),"m.d")
			holidays.Add "Pfingsten", Format(DateAdd("d",50,eastersunday),"m.d")
			holidays.Add "Frohnleichnahm", Format(DateAdd("d",60,eastersunday),"m.d")

		Dim hDay
		For Each hDay in holidays
			if Format(givenDate,"m.d")= holidays(hDay) then publicHolidays=hDay: Exit For
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
    Range("D8").FormulaLocal= "=countDays(D5; " & Chr(34) & "workdays" & Chr(34) & "; TEIL(ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1);FINDEN(" & Chr(34) & "]" & Chr(34) & ";ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1))+1;31))"
    Range("D45").FormulaLocal= "=countDays(D5; " & Chr(34) & "vacation" & Chr(34) & "; TEIL(ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1);FINDEN(" & Chr(34) & "]" & Chr(34) & ";ZELLE(" & Chr(34) & "Dateiname" & Chr(34) & ";$A$1))+1;31))"
    
    'sum monthly worktime
    Range("H43").FormulaLocal = "=SUMME(H11:H41)*24"
    'sum considering overtime and correction
    Range("H47").FormulaLocal = "=SUMME(H44:H46)"
    Application.ScreenUpdating = True
End Sub