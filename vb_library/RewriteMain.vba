Attribute VB_Name = "Rewrite"
'(c) 2020 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license

'add this module temporarily within the essentials module, call the sub in the openRoutine _
(both commented put at the moment), paste absolute path to source file _
and you can update the main code just by opening and saving all necessary files. _
no meddling with the developer console necessary :)

Sub rewriteMain()
	'delete code from ThisDocument
	ActiveDocument.VBProject.VBComponents.Item(1).CodeModule.DeleteLines 1, ActiveDocument.VBProject.VBComponents.Item(1).CodeModule.CountOfLines
	'rewrite from file
	With ThisDocument.VBProject
		.VBComponents("ThisDocument").CodeModule.AddFromFile _
		"E:\Quality Management\vb_library\Document_ThisDocument_illustration.vba"
	End With
	'delete module
    ThisDocument.VBProject.VBComponents.Remove ThisDocument.VBProject.VBComponents("Rewrite")
End Sub
