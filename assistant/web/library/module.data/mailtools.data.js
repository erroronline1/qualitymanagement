mailtools.data = {
	notavailableResponse: {
		en: function (dates) {
			return 'I am not available from ' +
				mailtools.var.lang.notavailableMonth.en(Number(dates.from[1])) + ' ' +
				mailtools.var.lang.notavailableDay.en(dates.from[0]) + ' ' + dates.from[2] + ' to ' +
				mailtools.var.lang.notavailableMonth.en(Number(dates.to[1])) + ' ' +
				mailtools.var.lang.notavailableDay.en(dates.to[0]) + ' ' + dates.to[2] + '. ' +
				'In urgent cases please contact our office by mail (email@company.tld) ' +
				'or phone (+49 1234 567 890).<br /><br />';
		},
		de: function (dates) {
			return 'In der Zeit vom ' +
				mailtools.var.lang.notavailableDay.de(dates.from[0]) + '. ' +
				mailtools.var.lang.notavailableMonth.de(Number(dates.from[1])) + ' ' + dates.from[2] + ' bis ' +
				mailtools.var.lang.notavailableDay.de(dates.to[0]) + '. ' +
				mailtools.var.lang.notavailableMonth.de(Number(dates.to[1])) + ' ' + dates.to[2] + ' bin ich nicht im Hause. ' +
				'In dringenden Fällen wenden Sie sich bitte an unsere Verwaltung per eMail (email@company.tld) ' +
				'oder telefonisch (+49 (1) 234 567 890).<br /><br />';
		}
	},
	signature: {
		en: function (form) {
			var commonstyle = 'line-height:115%;font-family:"Calibri","sans-serif";color:#004A6F;font-size:10pt;';
			return '<div>' +
				'<span style=\'' + commonstyle + '\'>Sincerely</span></p>' +
				'<table border=0 cellspacing=0 cellpadding=0 align=left style=\'border:0 !important\'>' +
				' <tr>' +
				'  <td width=102 valign=top style=\'width:76.5pt;padding:0;border:0 !important\'>' +
				'  <p style=\'white-space:nowrap;' + commonstyle + '\'>' +
				'  LOGO' +
				'  <br>' +
				'  COMPANY NAME<br>' +
				'  CUSTOMIZE TO<br></span>' +
				'  <span style=\'font-weight:bold;\'>YOUR NEEDS</span>' +
				'  </p>' +
				'  </td>' +
				'  <td valign=top style=\'padding:0;border:0 !important\'>' +
				'  <p style=\'' + commonstyle + '\'><br>' +
				'  <span style=\'font-size:14.0pt;\'>' + (!form && el('name') ? el('name').value : '<input type="text" placeholder="Name" id="name" title="Name" />') + '</span>' +
				'  <br>' +
				'  ' + (!form && el('funktion') ? el('funktion').value : '<input type="text" placeholder="Position" id="funktion" title="Position" />') +
				' | Department<br><br>' +
				'  Company | Address<br>' +
				'  Tel. <a href="tel:+49 1234 56789">+49 1234 56789</a> | Fax. +49 1234 56789 | eMail: ' + (!form && el('email') ? '<a' +
					'  href="mailto:' + el('email').value + '@email.tld">' + el('email').value : '<input type="text" placeholder="eMail" id="email" title="eMail" />') + '@email.tld</a><br>' +
				'  <a href="http://www.website.tld">http://www.website.tld</a> </p>' +
				'  </td>' +
				' </tr>' +
				'</table>' +
				'</div>';
		},
		de: function (form) {
			var commonstyle = 'line-height:115%;font-family:"Calibri","sans-serif";color:#004A6F;font-size:10pt;';
			return '<div>' +
				'<span style=\'' + commonstyle + '\'>Mit freundlichen Grüßen</span></p>' +
				'<table border=0 cellspacing=0 cellpadding=0 align=left style=\'border:0 !important\'>' +
				' <tr>' +
				'  <td width=102 valign=top style=\'width:76.5pt;padding:0;border:0 !important\'>' +
				'  <p style=\'white-space:nowrap;' + commonstyle + '\'>' +
				'  FIRMENNAME' +
				'  <br>' +
				'  ENTSPRECHEND<br>' +
				'  <span style=\'font-weight:bold;\'>ANPASSEN</span>' +
				'  </p>' +
				'  </td>' +
				'  <td valign=top style=\'padding:0;border:0 !important\'>' +
				'  <p style=\'' + commonstyle + '\'><br>' +
				'  <span style=\'font-size:14.0pt;\'>' + (!form && el('name') ? el('name').value : '<input type="text" placeholder="Name" id="name" title="Name" />') + '</span>' +
				'  <br>' +
				'  ' + (!form && el('funktion') ? el('funktion').value : '<input type="text" placeholder="Funktion" id="funktion" title="Funktion" />') +
				' Abteilung<br><br>' +
				'  Firma | Adresse<br>' +
				'  Tel. <a href="tel:+49 1234 56789">+49 1234 56789</a> | Fax. +49 1234 56789 | eMail: ' + (!form && el('email') ? '<a' +
					'  href="mailto:' + el('email').value + '@email.tld">' + el('email').value : '<input type="text" placeholder="eMail" id="email" title="eMail" />') + '@email.tld</a><br>' +
				'  <a href="http://www.website.tld">http://www.website.tld</a> </p>' +
				'  </td>' +
				' </tr>' +
				'</table>' +
				'</div>';
		}
	}
};