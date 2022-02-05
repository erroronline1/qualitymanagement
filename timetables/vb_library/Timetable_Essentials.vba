Attribute VB_Name = "Essentials"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \
Option Explicit
Public verificationOverride As Boolean
Public selectedLanguage As String
Public allowAddingSheets As Boolean

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' general module handler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function Modules() as Object
    Set Modules= CreateObject("Scripting.Dictionary")
    Modules.Add "Secure", ThisWorkbook.Path & "\vb_library\" & "Timetable_Secure.vba"
    Modules.Add "Locals", ThisWorkbook.Path & "\vb_library\" & "Timetable_Locals_" & ThisWorkbook.selectedLanguage & ".vba"
'    Modules.Add "Rewrite", ThisWorkbook.Path & "\vb_library\RewriteMain.vba"
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' events
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Sub OpenRoutine()
    If ThisWorkbook.importModules(Modules()) Then asyncOpen
End Sub 

Public Sub asyncOpen()
'    Rewrite.rewriteMain ThisWorkbook, "DieseArbeitsmappe", ThisWorkbook.Path & "\vb_library\Timetable_ThisWorkbook_" & ThisWorkbook.Workmodel & ".vba"
    persistent "Workmodel", "set", ThisWorkbook.Workmodel

    'set unlocked to false on opening by default, this is essential. see functions comment.
    persistent "unlocked", "set", False

    If Application.ProtectedViewWindows.Count > 0 Then
        Dim mprompt As New Collection
        Set mprompt = Locals.Language()
        MsgBox (mprompt("restartFromProtectedView"))
    Else
        If init() Then addSheets ': Calculate 'should avoid displaying weird uncalculated cell values on startup but does cause error most probably with excel2010
    End If
End Sub

Public Sub CloseRoutine()
    updateAbsence
    If persistent("newSheet", "get", True) Then holidayReminder
End Sub 

Public Sub ChangeRoutine(ByVal Sheet As String, ByVal Target As Range)
    If Not verificationOverride Then
        Secure.Protection Sheet
        ' if input in time editing range and displayed text not empty - especially to avoid errors on dumping multiple cells
        If Not Intersect(Target, Range("D11:E41")) Is Nothing And Target.Text <> "" Then
            ' check for valid time format, if vartype not single (float) or time value not in 0-1
            If (VarType(Target.value) <> 5) Or _
                (VarType(Target.value) = 5 And (Target.value < 0 Or Target.value > 1)) _
            Then
                Dim mprompt As New Collection
                Set mprompt = Locals.Language()
                MsgBox mprompt("invalidInputFormat"), vbCritical, mprompt("invalidInputTitle")
                undo
            End If
            ' check for valid input regarding permission
            absenceHandler Sheet, Target
        End If
        'recalculate
        ActiveSheet.EnableCalculation = False
        ActiveSheet.EnableCalculation = True
    End If
End Sub

Public Sub undo()
    If Val(ThisWorkbook.Sheets(3).Cells(1, 4).Value) > 0 Then 'uninitialized file causes excel to crash
        verificationOverride = True
        Application.undo
        verificationOverride = False
    End If
End Sub

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' standard runtime functions
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function persistent(value As String, action As String, setter As Variant) As Variant
    'runtime properties have to be written to the setting sheet because on closing a user-form all public/global values are gone. this were some wild hours.
    'returns always the last setting regardless of setter on get-call
    Dim column As Integer
    If value="masterpass" Then
        persistent = ThisWorkbook.Sheets("settings").Cells(1, 2).Value
    Else
        If value = "unlocked" Then column = 2
        If value = "newSheet" Then column = 3
        If value = "Workmodel" Then column = 4
        If TypeName(setter)="Boolean" Then
            If action = "set" Then ThisWorkbook.Sheets("settings").Cells(2, column).Value = CInt(setter)
            persistent = CBool(ThisWorkbook.Sheets("settings").Cells(2, column).Value)
        Else
            If action = "set" Then ThisWorkbook.Sheets("settings").Cells(2, column).Value = CStr(setter)
            persistent = CStr(ThisWorkbook.Sheets("settings").Cells(2, column).Value)
        End If
    End If
