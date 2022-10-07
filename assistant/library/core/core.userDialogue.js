// i found my colleagues to be quite stubborn and ignoring every informative email i wrote as well as the faq-section.
// this was my attempt to present knowledge about the functions bit by bit, randomly, at startup.
// it absolutely makes sense to extent the information for any given module as this extends the faq

const style = ['background: #4c566a', 'padding: 10px 0px', 'line-height: 35px', ].join(';');
const main = [style, 'color: #eceff4'].join(';');
const heart = [style, 'color: #bf616a'].join(';');
const link = [style, 'color: #a3be8c'].join(';');
console.log('%c      coded with %c♥️ %cby error on line 1 - %c http://erroronline.one      ', main, heart, main, link);
let developerAlert = 'Welcome to the console output of the ' + core.fn.static.lang('title') + '!\n' +
	'Please be aware that displaying the console might result in a significant decrease of speed.';
console.warn(developerAlert);

let randomTip = {
	show: function () {
		// 	show random tip on startup
		return '<span style="float:right" onclick="core.fn.async.stdout(\'randomTip\', randomTip.show());">' + core.fn.static.insert.icon('refresh') + '</span>' +
			'<br /><span class="highlight">' + this.list[0][core.var.selectedLanguage] + ':</span>' +
			'<br />' + this.list[Math.floor(Math.random() * (this.list.length - 1) + 1)][core.var.selectedLanguage] +
			'';
	},
	enlist: function () {
		let rtrn = '';
		Object.keys(this.list).forEach((key) => {
			rtrn += randomTip.list[key][core.var.selectedLanguage] + '<br /><br />';
		});
		return rtrn;
	},
	list: [
		//	list of tips according to registered langages, first item is the caption of the tip
		{
			en: 'Tip',
			de: 'Tipp'
		},
		//	general functionality tips			
		{
			en: 'If you don\'t like the color, you can change the theme within the settings.',
			de: 'Falls dir die Farbe nicht gefällt kannst du ein anderes Theme bei den Einstellungen auswählen.'
		},
		{
			en: 'In case you have difficulties reading, customize the font- and display-size.',
			de: 'Wenn du Schwierigkeiten hat etwas zu erkennen, stelle in den Einstellungen die Schrift- und Darstellungsgröße ein.'
		},
		{
			en: 'You can set up the menu bar to be smaller to have more space for the content in case you have a bad screen resolution.',
			de: 'Bei niedriger Auflösung kannst du das Menü schmal einstellen, damit mehr Platz für die Inhalte ist.'
		},
		{
			en: 'Enabling fuzzy search can help you finding the desired content in case of typos. Set up the sensitivity in the advanced settings.',
			de: 'Wenn du dich gelegentlich vertippst kann dich die Tippfehler-Toleranz unterstützen trotzdem zum Ziel zu gelangen. Die Empfindlichkeit kann bei den erweiterten Einstellungen angepasst werden.'
		},
		{
			en: 'Search for different keywords, results with the most matches appear at the top.',
			de: 'Suche nach mehreren Begriffen, Ergebnisse mit den meisten Übereinstimmungen stehen ganz oben.'
		},
		{
			en: 'Filter your search results by preceding a -, like &quot;find everything -but&quot;. If at least one term is preceded by a + only results with all terms will be shown.',
			de: 'Du kannst bei deiner Suche filtern wenn du ein - voranstellst, wie in &quot;finde alles -außer&quot;. Wenn einem Begriff ein + voransteht werden nur Ergebnisse angezeigt, die alle Begriffe beinhalten.'
		},
		{
			en: 'Search terms with less than three characters will be dropped as a precaution, unless you embed these in quotes. This may lead to a larger result, thus making sense with applied filters only.',
			de: 'Suchbegriffe von weniger als drei Zeichen werden vorsichtshalber herausgefiltert, es sei denn du stellst sie in Anführungsstriche. Da kann dann aber auch zu einer größeren Ergebnismenge führen, ergibt also nur mit Filtern wirklich Sinn.'
		},
		{
			en: 'Your last search- and filter-settings are stored. Sometimes that makes it faster, sometimes there seem to be too little results. Watch out for that.',
			de: 'Deine letzten Such- und Filtereinstellungen werden automatisch gespeichert. Manchmal macht es das schneller, manchmal wird überraschend wenig angezeigt. Achte mal darauf.'
		},
		{
			en: 'To avoid the need of adjusting the font type of copied content, you can have it opened within a new window.',
			de: 'Um beim Kopieren von Inhalten die Schriftart nicht anpassen zu müssen, kannst du den Text auch in einem neuen Fenster ausgeben lassen.'
		},
		{
			en: 'You can always look up the list of notifications from the settings.',
			de: 'Du kannst jederzeit die Liste der Update-Hinweise bei den Einstellungen einsehen.'
		},
		{
			en: 'If you find the menu to be overcrowded, you can disable unused modules.',
			de: 'Wenn Dir das Menü zu voll ist kannst du Module bei den Einstellungen deaktivieren.'
		},
		{
			en: 'Some settings take effect immediately, others need a restart of the application.',
			de: 'Manche Einstellungen haben sofort einen Effekt, andere erfordern den Neustart der Oberfläche.'
		},
		{
			en: 'There is two-language-support by default. The application as well as text-blocks can be displayed and generated in different languages.',
			de: 'Standardmäßig sind mehrere Sprachen implementiert. Sowohl die Oberfläche als auch Textblöcke können mehrsprachig dargestellt werden.'
		},
		{
			en: 'Generated text may be pasted to the email occasionally. It depends on the browser implementation. The texts length can be customized in the advanced settings.',
			de: 'Generierter Text wird unter Umständen direkt in die eMail eingefügt. Das hängt vom Browserimplementierung ab. Die Länge des Textes kann bei den erweiterten Einstellungen angepasst werden. '
		},
		{
			en: 'Some functions need environment specific settings. The used environment can be set in the advanced settings.',
			de: 'Manche Funktionen benötigen umgebungsspezifische Einstellungen. Die genutze Betriebsumgebung kann bei den erweiterten Einstellungen gewählt werden.'
		},
		{
			en: 'In case you are entitled to a password for some parts of the assistant you can cipher it from the settings menu and let yourself be registered in the data rights management list by mail.',
			de: 'Wenn du die Berechtigung für ein Zugangskennwort für manche Bereiche des Assistenten hast kannst du dieses bei den Einstellungen chiffrieren und per eMail in die Berechtigungsliste eintragen lassen.'
		},
		//	(module-) specific tips
		{
			en: 'Remember pointing our errors to the inventory control via email.',
			de: 'Vergiss nicht dem Einkauf per eMail bescheid zu sagen, falls dir Fehler auffallen.'
		},
		{
			en: 'Search and access module content right from the entry page.',
			de: 'Suche und nutze die Inhalte direkt von der Startseite aus.'
		},
		{
			en: 'Favourite entries can be deleted as a whole and individual. The latter can be achieved by hovering about two seconds above the link.',
			de: 'Favoriten können gleichzeitig und einzeln gelöscht werden. Letzteres kann erreicht werden indem du mit dem Mauszeiger ungefähr zwei Sekunden über dem Link bleibst.'
		},
		{
			en: 'Edge 94 is known to download files instead of opening them with the systems default application. This could be true for other browsers and lead to a weird behavior and cluttered storage.',
			de: 'Von Edge 94 ist bekannt, dass Dateien heruntergeladen, statt mit der Standard-Anwendung geöffnet zu werden. Das könnte auch auf andere Browser zutreffen und zu einem seltsamen Verhalten und einem überfüllten Speicherplatz führen.'
		}
	],
};

