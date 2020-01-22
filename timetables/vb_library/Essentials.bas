Attribute VB_Name = "Essentials"
Option Explicit
Public addingSheet As Boolean

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' general module handler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Modules() as Object
	Set Modules= CreateObject("Scripting.Dictionary")
    Modules.Add "Secure", ThisWorkbook.Path & "\vb_library\" & "Secure.bas"
    Modules.Add "Locals", ThisWorkbook.Path & "\vb_library\" & "Locals_" & ThisWorkbook.selectedLanguage & ".bas"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' events
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub OpenRoutine()
    If ThisWorkbook.importModules(Modules()) Then asyncOpen
End Sub 

Public Sub asyncOpen()
    'set unlocked to false on opening by default, this is essential. see functions comment.
    persistent "unlocked", "set", False

    If Application.ProtectedViewWindows.Count > 0 Then
        Dim mprompt As New Collection
        Set mprompt = Locals.Language()
        MsgBox (mprompt("restartFromProtectedView"))
    Else
        If init() Then addSheets
    End If

End Sub

Public Sub CloseRoutine()
    If persistent("newsheet", "get", True) Then holidayReminder
End Sub 

Public Sub ChangeRoutine(ByVal Sheet as String, ByVal Target As Range)
    If not addingSheet Then
        Secure.Protection Sheet
        absenceHandler Sheet, Target
    End If
End Sub

Public Sub undo()
	If Not persistent("unlocked", "get", True) Then
		Dim relock As Boolean: relock = True
		persistent "unlocked", "set", True
	End If
    Application.undo
	If relock Then persistent "unlocked", "set", False
End Sub

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' standard runtime functions
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function persistent(value As String, action As String, setter As Boolean) As Boolean
    'runtime properties have to be written to the setting sheet because on closing a user-form all public/global values are gone. this were some wild hours.
    'returns always the last setting regardless of setter on get-call
	Dim column As Integer
	if value = "unlocked" Then column = 2
	if value = "newsheet" Then column = 3
	If action = "set" Then Tabelle0.Cells(2, column).Value = CInt(setter)
    persistent = CBool(Tabelle0.Cells(2, column).Value)
End Function

Public Sub absenceHandler(ByVal cSheet, ByVal Range)
    'checks if absence and time values are colliding
    On Error GoTo undo
    
    Dim mprompt As New Collection
    Set mprompt = Locals.Language()

    Dim cell As Range
    For Each cell In Range
        Dim colrow() As String: colrow() = Split(Right(CStr(cell.Address), Len(CStr(cell.Address)) - 1), "$")

        'allowed values in c
        Dim allowedWorkOnAbsence As Boolean
        allowedWorkOnAbsence=(  Worksheets(cSheet).Range("C" & colrow(1)).Value="" Or _
                                Worksheets(cSheet).Range("C" & colrow(1)).Value=mprompt("publicHoliday") Or _
                                Worksheets(cSheet).Range("C" & colrow(1)).Value=Locals.publicHolidays(Worksheets(cSheet).Range("A" & colrow(1)).Value))
        
        'warning and undo
        'if row between 10 and 40
        'and current column is c and existing values in d or e
        'or current column is d or e and existing value in c
        If colrow(1) >= 10 And colrow(1) <= 40 _
            And ( _
                (colrow(0) = "C" And _
                Not allowedWorkOnAbsence And _
                (Worksheets(cSheet).Range("D" & colrow(1)).Value <> "" Or Worksheets(cSheet).Range("E" & colrow(1)).Value <> "")) _
            Or _
                (((colrow(0) = "D" And Worksheets(cSheet).Range(colrow(0) & colrow(1)).Value <> "") Or _
                (colrow(0) = "E" And Worksheets(cSheet).Range(colrow(0) & colrow(1)).Value <> "")) And _
                Not allowedWorkOnAbsence) _
            ) Then
        
            MsgBox mprompt("invalidInputText"), vbCritical, mprompt("invalidInputTitle")
			undo
        End If
    Next cell
    Exit Sub

