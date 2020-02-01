Attribute VB_Name = "Locals"
'(c) 2020 by error on line 1 (erroronline.one)
'this is part of "a quality management software" available on https://github.com/erroronline1/qualitymanagement unter gnu license

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
' set language chunks for messages according to your language. save with countrycode and embed in essentials accordingly
' be sure to handle this file with iso-8859-1 charset
' customize this collection to your language requirements and your structure of the listed documents excel sheet
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Public Function setup() As Collection
    Set setup = New Collection
        'prompt to start version assignment
        setup.Add Item:="Version und Ver�ffentlichungsdatum aktualisieren?", Key:="initiate.Title"
        setup.Add "Das Dokument '" & ThisDocument.Variables("title").Value & "' wird gespeichert." & vbNewLine & vbNewLine, "initiate.confirm"
        setup.Add "[Ja] um Versionstand automatisch auf Version V" & ThisDocument.Variables("version").Value + 1 & "." & Format(Date, "yyyymmdd") & " zu aktualisieren" & vbNewLine, "initiate.confirmYes"
        setup.Add "[Nein] um Versionsstand manuell anzupassen" & vbNewLine & vbNewLine, "initiate.confirmNo"
        setup.Add "In beiden F�llen kann anschlie�end die aktuelle Version archiviert und ver�ffentlicht, sowie die Aktualisierung der Liste der g�ltigen Dokumente durchgef�hrt werden." & vbNewLine & vbNewLine & "[Abbrechen] um Versionsstand nicht zu �ndern", "initiate.confirmCancel"
        'prompt to set version manually
        setup.Add "Version", "manualVersioning.versionTitle"
        setup.Add "Neuen Versionsstand angeben oder Abbrechen um Version beizubehalten", "manualVersioning.versionPrompt"
        setup.Add "Ver�ffentlichungsdatum", "manualVersioning.releasedateTitle"
        setup.Add "Neues Einf�hrungsdatum angeben oder Abbrechen um Datum beizubehalten", "manualVersioning.releasedatePrompt"
        'prompt to archive current version without code
        setup.Add "Kopie mit Versionsnummer ohne code im Archiv speichern?", "archive.confirmPrompt"
        setup.Add "gespeichert. Im Archiv befindet sich die Datei ohne code. Dadurch wird der Inhalt nicht f�lschlicherweise automatisch aktualisiert.", "archive.successPrompt"
        'prompt to publish document ad pdf-file
        setup.Add "Dokument als PDF Ver�ffentlichen? (Dateiendung wird automatisch angepasst!)", "publish.confirmPrompt"
        setup.Add "Dokument ver�ffentlicht als", "publish.successPrompt"
        'prompt and structure to update list of documents in force
        setup.Add "Excel-Liste der g�ltigen Dokumente zur Aktualisierung des Versionsstandes w�hlen", "updateList.autoUpdatePrompt"
        setup.Add "Automatische Aktualisierung nicht m�glich!", "updateList.autoUpdateErrorTitle"
        setup.Add "Die Liste der g�ltigen Dokumente wurde nicht ausgew�hlt!" & vbNewLine & "Nochmal versuchen oder abbrechen?" & vbNewLine & "(im zweiten Fall bitte manuell aktualisieren)", "updateList.autoUpdateErrorPrompt"
        setup.Add "B", "updateList.documentTitle"
        setup.Add "C", "updateList.documentVersion"
        setup.Add "D", "updateList.documentPages"
        setup.Add "E", "updateList.documentHyperlink"
        setup.Add "", "updateList.documentPDFHyperlink"
        'the variable "updateList.documentPDFHyperlink" can be customized to update the list of documents _
        in case you want this to be. since i recommend docm-files to be handled as working files _
        and editing/publishing might take place on different dates, or you consider to store the pdfs _
        temporarily on a different location e.g. to make them editable in advance to publishing _
        this option is set empty by default in published version. as soon you set the value to the _
        desired column the link will be written to the list of documents in force if a published pdf file is saved
End Function