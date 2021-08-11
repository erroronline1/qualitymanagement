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
' customize this collection to your language requirements and your structure of the listed documents excel sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function setup() As Collection
    Set setup = New Collection
    setup.Add Item:="Versionierung und Veröffentlichung stehen nicht zur Verfügung. Das Dokument muss direkt gestartet werden - nicht aus der Liste der Dokumente heraus - damit die Makros genutzt werden können.", Key:="startup.execution"
    setup.Add ">>hier Doppenklick zum versionieren und veröffentlichen<<", "startup.macrobutton"
    setup.Add "Nachweisdokumententitel anpassen", "initiate.recordTitleSet" ' in case of current version number being false
    ' prompt to start version or release date assignment, values for userform
    setup.Add "Ausgabestand aktualisieren?", "initiate.recordTitle"
    setup.Add "Das Dokument '" & ThisDocument.Variables("title").Value & "' wird gespeichert." & vbNewLine & vbNewLine & _
                "[Automatisch] um Ausgabestand automatisch auf heute (" & Format(Date, "yyyymmdd") & ") zu aktualisieren" & vbNewLine & vbNewLine & _
                "[Manuell] um Ausgabestand manuell anzupassen" & vbNewLine & vbNewLine & _
                "In beiden Fällen kann anschließend die aktuelle Version archiviert und veröffentlicht werden." & vbNewLine & vbNewLine & "[Abbrechen] um Ausgabestand nicht zu ändern", "initiate.recordConfirm"
    setup.Add "Version und Veröffentlichungsdatum aktualisieren?", "initiate.versionedTitle"
    setup.Add "Das Dokument '" & ThisDocument.Variables("title").Value & "' wird gespeichert." & vbNewLine & vbNewLine & _
                "[Automatisch] um Versionstand automatisch auf Version V{version}." & format(Date, "yyyymmdd") & " zu aktualisieren (V0 ist nicht zulässig)" & vbNewLine & vbNewLine & _
                "[Manuell] um Versionsstand manuell anzupassen" & vbNewLine & vbNewLine & _
                "In beiden Fällen kann anschließend die aktuelle Version archiviert und veröffentlicht, sowie die Aktualisierung der Liste der gültigen Dokumente durchgeführt werden." & vbNewLine & vbNewLine & "[Abbrechen] um Versionsstand nicht zu ändern", "initiate.versionedConfirm"
    setup.Add Array("Automatisch", "Manuell"), "initiate.options"
    setup.Add "Abbrechen", "initiate.cancel"
    setup.Add 200, "initiate.labelHeight" ' false for auto height for userform based on options, integer to set according to content
    ' prompt to set version manually
    setup.Add "Version", "manualVersioning.versionTitle"
    setup.Add "Neuen Versionsstand angeben oder Abbrechen um Version beizubehalten (0 ist nicht zulässig)", "manualVersioning.versionPrompt"
    setup.Add "Veröffentlichungsdatum", "manualVersioning.releasedateTitle"
    setup.Add "Neues Einführungsdatum angeben oder Abbrechen um Datum beizubehalten", "manualVersioning.releasedatePrompt"
    ' prompt to archive current version without code
    setup.Add "Kopie mit Versionsnummer ohne Code im Archiv speichern?", "archive.confirmPrompt"
    setup.Add "gespeichert. Im Archiv befindet sich die Datei ohne Code. Dadurch wird der Inhalt nicht fälschlicherweise automatisch aktualisiert.", "archive.successPrompt"
    ' prompt for format
    setup.Add Item:="Freigeben als...", Key:="format.caption"
    setup.Add "Dokument freigeben als PDF oder als interaktives Word-Dokument?" & vbNewLine & "Word-Dokumente sind gegen Änderung geschützt und lassen nur Fomulareingaben zu." & _
        vbNewLine & vbNewLine & "Die Dateinamenerweiterung wird automatisch angepasst, unabhängig was die Auswahl des Speicherorts sagt.", "format.label"
    setup.Add Array("PDF", "DOCM"), "format.options"
    setup.Add "Abbrechen", "format.cancel"
    setup.Add False, "format.labelHeight"
    ' prompt to publish document as pdf-file
    setup.Add "Dokument als PDF Veröffentlichen? (Dateiendung wird automatisch angepasst!)", "publish.pdfconfirmPrompt"
    ' prompt to publish document as docm-file
    setup.Add "Dokument als interaktives DOCM Veröffentlichen? (Dateiendung wird automatisch angepasst!)", "publish.docmconfirmPrompt"
    setup.Add "Bitte anderen Speicherort wählen!", "publish.docmdestinationErrorTitle"
    setup.Add "Das Dokument kann nicht am gleichen Ort wie die Arbeitsdatei gespeichert werden!", "publish.docmdestinationError"
    setup.Add "Dokument veröffentlicht als", "publish.successPrompt"
    ' prompt and structure to update list of documents in force
    setup.Add "Excel-Liste der gültigen Dokumente zur Aktualisierung des Versionsstandes wählen", "updateList.autoUpdatePrompt"
    setup.Add "Automatische Aktualisierung nicht möglich!", "updateList.autoUpdateErrorTitle"
    setup.Add "Die Liste der gültigen Dokumente wurde nicht ausgewählt!" & vbNewLine & "Nochmal versuchen oder abbrechen?" & vbNewLine & "(im zweiten Fall bitte manuell aktualisieren)", "updateList.autoUpdateErrorPrompt"
    setup.Add "A", "updateList.documentNovel"
    setup.Add "B", "updateList.documentTitle"
    setup.Add "C", "updateList.documentVersion"
    setup.Add "D", "updateList.documentHyperlink"
    setup.Add "E", "updateList.documentFormat"
    setup.Add "", "updateList.documentPDFHyperlink" ' the variable "updateList.documentPDFHyperlink" can be customized to update the list of documents _
        in case you want this to be. since i recommend docm-files to be handled as working files _
        and editing/publishing might take place on different dates, or you consider to store the pdfs _
        temporarily on a different location e.g. to make them editable in advance to publishing _
        this option is set empty by default in published version. as soon you set the value to the _
        desired column the link will be written to the list of documents in force if a published pdf file is saved
End Function