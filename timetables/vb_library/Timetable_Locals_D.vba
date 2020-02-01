Attribute VB_Name = "Locals"

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Language() As Collection
    Set Language = New Collection
    
    'language chunks for security
    Language.Add Item:="Persönliches Kennwort vergeben", Key:="setPasswordTitle"
    Language.Add "Bitte ein persönliches Kennwort vergeben um Änderungen durch dritte zu vermeiden. Die Sicherheit des Kennworts obliegt der eigenen Verantwortung." & vbNewLine & vbNewLine & "Vorschläge gibt es unter http://erroronline.one/column3/passwort.php", "setPasswordText"
    Language.Add "Persönliches Kennwort bestätigen", "setPasswordConfirmTitle"
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
    Language.Add "Feiertag", "publicHoliday" 'also used in formula in addSheets-sub, according to Abence (see below)
    
    Language.Add "unerlaubte Eingabe", "invalidInputTitle"
    Language.Add "Es dürfen nicht gleichzeitig Arbeitsfreistellungen und Uhrzeiten eingetragen werden!", "invalidInputText"

    'language chunks for initialization and holiday reminder

    Language.Add "Du kommst aus der geschützten Ansicht. Damit alles funktioniert bitte die Datei schließen und nochmals öffnen. Grund dafür ist ein Fehler in Excel. Danach sollte alles funktionieren.", "restartFromProtectedView"

    Language.Add "Urlaubswarnung", "holidayReminderTitle"
    Language.Add "Bitte Urlaub planen, sofern noch nicht geschehen. Es sind noch ", "holidayReminderChunk0"
    Language.Add " Tage in den nächsten ", "holidayReminderChunk1"
    Language.Add " Tagen zu nehmen.", "holidayReminderChunk2"

    Language.Add "Initialisierung", "initWelcomeTitle"
    Language.Add "Jetzt kann es losgehen!" & vbNewLine & vbNewLine & "Die Arbeitszeiterfassung wird mit mit dem aktuellen Monat gestartet." & vbNewLine & vbNewLine & "Vor der ersten Benutzung müssen zwei Werte angegeben werden, damit die automatischen Berechnungen funktionieren. Nach deren Abschluss kannst Du die Angaben direkt auf dem Blatt ändern, so wie es in den Informationen steht - beachte ggf. auch die farblich markierten Bereiche." & vbNewLine & vbNewLine & "Zudem wirst Du aufgefordert ein persönliches Kennwort zu erstellen. Du wirst im Folgenden durch den Prozess geleitet...", "initWelcomeText"
    Language.Add "Resturlaub", "initHolidayTitle"
    Language.Add "Bitte gib die Tage Resturlaub an (wenn Du von einer Erfassung auf Papier kommst, sonst 0)", "initHolidayText"
    Language.Add "Arbeitszeitübertrag", "initTimeTitle"
    Language.Add "Bitte gib den Arbeitszeitübertrag in Stunden an (wenn Du von einer Erfassung auf Papier kommst, sonst 0)", "initTimeText"
    Language.Add "Abbruch", "initCancelTitle"
    Language.Add "Die Initialisierung konnte nicht durchgeführt werden. Bei erneutem Öffnen der Datei wirst Du wieder dazu aufgefordert." & vbNewLine & vbNewLine & "Ohne Initialisierung werden unauthorisierte Änderungen nicht rückgängig gemacht.", "initCancelText"
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
    Absence.Add "Feiertag", "public_holiday"
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
