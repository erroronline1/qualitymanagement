Option Explicit
 
Private Sub Worksheet_BeforeDoubleClick(ByVal target As Range, Cancel As Boolean)
    Dim setup As New Collection
    Set setup = Locals.setupVendorList
    If Essentials.getWritePermission() Then
        'define values from this sheet and initialize variables
        Dim lastrow: lastrow = Essentials.LastRowOrColumn(ThisWorkbook, "rows", setup("material.sheetName"), 1, setup("material.materialColumn"), False)
        Dim material As String: material = Cells(target.Row, Essentials.convertColumn("2number", setup("material.materialColumn")))
        Dim distributor As String: distributor = Cells(target.Row, Essentials.convertColumn("2number", setup("material.vendorColumn")))
        Dim docs As String: docs = Cells(target.Row, Essentials.convertColumn("2number", setup("material.documentColumn")))
  
        If distributor = "" Then
            MsgBox setup("material.missingVendorError")
            Exit Sub
        End If
        
        'start procedure if doubleclick is within allowed column only
        If material <> "" And Selection.Count = 1 And Not Intersect(target, Range(setup("material.documentColumn") & setup("material.rowoffset") & ":" & setup("material.documentColumn") & lastrow)) Is Nothing Then
            Cancel = True
            
            'find distributor in list and get mail-address and customer-id, with error handling if not found / has been deleted
            On Error GoTo illegaldistributor
            Dim distlink
            Dim distlinkrow
            With ThisWorkbook.Worksheets(setup("vendor.sheetName")).Range(setup("vendor.vendorColumn") & setup("vendor.rowOffset") & ":" & setup("vendor.vendorColumn") & Essentials.LastRowOrColumn(ThisWorkbook, "rows", setup("vendor.sheetName"), setup("vendor.rowOffset"), "A", False))
                Set distlink = .Find(distributor, LookIn:=xlValues)
                If Not distlink Is Nothing Then
                    distlinkrow = distlink.Row
                End If
            End With
            debug.print distlinkrow
            Dim customer: customer = ThisWorkbook.Worksheets(setup("vendor.sheetName")).Cells(distlinkrow, Essentials.convertColumn("2number", setup("vendor.customerColumn")))
            Dim rcpt: rcpt = ThisWorkbook.Worksheets(setup("vendor.sheetName")).Cells(distlinkrow, Essentials.convertColumn("2number", setup("vendor.rcptColumn")))
            On Error GoTo 0
            
            'warning if no mail-address is found
            If rcpt = "" Then
                MsgBox setup("runtime.missingRcptError")
                Exit Sub
            End If
            
            'prepare email
            Dim subject As String: subject = Replace(setup("material.mailSubject"), "{material}", material)
            If docs = "" Or docs = "-" Then
                subject = Replace(subject, "{documents}", setup("material.defaultEvidence"))
            Else
                subject = Replace(subject, "{documents}", docs)
            End If
            Dim mailtext As String: mailtext = setup("material.mailBody")
            Dim evidence As String
            If docs = "" Or docs = "-" Then
                evidence = Replace(setup("material.ifNotDocuments"), "{material}", material)
            Else
                evidence = Replace(setup("material.ifDocuments"), "{material}", material)
                evidence = Replace(evidence, "{documents}", docs)
            End If
            mailtext = Replace(mailtext, "{evidence}", evidence)
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
                    Range(setup("material.dateColumn") & target.Row) = Format(Now, setup("runtime.dateFormat"))
            End Select
        End If
        Exit Sub
illegaldistributor:
        MsgBox setup("runtime.illegalVendorError")
        Exit Sub
    Else
        MsgBox setup("runtime.writeError")
    End If
End Sub