End Function

Public Sub updateAbsence()
    'update absence reasons in asyncOpen crashes application if other files are opened
    ThisWorkbook.Worksheets("info").Unprotect persistent("masterpass", "get", True)
    Dim rng As Range, absenceItem, absenceIterator
    'set where to find list in info-sheet
    Dim absenceList(2): absenceList(0) = "10": absenceList(1) = "A"
    'write from local module
    For Each absenceItem in Locals.Absence()
        ThisWorkbook.Sheets("info").Range(absenceList(1) & absenceList(0) + absenceIterator).Value = absenceItem
        absenceIterator = absenceIterator + 1
    Next absenceItem
    'define range
    Set rng = ThisWorkbook.Worksheets("info").Range(ThisWorkbook.Sheets("info").Cells(absenceList(0), absenceList(1)), ThisWorkbook.Sheets("info").Cells(ThisWorkbook.Sheets("info").Rows.Count, absenceList(1)).End(xlUp))
    'update name for dropdown according to range
    ThisWorkbook.Names("absence").RefersTo = rng
    ThisWorkbook.Sheets("info").Protect persistent("masterpass", "get", True), True, True
End Sub

Public Sub absenceHandler(ByVal cSheet, ByVal Range)
    'checks if absence and time values are colliding
    On Error GoTo undo
    
    Dim mprompt As New Collection
    Set mprompt = Locals.Language()

    Dim cell As Range
    For Each cell In Range
        If Not cell.Locked Then
            Dim colrow() As String: colrow() = Split(Right(CStr(cell.Address), Len(CStr(cell.Address)) - 1), "$")

            'allowed values in column c
            Dim allowedWorkOnAbsence As Boolean
            allowedWorkOnAbsence=(  Worksheets(cSheet).Range("C" & colrow(1)).Value="" Or _
                                    Worksheets(cSheet).Range("C" & colrow(1)).Value=Locals.Absence("public_holiday") Or _
                                    Worksheets(cSheet).Range("C" & colrow(1)).Value=Locals.publicHolidays(Worksheets(cSheet).Range("A" & colrow(1)).Value))
            'warning and undo
            'if row between 11 and 41
            'and current column is c and existing values in d or e
            'or current column is d or e and existing value in c
            If colrow(1) >= 11 And colrow(1) <= 41 _
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
        End If
    Next cell
    Exit Sub

undo:
    undo
    On Error GoTo 0
End Sub

Public Function workDays(ByVal Days As String) As Object
    'get typical workdays as an array
    Dim regExPattern As String: regExPattern = "\w+"
    Dim regEx As New RegExp
    With regEx
        .Global = True
        .MultiLine = True
        .IgnoreCase = True
        .Pattern = regExPattern
    End With
    Set workDays = regEx.Execute(Days)
End Function

Public Function workDaysNum(Byval Days as String) As Integer
    workDaysNum=workDays(Days).Count
End Function

Public Function countDays(ByVal Days As String, ByVal returnType as String, ByVal cSheet as String) As Integer
    Application.volatile
   ' calculate net work days
    Dim fromRow As Integer: fromRow = 11
    Dim dateColumn As String: dateColumn = "A"
    Dim dayColumn As String: dayColumn = "B"
    Dim absenceColumn As String: absenceColumn = "C"
    Dim maxDays As Integer: maxDays = 31
    Dim cRow, cDay, oMatches, f
    Dim cDayInWorkdays As Boolean
    countDays = 0
    Set oMatches = workDays(Days)
    
    For cRow = fromRow To fromRow + maxDays - 1
        cDayInWorkdays = False
        cDay = ThisWorkbook.Sheets(csheet).Range(dayColumn & cRow)
        For Each f In oMatches
            If f = cDay Then cDayInWorkdays = True: Exit For
        Next f
        If (returnType="workdays" And _
            cDayInWorkdays And (ThisWorkbook.Sheets(csheet).Range(absenceColumn & cRow).Value = "" Or ThisWorkbook.Sheets(csheet).Range(absenceColumn & cRow).Value = Locals.Absence()("overtime"))) Or _
            (returnType="vacation" And _
            cDayInWorkdays And ThisWorkbook.Sheets(csheet).Range(absenceColumn & cRow).Value = Locals.Absence()("vacation")) Then
            countDays = countDays + 1
        End If
    Next cRow