const aboutNotification = {
	en: '<pre style="float:left; font-family:monospace; margin:0 1em 1em 0; line-height:1.2em;">     m\n    / \\\n   |...|\n   |...|\n   |___|\n   / | \\</pre>This application is part of the &quot;bottle light quality management software&quot;. It is a universal interface and can be modular extended.<br /><br />The complete system of application and depended documents can be used under GNU GENERAL PUBLIC LICENSE Version 3. The sourcecode with templates is available under <a href="https://github.com/erroronline1/qualitymanagement/" target="_blank">https://github.com/erroronline1/qualitymanagement/</a><br />&copy; 2020-2022, <a href="http://erroronline.one" target="_blank">error on line 1</a>',
	de: '<pre style="float:left; font-family:monospace; margin:0 1em 1em 0; line-height:1.2em;">     m\n    / \\\n   |...|\n   |...|\n   |___|\n   / | \\</pre>Diese Anwendung ist Bestandteil der &quot;bottle light quality management software&quot;. Sie dient als universelle Schnittstelle und kann modular erweitert werden.<br /><br />Das Gesamtsystem aus Anwendung und anhängigen Dokumenten ist unter der GNU GENERAL PUBLIC LICENSE Version 3 verwendbar. Quelltexte und Templates sind erhältlich unter <a href="https://github.com/erroronline1/qualitymanagement/" target="_blank">https://github.com/erroronline1/qualitymanagement/</a><br />&copy; 2020-2022, <a href="http://erroronline.one" target="_blank">error on line 1</a>'
};

