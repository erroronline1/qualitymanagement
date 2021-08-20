Option Explicit
 
Private Sub Worksheet_BeforeDoubleClick(ByVal target As Range, Cancel As Boolean)
    Dim setup As New Collection
    Set setup = Locals.setupVendorList
    If Essentials.WriteFile(ActiveWorkbook.path & "\writepermission.temp", "1", True) Then
        'define values from this sheet and initialize variables
        Dim lastrow: lastrow = Essentials.LastRowOrColumn(ThisWorkbook, "rows", setup("vendor.sheetName"), 1, setup("vendor.vendorColumn"), False)
        
        'start procedure if doubleclick is within allowed column only
        If Selection.Count = 1 And Not Intersect(target, Range(setup("vendor.documentColumn") & setup("vendor.rowOffset") & ":" & setup("vendor.documentColumn") & lastrow)) Is Nothing Then
            Cancel = True
            Dim docs: docs = Cells(target.Row, Essentials.convertColumn("2number", setup("vendor.documentColumn")))
            Dim download: download = Cells(target.Row, Essentials.convertColumn("2number", setup("vendor.downloadColumn")))
            Dim customer: customer = Cells(target.Row, Essentials.convertColumn("2number", setup("vendor.customerColumn")))
            Dim rcpt: rcpt = Cells(target.Row, Essentials.convertColumn("2number", setup("vendor.rcptColumn")))
            
            'warning if no mail-address is found
            If rcpt = "" Then
                MsgBox setup("runtime.missingRcptError")
                Exit Sub
            End If

            If docs <> "" And docs <> "-" Then
                'prepare email and conditional replace text
                Dim subject As String: subject = Replace(setup("vendor.mailSubject"), "{documents}", docs)
                Dim mailtext As String: mailtext = setup("vendor.mailBody")
                mailtext = Replace(mailtext, "{documents}", docs)
                If download <> "" And download <> "-" Then
                    mailtext = Replace(mailtext, "{download}", setup("vendor.ifDownload"))
                Else
                    mailtext = Replace(mailtext, "{download}", setup("vendor.ifNotDownload"))
                End If
                If customer <> "" Then
                    mailtext = Replace(mailtext, "{customer}", Replace(setup("vendor.ifcustomer"), "{customer}", customer))
                Else
                    mailtext = Replace(mailtext, "{customer}", "")
                End If
                'send email
                Call Essentials.createMail(rcpt, subject, mailtext)
                'paste date if email has actually been sent
                Select Case MsgBox(setup("runtime.mailSent"), vbYesNo + vbDefaultButton2 + vbQuestion)
                    Case vbYes
                        Range(setup("vendor.dateColumn") & target.Row) = Format(Now, setup("runtime.dateFormat"))
                End Select
            Else
                MsgBox setup("vendor.noDemand")
            End If
        End If
    Else
        MsgBox setup("runtime.writeError")
    End If
End Sub