End Function

Public Function calcHours(ByVal Come, ByVal Go, ByVal PauseA, ByVal PauseBOrHomeoffice) As Variant
    Application.volatile
    If Come <> "" And Go <> "" Then
        'reassign global value after user form passwordinput flushes these
        ThisWorkbook.Workmodel = persistent("Workmodel", "get", "Workmodel")
        'round floats to the precision of eight, otherwise the comparison fails
        Dim StepA: StepA = Round(6 / 24, 8) 'six hours
        Dim MinA: MinA = Round(0.5 / 24, 8) 'min pause of 30 minutes at more than six hours
        Dim StepB: StepB = Round(9 / 24, 8) 'nine hours
        Dim MinB: MinB = Round(0.75 / 24, 8) 'min pause of 45 minutes at more than nine hours
        calcHours = Round(Go - Come, 8)
        If PauseA <> 0 And PauseA < 15 Then PauseA = 15

        If ThisWorkbook.Workmodel = "Standard" Then
            If PauseBOrHomeoffice <> 0 And PauseBOrHomeoffice < 15 Then PauseBOrHomeoffice = 15
            
            Dim pauseSum: pauseSum = Round(PauseA / 60 / 24, 8) + Round(PauseBOrHomeoffice / 60 / 24, 8)
            
            If calcHours - pauseSum > StepB Then
                If pauseSum > MinB Then
                    calcHours = calcHours - pauseSum
                Else
                    calcHours = calcHours - MinB
                End If
            ElseIf calcHours - pauseSum > StepA Then
                If pauseSum > MinA Then
                    calcHours = calcHours - pauseSum
                Else
                    calcHours = calcHours - MinA
                End If
            Else
                calcHours = calcHours - pauseSum
            End If
        ElseIf ThisWorkbook.Workmodel = "Homeoffice" Then
            If calcHours - Round(PauseA / 60 / 24, 8) > StepB Then
                calcHours = calcHours - MinB + PauseBOrHomeoffice / 60 / 24
            ElseIf calcHours - Round(PauseA / 60 / 24, 8) > StepA Then
                calcHours = calcHours - MinA + PauseBOrHomeoffice / 60 / 24
            Else
                calcHours = calcHours - PauseA / 60 / 24 + PauseBOrHomeoffice / 60 / 24
            End If
        End If
    Else
        calcHours = 0
    End If
