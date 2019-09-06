// i found my colleagues to be quite stubborn and ignoring every informative email i wrote as well as the faq-section.
// this was my attempt to present knowledge about the functions bit by bit, randomly, at startup.
// it absolutely makes sense to extent the information for any given module as this extends the faq

const style = ['background: #4c566a', 'padding: 10px 0px', 'line-height: 35px',].join(';');
const main= [style, 'color: #eceff4'].join(';');
const heart=[style,	'color: #bf616a'].join(';');
const link=[style,	'color: #a3be8c'].join(';');
if (!isIE()) console.log('%c      coded with %c♥️ %cby error on line 1 - %c http://erroronline.one      ', main, heart, main, link);
else console.log('coded with ♥️ by error on line 1 - http://erroronline.one');
var developerAlert='Welcome to the console output of the ' + core.function.lang('title') + '!\n'
					+ 'Please be aware that displaying the console results in a significant decrease of speed.\n';
console.warn(developerAlert);

var randomTip = {
	show: function () {
		// 	show random tip on startup
		return '<span style="float:right" onclick="el(\'randomTip\').innerHTML=randomTip.show()">' + core.function.insert.icon('refresh') + '</span>' +
			'<br /><span class="highlight">' + this.list[0][core.var.selectedLanguage] + ':</span>' +
			'<br />' + this.list[Math.floor(Math.random() * (this.list.length - 1) + 1)][core.var.selectedLanguage] +
			'';
	},
	enlist: function(){
		var rtrn='';
		Object.keys(this.list).forEach(function(key){
			rtrn += randomTip.list[key][core.var.selectedLanguage]+'<br /><br />';
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
			en: 'If you don\'t like the color, you can change the theme within the settings',
			de: 'Falls dir die Farbe nicht gefällt kannst du ein anderes Theme bei den Einstellungen auswählen.'
		},
		{
			en: 'In case you have difficulties reading, customize the font- and display-size.',
			de: 'Wenn du Schwierigkeiten hat etwas zu erkennen, stelle in den Einstellungen die Schrift- und Darstellungsgröße ein.'
		},
		{
			en: 'You can set up the menu bar to be always small to have more space for the content in case you have a bad screen resolution ',
			de: 'Bei niedriger Auflösung kannst du das Menü dauerhaft bei den Einstellungen auf schmal einstellen, damit mehr Platz für die Inhalte ist.'
		},
		{
			en: 'Enabling fuzzy search can help you finding the desired content in case of typos. Set up the sensitivity in the advanced settings.',
			de: 'Wenn du dich gelegentlich vertippst kann dich Fuzzy-Search unterstützen trotzdem zum Ziel zu gelangen. Die Empfindlichkeit kann bei den erweiterten Einstellungen angepasst werden.'
		},
		{
			en: 'Search for different keywords, results with the most matches appear at the top.',
			de: 'Suche nach mehreren Begriffen, Ergebnisse mit den meisten Übereinstimmungen stehen ganz oben.'
		},
		{
			en: 'Filter your search results by preceding a -, like &quot;find everything -but&quot;.',
			de: 'Du kannst bei deiner Suche filtern wenn du ein - voranstellst, wie in &quot;finde alles -außer&quot;.'
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
			en: 'Save the application to your browsers favourite-bar, as a shortcut to the desktop or to the startup-folder to have quick access to the qm-system at any time.',
			de: 'Speichere die Seite in der Favoriten-Leiste deines Browsers oder als Verknüpfung auf dem Desktop oder im Autostart-Ordner um jederzeit schnellen Zugriff auf das QM-System zu haben..'
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
			en:'Some browsers are slower than others (looking at you Edge!). If the global search or modules do not load properly add a little delay in the advanced settings.',
			de:'Manche Browser sind langsamer als andere (fühle dich angesprochen Edge!). Wenn die globale Suche oder die Module nicht richtig laden gib ihnen bei den erweiterten Einstellungen etwas mehr Zeit.'
		},
		//	module specific tips
		{
			en: 'Remember pointing our errors to the inventory control via email.',
			de: 'Vergiss nicht dem Einkauf per eMail bescheid zu sagen, falls dir Fehler auffallen.'
		},
		{
			en: 'Search and access module content right from the entry page. In accordance to the computers speed the time to deliver results can be set.',
			de: 'Suche und nutze die Inhalte direkt von der Startseite aus. Je nach Geschwindigkeit des Computers kann die Zeit für die Bereitstellung der Ergebnisse eingestellt werden.'
		},

	],
};

var aboutNotification = {
	en: 'This application is part of a supportive system for quality management. It is a universal interface and can be modular extended.<br /><br />The complete system of application and depended documents can be used under GNU GENERAL PUBLIC LICENSE Version 3. The sourcecode with templates is available under <a href="https://github.com/erroronline1/qualitymanagement/" target="_blank">https://github.com/erroronline1/qualitymanagement/</a><br />&copy; 2019, <a href="http://erroronline.one" target="_blank">error on line 1</a>',
	de: 'Diese Anwendung ist Bestandteil eines Systems zur Unterstützung eines Qualitätsmanagement-Systems. Es dient als universelle Schnittstelle und kann modular erweitert werden.<br /><br />Das Gesamtsystem aus Anwendung und anhängigen Dokumenten ist unter der GNU GENERAL PUBLIC LICENSE Version 3 verwendbar. Quelltexte und Templates sind erhältlich unter <a href="https://github.com/erroronline1/qualitymanagement/" target="_blank">https://github.com/erroronline1/qualitymanagement/</a><br />&copy; 2019, <a href="http://erroronline.one" target="_blank">error on line 1</a>'
};

// in case of major updates something might happen to malfunction. this module keeps track of changes and informs every user about new
// features.

var updateTracker = {
	enlist: function () {
		//	listing all update hints in reverse order
		var tracker = '';
		for (var i = this.list.length - 1; i > -1; i--) {
			tracker += '<span class="highlight">' + this.list[i][0] + ':</span> ' + this.list[i][1] + '<br /><hr /><br />';
		}
		return'Update Tracker:<br /><br />' + tracker;
	},
	latestMajorUpdate: function () {
		for (var i = updateTracker.list.length - 1; i > -1; i--) {
			if (this.list[i][0] === 'Major') return i;
		}
	},
	alert: function () {
		//	display latest update hint on startup as long as it is not disabled
		if (core.function.setting.get('settingStarthinweis' + this.latestMajorUpdate()) === false) {
			text = this.list[this.latestMajorUpdate()][1] + '<br /><br />' +
				core.function.insert.checkbox(core.function.lang('settingNotificationSelector'), 'sstarthinweis', (core.function.setting.get('settingStarthinweis' + this.latestMajorUpdate()) !== 1), 'onchange="core.function.setting.set(\'settingStarthinweis' + this.latestMajorUpdate() + '\',1)"') +
				'<br /><small>' + core.function.lang('settingNotificationHint') + '</small>';
			core.function.popup(text);
		}
	},
	list: [
		//	list of updates in ascending order. this is considered not to be critical in terms of language so feel free to fill this list in you main oder native language
		['Minor', '15.06.2019: Enjoy!'],
		['Major', '16.06.2019: Welcome to the assistant. As the responsible person you can delete this message and later add your own announcements or update hints.'],
		['Major', '16.08.2019: Welcome to the assistant. This is the next version. Search less, find more...'],
		['Major', '06.09.2019: Welcome to the assistant. This is the next version with clear and tidy separation between algorithms and customized data.'],
	],
};