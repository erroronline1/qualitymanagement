Attribute VB_Name = "Secure"
Option Explicit
Public userInput As String
Public maskedPrompt As New Collection


Public Sub Protection(ByVal Sheet As String)
    'for security reasons there will always be an undo on error. i hope you saw this line before becoming desparated with edits in sheet disappapearing constantly.
    On Error GoTo undo
    If Not Essentials.persistent("unlocked", "get", True) Then
        Dim mprompt As New Collection
        Set mprompt = Locals.Language()
        
        'set variables for masked input - password query
        Set maskedPrompt = Nothing
        maskedPrompt.Add Item:=mprompt("queryPasswordTitle"), Key:="caption"
        maskedPrompt.Add mprompt("queryPasswordText"), "label"
        maskedPrompt.Add mprompt("queryPasswordOK"), "ok"
        maskedPrompt.Add mprompt("queryPasswordCancel"), "cancel"
        Dim PW As String
        PW = maskedUserInput(maskedPrompt)
        If PW = "" Then
            Dim PWaction As Boolean
            Select Case MsgBox(mprompt("resetPasswordText"), vbYesNo + vbDefaultButton2, mprompt("resetPasswordTitle"))
            Case vbYes:
                PWaction = passwordHandler("set", PW)
            Case vbNo:
                PWaction = False
            End Select
            If PWaction = False Then
                GoTo undo
            End If
        ElseIf passwordHandler("get", PW) Then
            Essentials.persistent "unlocked", "set", True
        ElseIf Not passwordHandler("get", PW) Then
            MsgBox mprompt("queryPasswordError")
            GoTo undo
        End If
    End If
    Exit Sub

undo:
        ' undo last change if not exited before, unlocked has to be set otherwise this will be a password requiring change as well
        Essentials.undo
        On Error GoTo 0
End Sub

Public Function passwordHandler(ByVal action As String, uinput As String) As Boolean
    'get last line of user passwords, Tabelle0 is sheet codename from settings sheet
    Dim recentPassword As Integer: recentPassword = Tabelle0.Range("B" & Rows.Count).End(xlUp).row
    
    If action = "get" Then
        'last user password has to be found in line>3
        If recentPassword < 3 Then GoTo newPassword
        If CStr(Tabelle0.Cells(recentPassword, 2).Value) = uinput Then passwordHandler = True
    ElseIf action = "set" Then
        GoTo newPassword
    End If
    Exit Function
    
newPassword:
        Dim userpass, userpassconfirm As Variant
        Dim mprompt As New Collection
        Set mprompt = Locals.Language()
        
        'set variables for masked input - new password
        Set maskedPrompt = Nothing
        maskedPrompt.Add Item:=mprompt("setPasswordTitle"), Key:="caption"
        maskedPrompt.Add mprompt("setPasswordText"), "label"
        maskedPrompt.Add mprompt("setPasswordOK"), "ok"
        maskedPrompt.Add mprompt("setPasswordCancel"), "cancel"
        
        'force password input - no exit condition!
        While userpass = ""
            userpass = maskedUserInput(maskedPrompt)
        Wend
        
        'set variables for masked input - password conformation
        Set maskedPrompt = Nothing
        maskedPrompt.Add Item:=mprompt("setPasswordTitle"), Key:="caption"
        maskedPrompt.Add mprompt("setPasswordConfirmText"), "label"
        maskedPrompt.Add mprompt("setPasswordOK"), "ok"
        maskedPrompt.Add mprompt("setPasswordCancel"), "cancel"
        userpassconfirm = maskedUserInput(maskedPrompt)
        
        If userpass = userpassconfirm Then
            'add new password and timestamp for traceability
            Tabelle0.Cells(recentPassword + 1, 2).Value = userpass 'new password
            'for security and traceability in case of possible violation
            Tabelle0.Cells(recentPassword + 1, 3).Value = Now 'timestamp of setting
            Tabelle0.Cells(recentPassword + 1, 4).Value = Environ("Username") 'account of setting
            'if new password is confirmed there is no need for another input postulated
            Essentials.persistent "unlocked", "set", True
            passwordHandler = True
        Else
            MsgBox mprompt("setPasswordError"), vbCritical
        End If
End Function

Public Function maskedUserInput(ByRef mprompt As Collection) As String
    'hide vbe window to prevent screen flashing
    Application.VBE.MainWindow.Visible = False
    
    ' create temp userform
    Dim TempForm: Set TempForm = ThisWorkbook.VBProject.VBComponents.Add(3)
    
    'add label
    Dim NewLabel: Set NewLabel = TempForm.Designer.Controls.Add("forms.label.1")
    With NewLabel
        .Caption = mprompt("label")
        .Width = 204
        .Height = 58
        .Left = 8
        .Top = 8
    End With
    
    'add textbox
    Dim NewTextBox: Set NewTextBox = TempForm.Designer.Controls.Add("forms.textbox.1")
    With NewTextBox
        .PasswordChar = Chr(149) 'bullet
        .Width = 289
        .Height = 18
        .Left = 8
        .Top = 72
    End With
    
    'add OK button
    Dim NewCommandButton1: Set NewCommandButton1 = TempForm.Designer.Controls.Add("forms.CommandButton.1")
    With NewCommandButton1
        .Caption = mprompt("ok")
        .Height = 18
        .Width = 57
        .Left = 240
        .Top = 8
    End With
    
    'add cancel button
    Dim NewCommandButton2: Set NewCommandButton2 = TempForm.Designer.Controls.Add("forms.CommandButton.1")
    With NewCommandButton2
        .Caption = mprompt("cancel")
        .Height = 18
        .Width = 57
        .Left = 240
        .Top = 30
    End With
    
    'add event-handler subs for the buttons & userform
    Dim x As Integer
    With TempForm.CodeModule
        x = .CountOfLines
        .insertlines x + 1, "Sub CommandButton2_Click()"
        .insertlines x + 2, "userInput = " & Chr(34) & Chr(34) & ": Unload Me"
        .insertlines x + 3, "End Sub"
        
        .insertlines x + 4, "Sub CommandButton1_Click()"
        .insertlines x + 5, "userInput = CStr(TextBox1.value): Unload Me"
        .insertlines x + 6, "End Sub"
        
        .insertlines x + 7, "Private Sub UserForm_Initialize()"
        .insertlines x + 8, "Application.EnableCancelKey = xlErrorHandler"
        .insertlines x + 9, "End Sub"
        
        .insertlines x + 10, "Private Sub TextBox1_KeyDown(ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)"
        .insertlines x + 11, "If KeyCode = 13 Then userInput = CStr(TextBox1.value): Unload Me"
        .insertlines x + 12, "End Sub"
    End With
    
    'adjust the form
    With TempForm
        .Properties("Caption") = mprompt("caption")
        .Properties("Width") = 315
        .Properties("Height") = 123
        .Properties("StartUpPosition") = 2 'screen center
    End With
    
    'show the form
    VBA.UserForms.Add(TempForm.Name).Show
    
    'pass the variable back
    maskedUserInput = userInput
    
    'delete the form
    ThisWorkbook.VBProject.VBComponents.Remove VBComponent:=TempForm
End Function