End Function

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' initialization
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function init() As Boolean
    Dim mprompt As New Collection
    Set mprompt = Locals.Language()
    Dim initialSheet
    Set initialSheet = ThisWorkbook.Sheets(Sheets.Count)

    'actual initialization
    If Val(initialSheet.Cells(1, 4).Value) < 1 Then
        Select Case MsgBox(mprompt("initWelcomeText"), vbOKCancel + vbInformation, mprompt("initWelcomeTitle"))
        Case vbOK:
            Worksheets(Sheets(Sheets.Count).Name).Activate
           
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
                initialSheet.Name = prefix & newMonth & "." & newYear
                
                'unprotect sheet and set values
                verificationOverride = True
                initialSheet.Unprotect persistent("masterpass", "get", True)
                initialSheet.Range("D1").Value = newMonth
                initialSheet.Range("E1").Value = newYear
                initialSheet.Range("D44").Value = CDec(holiday)
                initialSheet.Range("H45").Value = CDec(time)
                'consider new amount of holiday in january only
                If newMonth = 1 Then
                    initialSheet.Range("D46").FormulaLocal = "=D43+D44-D45"
                Else
                    initialSheet.Range("D46").FormulaLocal = "=D44-D45"
                End If
                'set to recent local formulas
                Locals.updateXLSfunctions ""

                'reprotect sheet again
                initialSheet.Protect persistent("masterpass", "get", True), True, True
                verificationOverride = False
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
    'avoid all user input checks while adding sheets
    verificationOverride = True
    'override otherwise disabled adding of sheets
    allowAddingSheets = True
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
        ActiveSheet.Unprotect persistent("masterpass", "get", True)

        'update month and year to sheet for fomulas
        Range("D1").Value = newMonth
        Range("E1").Value = newYear
        
        'clear inputs from former month and rewrite formulas
        Range("C11:G41").ClearContents 'holidays, start- and end-time, breaks/homeoffice
        Locals.updateXLSfunctions ""

        'clear other inputs from former month. this has to be done separately for cells that are not locked, otherwise an error occurs becoause of restrictions
        'clear last comments
        Range("I11:I47").ClearContents
        'left holidays and timesum from former sheet. has to be inserted because first sheet does not contain formula after init
        formerSheet = DateAdd("m", -1, newSheet)
        prefix = "M"
        formerMonth = DatePart("m", formerSheet)
        formerYear = DatePart("yyyy", formerSheet)
        If formerMonth < 10 Then
            prefix = prefix & "0"
        End If
        Range("D44").FormulaLocal = "=" & prefix & formerMonth & "." & formerYear & "!$D$46" 'holiday
        Range("H45").FormulaLocal = "=" & prefix & formerMonth & "." & formerYear & "!$H$47" 'timesum
        'consider new amount of holiday in january only
        If newMonth = 1 Then
            Range("D46").FormulaLocal = "=D43+D44-D45"
        Else
            Range("D46").FormulaLocal = "=D44-D45"
        End If
        'clear last correction of monthly work-time
        Range("H46").ClearContents
    
        'activate new sheet for next loop
        Worksheets(Sheets(Sheets.Count).Name).Activate
        'reprotect new sheet
        ActiveSheet.Protect persistent("masterpass", "get", True), True, True
        'set focus to first day
        ActiveSheet.Range("D11").Select
        'set new sheets to true to remind for holidays on save if sheets are added - normally once a month
        persistent "newSheet", "set", True
        'prevent manually adding sheets again
        allowAddingSheets = False
    Wend

    'update legacy sheets while beta testing, could be reduced to activation of last sheet for performance reason later on _
    beware keeping everything updating. in case of calculatory changes this might also have an effect on past sheets messing everything up! _
    so change firstlegacy as desired, with caution
'    Dim legacy As Long, firstlegacy
'    firstlegacy=Sheets.Count - 6 'change to Sheets.Count for latest sheet or Sheet-Counts - desired amount of past sheets to update. 
'    if firstlegacy < 3 Then firstlegacy = 3 'correction if less than desired amount is available
'    For legacy = firstlegacy To Sheets.Count 
        'activate, handle protection and update sheets
'        Worksheets(Sheets(legacy).Name).Activate
'        ActiveSheet.Unprotect persistent("masterpass", "get", True)
'        Locals.updateXLSfunctions Sheets(legacy).Name
'        ActiveSheet.Protect persistent("masterpass", "get", True), True, True
'    Next legacy

    'activate all user input checks after adding sheets
    verificationOverride = False
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
    Dim plWhole As Integer: plWhole = Range("D43").Value
    Dim plRest As Integer: plRest = Range("D46").Value
    Dim yearRest As Integer: yearRest = DateDiff("d", Date, "31/12/" & DatePart("yyyy", Date))
    If plRest / plWhole > yearRest / 365 Then
        MsgBox mprompt("holidayReminderChunk0") & plRest & mprompt("holidayReminderChunk1") & yearRest & mprompt("holidayReminderChunk2"), vbOKOnly + vbExclamation, mprompt("holidayReminderTitle")
        persistent "newSheet", "set", False
    End If
    On Error GoTo 0
End Sub