﻿//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for creating a list of mailto-links to retrieve
// 	semi-personalized emails with the same content but
//  different salutation and recipients address, creating signatures
//  and not-available-messages
//
//  dependencies:	none
//
// in this case you will have to customize the modules directly
//
//////////////////////////////////////////////////////////////

var module={
	var:{
		lang:{
			selectSubmodule:{
				en:'Please select Submodule',
				de:'Bitte Funktion wählen'},
			errorMatchingRows:{
				en:'The numbers of names and email-adresses doesn\'t match.',
				de:'Die Anzahl der Namen und der eMailadressen stimmt nicht überein!'},
			buttonTestCaption:{
				en:'sample entries',
				de:'Testeinträge'},
			buttonTestTitle:{
				en:'tests with samples',
				de:'testet mit Standardwerten'},
			sampleNameValue:{
				en:'Mrs. Doe\nMr. Doe',
				de:'Frau Musterfrau\nHerr Mustermann'},
			sampleMailValue:{
				en:'jane.doe@email.adr\njohn.doe@email.adr',
				de:'monika.musterfrau@email.adr\nmax.mustermann@email.adr'},
			sampleSubjectValue:{
				en:'Mail subject',
				de:'Betreff der eMail'},
			sampleBodyValue:{
				en:'This is a test mail.\n\nHave fun reading.',
				de:'Die ist eine Test-Mail\n\nViel Spaß beim Lesen.'},
			formRecipientListCaption:{
				en:'Recipient list',
				de:'Empfängerliste'},
			formRecipientListPlaceholder:{
				en:'names, 1 per row',
				de:'Namen, 1 pro Zeile'},
			formRecipientMailPlaceholder:{
				en:'adresses, 1 per row',
				de:'Adressen, 1 pro Zeile'},
			formContentCaption:{
				en:'Content',
				de:'Inhalt'},
			formSubjectPlaceholder:{
				en:'Subject',
				de:'Betreff'},
			formBodyPlaceholder:{
				en:'Text without salutation',
				de:'Text ohne Anrede'},
			outputMailTo:{
				en:'mail to',
				de:'eMail an'},
			outputSalutation:{
				en:function(val){return 'Dear';},
				de:function(val){
					var greeting='Sehr geehrte';
					if (val.search('Herr')<2 && val.search('Herr')>-1) greeting+="r";
					return greeting;
				}
			},
			errorMatchingRows:{
				en:'The numbers of names and email-adresses doesn\'t match.',
				de:'Die Anzahl der Namen und der eMailadressen stimmt nicht überein!'},
			buttonTestCaption:{
				en:'sample entries',
				de:'Testeinträge'},
			buttonTestTitle:{
				en:'tests with samples',
				de:'testet mit Standardwerten'},
			sampleNameValue:{
				en:'Mrs. Doe\nMr. Doe',
				de:'Frau Musterfrau\nHerr Mustermann'},
			sampleMailValue:{
				en:'jane.doe@email.adr\njohn.doe@email.adr',
				de:'monika.musterfrau@email.adr\nmax.mustermann@email.adr'},
			sampleSubjectValue:{
				en:'Mail subject',
				de:'Betreff der eMail'},
			sampleBodyValue:{
				en:'This is a test mail.\n\nHave fun reading.',
				de:'Die ist eine Test-Mail\n\nViel Spaß beim Lesen.'},
			formRecipientListCaption:{
				en:'Recipient list',
				de:'Empfängerliste'},
			formRecipientListPlaceholder:{
				en:'names, 1 per row',
				de:'Namen, 1 pro Zeile'},
			formRecipientMailPlaceholder:{
				en:'adresses, 1 per row',
				de:'Adressen, 1 pro Zeile'},
			formContentCaption:{
				en:'Content',
				de:'Inhalt'},
			formSubjectPlaceholder:{
				en:'Subject',
				de:'Betreff'},
			formBodyPlaceholder:{
				en:'Text without salutation',
				de:'Text ohne Anrede'},
			outputMailTo:{
				en:'mail to',
				de:'eMail an'},
			outputSalutation:{
				en:function(val){return 'Dear';},
				de:function(val){
					var greeting='Sehr geehrte';
					if (val.search('Herr')<2 && val.search('Herr')>-1) greeting+="r";
					return greeting;
				}
			},
			notavailableFrom:{
				en:'not available from',
				de:'Nicht erreibar vom'
			},
			notavailableTo:{
				en:'until',
				de:'bis'
			},
			notavailableDay:{
				en:function(day){
					if (day == '11' || day == '12' || day =='13') return day+'th';
					else if (day.substring(1)=='1') return day+'st';
					else if (day.substring(1)=='2') return day+'nd';
					else if (day.substring(1)=='3') return day+'rd';
					else return day+'th';
				},
				de:function(day){return day;}
			},
			notavailableMonth:{
				en:function(month){
					var m=new Array('', 'January', 'February', 'March', ' April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
					return m[month];
				},
				de:function(month){
					var m=new Array('', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember');
					return m[month];
				}
			},
			notavailableResponse:{
				en:function(dates){
					return 'I am not available from '
						+module.var.lang.notavailableMonth.en(Number(dates.from[1]))+' '
						+module.var.lang.notavailableDay.en(dates.from[0])+' '+dates.from[2]+' to '
						+module.var.lang.notavailableMonth.en(Number(dates.to[1]))+' '
						+module.var.lang.notavailableDay.en(dates.to[0])+' '+dates.to[2]+'. '
						+'In urgent cases please contact our office by mail (email@adress.tld) '
						+'or phone (+49 1234 56789).<br /><br />';
				},
				de:function(dates){
					return 'In der Zeit vom '
						+module.var.lang.notavailableDay.de(dates.from[0])+'. '
						+module.var.lang.notavailableMonth.de(Number(dates.from[1]))+' '+dates.from[2]+' bis '
						+module.var.lang.notavailableDay.de(dates.to[0])+'. '
						+module.var.lang.notavailableMonth.de(Number(dates.to[1]))+' '+dates.to[2]+' bin ich nicht im Hause. '
						+'In dringenden Fällen wenden Sie sich bitte an unsere Verwaltung per eMail (email@adress.tld) '
						+'oder telefonisch (+49 (0) 1234 56789).<br /><br />';
				}
			}
		},
		submodules:{
			serialmail:{    en:'Serialmail',
							de:'Serienmail'},
			signature:{     en:'Signature Composer',
							de:'Signaturgenerator'},
			notavailable:{	en:'Not Available Message',
							de:'Abwesenheitsnotiz'},
		},
	},
	function:{
		serialmailinput: function (){
			el('mailtoolgen').innerHTML='<input type="button" onclick="module.function.serialmailgen()" value="'+core.function.lang('buttonGenCaption')+'" title="'+core.function.lang('buttonGenTitle')+'" />';
			el('temp').innerHTML='<input type="button" value="'+core.function.lang('buttonTestCaption')+'" title="'+core.function.lang('buttonTestTitle')+'" onclick="module.function.serialtest()" /><br /><br />'
			+core.function.lang('formRecipientListCaption')+':<br /><textarea id="names" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="'+core.function.lang('formRecipientListPlaceholder')+'"></textarea> '
			+'<textarea id="adresses" rows="10" style="width:calc(49% - .5em);" wrap="soft" placeholder="'+core.function.lang('formRecipientMailPlaceholder')+'"></textarea><br />'
			+core.function.lang('formContentCaption')+':<br /><input type="text" style="width:98%" id="subject" placeholder="'+core.function.lang('formSubjectPlaceholder')+'"><br />'
			+'<textarea id="body" rows="10" style="width:98%;" placeholder="'+core.function.lang('formBodyPlaceholder')+'"></textarea>'; 
			el('output').innerHTML='';
		},
		serialtest: function(){
			el('names').value=core.function.lang('sampleNameValue');
			el('adresses').value=core.function.lang('sampleMailValue');
			el('subject').value=core.function.lang('sampleSubjectValue');
			el('body').value=core.function.lang('sampleBodyValue');
		},
		serialmailgen: function (){
			if (!el('names').value || !el('adresses').value || !el('body').value || !el('subject').value) core.function.popup(core.function.lang('errorNoContent'));
			else {
				var names=el('names').value.split(/\n/g),
					adresses=el('adresses').value.split(/\s/g);
				if (names.length != adresses.length) core.function.popup(core.function.lang('errorMatchingRows'));
				else {
					var output='';
					for (var i=0; i<names.length; i++){
						output+='<a href="mailto:'+adresses[i]+'?subject='+el('subject').value+'&body='+core.function.lang('outputSalutation')(names[i])+'%20'+encodeURI(names[i])+',%0A%0A'+encodeURI(el('body').value)+'">'+core.function.lang('outputMailTo')+' '+names[i]+' &lt;'+adresses[i]+'&gt;</a><br />';
					}
					disableOutputSelect=true;
					el('output').innerHTML=output;
				}
			}
		},
		signatureinput:function(){
			el('mailtoolgen').innerHTML='<input type="button" onclick="module.function.signaturegen[core.function.languageSynthesis.outputLanguage()]()" value="'+core.function.lang('buttonGenCaption')+'" title="'+core.function.lang('buttonGenTitle')+'" />';
			el('temp').innerHTML=module.function.signaturegen[core.function.languageSynthesis.outputLanguage()](1)
				+'<br /><br />'
				+core.function.languageSelection('onchange="module.function.signaturegen[core.function.languageSynthesis.outputLanguage()]()"').join('<br />')
				+(core.var.outlookWebUrl?'<br /><a href="'+core.var.outlookWebUrl+'" target="_blank">'+core.function.icon.insert('outlook')+core.function.lang('openOutlook')+'</a>':'');
			el('output').innerHTML='';
			disableOutputSelect=false;
		},
		signaturegen:{
			en:function(form){				var commonstyle='line-height:115%;font-family:"Calibri","sans-serif";color:#004A6F;font-size:10pt;';
			var html = '<div>'+
				'<span style=\''+commonstyle+'\'>Sincerely</span></p>'+
				'<table border=0 cellspacing=0 cellpadding=0 align=left style=\'border:0 !important\'>'+
				' <tr>'+
				'  <td width=102 valign=top style=\'width:76.5pt;padding:0;border:0 !important\'>'+
				'  <p style=\'white-space:nowrap;'+commonstyle+'\'>'+
				'  LOGO'+
				'  <br>'+
				'  COMPANY NAME<br>'+
				'  CUSTOMIZE TO<br></span>'+
				'  <span style=\'font-weight:bold;\'>YOUR NEEDS</span>'+
				'  </p>'+
				'  </td>'+
				'  <td valign=top style=\'padding:0;border:0 !important\'>'+
				'  <p style=\''+commonstyle+'\'><br>'+
				'  <span style=\'font-size:14.0pt;\'>'+(!form &&el('name')?el('name').value:'<input type="text" placeholder="Name" id="name" title="Name" />')+'</span>'+
				'  <br>'+
				'  '+(!form &&el('funktion')?el('funktion').value:'<input type="text" placeholder="Position" id="funktion" title="Position" />')
				+' | Department<br><br>'+
				'  Company | Adsress<br>'+
				'  Tel. +49 6221 562 6414 | Fax. +49 6221 562 6419 | eMail: '+(!form &&el('email')?'<a'+
				'  href="mailto:'+el('email').value+'@email.tld">'+el('email').value:'<input type="text" placeholder="eMail" id="email" title="eMail" />')+'@email.tld</a><br>'+
				'  <a href="http://www.website.tld">http://www.website.tld</a> </p>'+
				'  </td>'+
				' </tr>'+
				'</table>'+
				'</div>';
			if (!form && (!el('name').value || !el('funktion').value || !el('email').value)) core.function.popup(core.function.lang('errorNoContent'));
			else {
				if (!form) { el('output').innerHTML=html; }
				else return html;
			}
},
			de:function(form){
				var commonstyle='line-height:115%;font-family:"Calibri","sans-serif";color:#004A6F;font-size:10pt;';
				var html = '<div>'+
					'<span style=\''+commonstyle+'\'>Mit freundlichen Grüßen</span></p>'+
					'<table border=0 cellspacing=0 cellpadding=0 align=left style=\'border:0 !important\'>'+
					' <tr>'+
					'  <td width=102 valign=top style=\'width:76.5pt;padding:0;border:0 !important\'>'+
					'  <p style=\'white-space:nowrap;'+commonstyle+'\'>'+
					'  FIRMENNAME'+
					'  <br>'+
					'  ENTSPRECHEND<br>'+
					'  <span style=\'font-weight:bold;\'>ANPASSEN</span>'+
					'  </p>'+
					'  </td>'+
					'  <td valign=top style=\'padding:0;border:0 !important\'>'+
					'  <p style=\''+commonstyle+'\'><br>'+
					'  <span style=\'font-size:14.0pt;\'>'+(!form &&el('name')?el('name').value:'<input type="text" placeholder="Name" id="name" title="Name" />')+'</span>'+
					'  <br>'+
					'  '+(!form &&el('funktion')?el('funktion').value:'<input type="text" placeholder="Funktion" id="funktion" title="Funktion" />')
					+' Abteilung<br><br>'+
					'  Firma | Adresse<br>'+
					'  Tel. +49 1234 56789 | Fax. +49 1234 56789 | eMail: '+(!form &&el('email')?'<a'+
					'  href="mailto:'+el('email').value+'@email.tld">'+el('email').value:'<input type="text" placeholder="eMail" id="email" title="eMail" />')+'@email.tld</a><br>'+
					'  <a href="http://www.website.tld">http://www.website.tld</a> </p>'+
					'  </td>'+
					' </tr>'+
					'</table>'+
					'</div>';
				if (!form && (!el('name').value || !el('funktion').value || !el('email').value)) core.function.popup(core.function.lang('errorNoContent'));
				else {
					if (!form) { el('output').innerHTML=html; }
					else return html;
				}
			}
		},
		notavailableinput:function(){
			el('mailtoolgen').innerHTML='<input type="button" onclick="module.function.notavailablegen()" value="'+core.function.lang('buttonGenCaption')+'" title="'+core.function.lang('buttonGenTitle')+'" />';
			el('temp').innerHTML=core.function.lang('notavailableFrom')+': <input type="date" id="notfrom" placeholder="DD.MM.YYYY" /><br />'
								+core.function.lang('notavailableTo')+': <input type="date" id="notto" placeholder="DD.MM.YYYY" />';
			el('output').innerHTML='';
		},
		notavailablegen:function(){
			//gets date inputs and sorts them to dd.mm.yyyy
			from=el('notfrom').value.split(/\D/g);
			if (from[0].length>2) from=new Array(from[2],from[1],from[0]);
			to=el('notto').value.split(/\D/g);
			if (to[0].length>2) to=new Array(to[2],to[1],to[0]);
			var dates={from:from,to:to};

			disableOutputSelect=false;

			el('output').innerHTML=module.var.lang.notavailableResponse['de'](dates) 
									+module.var.lang.notavailableResponse['en'](dates);
		},		
		mailtools:function(){
			var options=new Object();
			options['null']=['', core.function.lang('selectSubmodule')];
			Object.keys(module.var.submodules).forEach(function(key){
				options[key]=[key, module.var.submodules[key][core.var.selectedLanguage]];
			});
			el('input').innerHTML=core.function.insert.select(options,'mailtoolsselection', 'mailtoolsselection', null, 'onchange="module.function[this.options[this.selectedIndex].value+\'input\']()"')
			+'<span id="mailtoolgen" style="float:right"></span>';
			el('temp').innerHTML=el('output').innerHTML='';
		},
		
				
	}
}

var disableOutputSelect=true;
module.function.mailtools();