// in case of major updates something might happen to malfunction. this module keeps track of changes and informs every user about new features.

let updateTracker = {
	enlist: () => {
		//	listing all update hints in reverse order
		let tracker = '';
		for (let i = updateTracker.list.length - 1; i > -1; i--) {
			if (updateTracker.list[i][0].length) tracker += '<span class="highlight">' + updateTracker.list[i][0] + ':</span> ' + updateTracker.list[i][1] + '<br /><hr /><br />';
		}
		return 'Update Tracker:<br /><br />' + tracker;
	},
	latestMajorUpdate: () => {
		for (let i = updateTracker.list.length - 1; i > -1; i--) {
			if (updateTracker.list[i][0] === 'Major') return i;
		}
	},
	alert: async () => {
		//	display latest update hint on startup as long as it is not disabled
		let latestNotif = 'coreNotificationHide' + updateTracker.latestMajorUpdate(),
			module = {};
		module[latestNotif] = await core.fn.async.memory.read(latestNotif);
		if (module[latestNotif] === false && updateTracker.list[updateTracker.list.length - 1][0].length) {
			text = updateTracker.list[updateTracker.latestMajorUpdate()][1] + '<br /><br />' +
				core.fn.static.insert.checkbox(core.fn.static.lang('settingNotificationSelector'), latestNotif, 0, 'onchange="this.checked ? core.fn.async.memory.write(\'' + latestNotif + '\', 1) : core.fn.async.memory.delete(\'' + latestNotif + '\')"', core.fn.static.lang('settingRestartNeccessary')) +
				'<br /><small>' + core.fn.static.lang('settingNotificationHint') + '</small>';
			core.fn.static.popup(text);
		}
		return true;
	},
	list: [
		//	list of updates in ascending order. this is considered not to be critical in terms of language so feel free to fill this list in you main oder native language
		['Minor', '15.06.2019: Enjoy!'],
		['Major', '16.06.2019: Welcome to the assistant. As the responsible person you can delete this message and later add your own announcements or update hints.'],
		['Major', '16.08.2019: Welcome to the assistant. This is the next version. Search less, find more...'],
		['Major', '06.09.2019: Welcome to the assistant. This is the next version with clear and tidy separation between algorithms and customized data.'],
		['Major', '19.06.2020: Welcome to the assistant. As from today it is possible to handle permissions to modules or functions.'],
		['Minor', '24.08.2021: Implemented an efficient compression for data storage. If you came back, something unpredictable might have happened and you should reset the application.'],
		['Major', '16.10.2021: Refactored to ECMAScript6+'],
		//['',''], // adding an empty set disables the popup of the latestMajorUpdate(). get a bit annoying after a while without updates
	],
};