undo:
    undo
    On Error GoTo 0
End Sub

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' initialization
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function init() As Boolean
    'Tabelle2 is the sheet codename from the first timetable by default
    Dim mprompt As New Collection
    Set mprompt = Locals.Language()

    If Val(Tabelle2.Cells(1, 4).Value) < 1 Then
        Select Case MsgBox(mprompt("initWelcomeText"), vbOKCancel + vbInformation, mprompt("initWelcomeTitle"))
        Case vbOK:
            
            Dim holiday As Variant
            Dim time As Variant
            holiday = InputBox(mprompt("initHolidayText"), mprompt("initHolidayTitle"))
            time = InputBox(mprompt("initTimeText"), mprompt("initTimeTitle"))
            
            If Not IsNull(holiday) And holiday <> "" And Not IsNull(time) And holiday <> "" Then
                Dim newMonth As Integer: newMonth = DatePart("m", Date)
                Dim newYear As Integer: newYear = DatePart("yyyy", Date)
                Dim prefix As String: prefix = "M"
                If newMonth < 10 Then
                    prefix = prefix & "0"
                End If
        
                'rename last timetable sheet to current month/year
                Tabelle2.Name = prefix & newMonth & "." & newYear
                'unprotect sheet and set values
                persistent "unlocked", "set", True
                Tabelle2.Unprotect Tabelle0.Cells(1, 2).Value
                Tabelle2.Range("D1").Value = newMonth
                Tabelle2.Range("E1").Value = newYear
                Tabelle2.Range("D43").Value = CDec(holiday)
                Tabelle2.Range("H44").Value = CDec(time)
                'consider new amount of holiday in january only
                If newMonth = 1 Then
                    Tabelle2.Range("D45").FormulaLocal = "=D42+D43-D44"
                Else
                    Tabelle2.Range("D45").FormulaLocal = "=D43-D44"
                End If
                'reprotect sheet again
                Tabelle2.Protect Tabelle0.Cells(1, 2).Value, True, True
                persistent "unlocked", "set", False
                init = True
                
            Else:
                MsgBox mprompt("initCancelText"), vbOKOnly + vbExclamation, mprompt("initCancelTitle")
            End If
        Case vbCancel:
            MsgBox mprompt("initCancelText"), vbOKOnly + vbExclamation, mprompt("initCancelTitle")
        End Select
    Else:
        init = True
    End If
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' add monthly sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub addSheets()
    'unlock sheets while adding new ones to avoid password query
    persistent "unlocked", "set", True
    'avoid all user input checks while adding sheets
    addingSheet = True
    'set new sheets to false
    persistent "newsheet", "set", False
    'get last sheet
    Dim ws As Object
    Set ws = Sheets(Sheets.Count)
    
    'get month and year of last sheet according to name
    Dim lastDate As Variant: lastDate = Split(ws.Name, ".")
    'make it date objects
    Dim newSheet As Date: newSheet = DateValue("1/" & Right(lastDate(0), 2) & "/" & lastDate(1))
    Dim newMonth As Integer, newYear As Integer, row As Integer
    Dim formerSheet As Variant
    Dim formerMonth As Integer
    Dim formerYear As Integer
    
    'add sheets as long last sheet does not match current month
    While DateDiff("m", newSheet, "1/" & DatePart("m", Date) & "/" & DatePart("yyyy", Date)) > 0
    
        'update cheet name because of loop
        Set ws = Sheets(Sheets.Count)
        'copy last sheet
        Sheets(ws.Name).Copy after:=Sheets(ws.Name)
        'prefix necessary because sheet names must not start with a number while handling with vba
        Dim prefix As String: prefix = "M"
        'add one month to last sheet date
        newSheet = DateAdd("m", 1, newSheet)
        'rename new sheet
        newMonth = DatePart("m", newSheet)
        newYear = DatePart("yyyy", newSheet)
        If newMonth < 10 Then
            prefix = prefix & "0"
        End If
        ActiveSheet.Name = prefix & newMonth & "." & newYear
        'unprotect new sheet
        ActiveSheet.Unprotect Tabelle0.Cells(1, 2).Value

        'update month and year to sheet for fomulas
        Range("D1").Value = newMonth
        Range("E1").Value = newYear
        
        'clear inputs from former month and rewrite fomula for holidays
        Range("C10:G40").ClearContents 'holidays, start- and end-time
        
        Dim mprompt As New Collection
        Set mprompt = Locals.Language()

        'insert formula for auto-holiday
        For row = 10 To 40
            Cells(row, 3).FormulaLocal = "=publicHolidays(A" & row & ")"
            'insert formula for auto short break
            Cells(row, 6).FormulaLocal = "=WENN(E" & row & "-D" & row & "-(G" & row & "/60/24)>9/24;15;0)"
            'insert formula for auto long break
            Cells(row, 7).FormulaLocal = "=WENN(E" & row & "-D" & row & ">6/24;30;0)"
        Next row
        'clear other inputs from former month. this has to be done separately for cells that are not locked, otherwise an error occurs becoause of restrictions
        'clear last comments
        Range("I10:I46").ClearContents
        'left holidays and timesum from former sheet. has to be inserted because first sheet does not contain formula after init
        formerSheet = DateAdd("m", -1, newSheet)
        prefix = "M"
        formerMonth = DatePart("m", formerSheet)
        formerYear = DatePart("yyyy", formerSheet)
        If formerMonth < 10 Then
            prefix = prefix & "0"
        End If
        Range("D43").FormulaLocal = "=" & prefix & formerMonth & "." & formerYear & "!$D$45" 'holiday
        Range("H44").FormulaLocal = "=" & prefix & formerMonth & "." & formerYear & "!$H$46" 'timesum
        'consider new amount of holiday in january only
        If newMonth = 1 Then
            Range("D45").FormulaLocal = "=D42+D43-D44"
        Else
            Range("D45").FormulaLocal = "=D43-D44"
        End If
        'clear last correction of monthly work-time
        Range("H45").ClearContents
    
        'activate new sheet for next loop
        Worksheets(Sheets(Sheets.Count).Name).Activate
        'reprotect new sheet
        ActiveSheet.Protect Tabelle0.Cells(1, 2).Value, True, True
        'set focus to first day
        ActiveSheet.Range("D10").Select
        'set new sheets to true to remind for holidays on save if sheets are added - normally once a month
        persistent "newsheet", "set", True
    Wend
    'lock sheets after adding new ones to force password query again
    persistent "unlocked", "set", False
    'activete all user input checks after adding sheets
    addingSheet = False

    'activate last sheet by default
    Worksheets(Sheets(Sheets.Count).Name).Activate
End Sub

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' holiday reminder
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub holidayReminder()
    'this is called by the save-event and presumes that the last sheet is recent and up-to-date
    Dim mprompt As New Collection
    Set mprompt = Locals.Language()
	On Error Resume Next
    'goto last sheet
    Worksheets(Sheets(Sheets.Count).Name).Activate
    'get paid leave counts
    Dim plWhole As Integer: plWhole = Range("D42").Value
    Dim plRest As Integer: plRest = Range("D45").Value
    Dim yearRest As Integer: yearRest = DateDiff("d", Date, "31/12/" & DatePart("yyyy", Date))
    If plRest / plWhole > yearRest / 365 Then
        MsgBox mprompt("holidayReminderChunk0") & plRest & mprompt("holidayReminderChunk1") & yearRest & mprompt("holidayReminderChunk2"), vbOKOnly + vbExclamation, mprompt("holidayReminderTitle")
    End If
	On Error GoTo 0
End Sub
