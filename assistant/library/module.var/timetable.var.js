if (typeof timetable === 'undefined') var timetable = {};

timetable.var = {
	lang: {
		formInputPlaceholder: {
			en: 'name and surname',
			de: 'Vor- und Nachname'
		},
		explanation: {
			en: 'The typed name will be converted to a link to the time table. There is no validation!<br /><br />Enter &quot;Jane Doe&quot; for a sample file.',
			de: 'Der eingegebene Name wird in einen Link zur Arbeitszeittabelle umgewandelt. Es findet jedoch keine unmittelbare Prüfung auf Korrektheit statt!<br /><br />Versuche &quot;Max Mustermann&quot; als Beispiel.'
		},
		legalReminder:{
			en: 'The access for employees is permitted to the own tables only due to privacy. Opening a foreign timetable is forbidden and allowed to supervisors only!<br /><br /><span class="highlight">By opening the file you confirm your ownership.</span><br /><br />',
			de: 'Im Sinne des Datenschutzes ist der Zugriff für Mitarbeiter nur auf die eigene Tabelle erlaubt. Das Öffnen einer fremden Arbeitszeiterfassung ist nicht zulässig und ausschließlich Bereichsleitern gestattet!<br /><br /><span class="highlight">Durch das Öffnen der Datei bestätigst du, dass es sich um deine eigene Erfassung handelt.</span><br /><br />'
		},
		favouriteCaption: {
			en: 'quick access',
			de: 'Schnellzugriff'
		},
		favouriteDeleteTitle: {
			en: 'delete quick acess',
			de: 'Schnellzugriff löschen'
		},
		favouriteResetConfirm: {
			en: 'reload module...',
			de: 'Modul bitte neu Laden...'
		}, 
		linkTitle: {
			en: 'timetable for ',
			de: 'Tabelle für '
		},
		apiFound:{
			en: ' for ',
			de: ' für '
		},
	},
	searchTerms:{
		en: ['timetable','timesheet'],
		de: ['Arbeitszeittabelle','Arbeitszeitblatt']
	},
	path:'../timetables/',
	disableOutputSelect: true,
};