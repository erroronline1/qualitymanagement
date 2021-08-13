Attribute VB_Name = "Rewrite"
'     m
'    / \    part of
'   |...|
'   |...|   bottle light quality management software
'   |___|	by error on line 1 (erroronline.one) available on https://github.com/erroronline1/qualitymanagement
'   / | \

'add this module temporarily within the essentials module, call the sub in the openRoutine _
passing ThisDocument oder ThisWorkbook, destination code module and source file - by uncommenting both steps _
and you can update the main code just by opening and saving all necessary files. _
no meddling with the developer console necessary :)

Sub rewriteMain(ByRef Workument, ByVal Module, ByVal Source)
    If Dir(Source) <> "" Then 'in case a file is moved outside of folder structure codebase would be corrupted
        'delete code from ThisDocument/ThisWorkbook
        Workument.VBProject.VBComponents(Module).CodeModule.DeleteLines 1, Workument.VBProject.VBComponents(Module).CodeModule.CountOfLines
        'rewrite from file
        Workument.VBProject.VBComponents(Module).CodeModule.AddFromFile Source
        'delete this module
        'Workument.VBProject.VBComponents.Remove Workument.VBProject.VBComponents("Rewrite")
    End If
End Sub