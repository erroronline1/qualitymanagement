//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching document-files in a static database
//
//  dependencies:	data/documentlookup_int.js,
//					data/documentlookup_ext.js,
//					documents.xlsm,
//					external_dokuments.xlsm
//
//////////////////////////////////////////////////////////////

var module={
	var:{
		packages:['data/documentlookup_int.js','data/documentlookup_ext.js'],
		thirdDocumentCategoryPath:'E:/Quality Management/TTD',
		lang:{
			optionSecondType:{
				en:'external documents',
				de:'externe Dokumente'},
			optionThirdType:{
				en:'record documents',
				de:'Nachweisdokumente'},
			internalPlaceholder:{
				en:'internal documents',
				de:'interne Dokumente FB, VA, AA'},
			externalPlaceholder:{
				en:'external documents',
				de:'externe Dokumente'},
			favouriteCaption:{
				en:'last used documents',
				de:'zuletzt genutzte Dokumente'},
			favouriteDeleteTitle:{
				en:'delete favourites until next request',
				de:'alle Favoriten bis zum nächsten Aufruf löschen'},
			favouriteDefaultTitle:{
				en:'default values',
				de:'Standardwerte'},
			favouriteRestoreTitle:{
				en:'restore personal favourites',
				de:'eigene Liste wiederherstellen'},
			favouriteSaveTitle:{
				en:'save personal favourites',
				de:'eigene Liste speichern'},
			favouriteRestoreConfirm:{
				en:'please reload module',
				de:'Modul bitte neu laden...'},
			favouriteSaveConfirm:{
				en:'recent favourites saved.',
				de:'neue Favoritenliste gespeichert.'},
			errorNothingFound:{
				en:function(query){return 'Search for '+ (core.function.setting.get('external')?'external':'internal') +' document searched by <span class="highlight">'+query+'</span> returned no results. Check spelling '+(core.function.setting.get('settingFuzzySearch')?'':'or fuzzy-search-setting ')+', look for parts of query, '+ (core.function.setting.get('external')?'internal':'external') +' or record documents.  Please adhere to mimimum 3 character length.'},
				de:function(query){return 'Es konnte kein '+ (core.function.setting.get('external')?'extern':'intern') +' geführtes Dokument mit dem Begriff <span class="highlight">'+query+'</span> gefunden werden. Bitte eventuell Schreibweise '+(core.function.setting.get('settingFuzzySearch')?'':'oder Fuzzy-Search-Einstellung ')+'überprüfen, nach Wortteilen, '+ (core.function.setting.get('external')?'internen':'externen') +' oder Nachweisdokumenten suchen. Bitte auch eine Mindestzeichenlänge von 3 Buchstaben bei der Suche beachten.'},
			},
		}
	},
	function:{
		documentlookup:function(){
			core.function.loadScript(module.var.packages[(core.function.setting.get('external')||0)],'module.function.search');
			el('input').innerHTML=
				'<form id="search" action="javascript:module.function.search();">'
				+'<span onclick="module.function.search()">'+core.function.icon.insert('search')+'</span>'+'<input type="text" pattern=".{3,}" required id="documentname" placeholder="'+(core.function.setting.get('external')?core.function.lang('externalPlaceholder'):core.function.lang('internalPlaceholder'))+'" />'
				+core.function.insert.checkbox(core.function.lang('optionSecondType'), 'external', (core.function.setting.get('external') || 0), 'onchange="core.function.setting.reversedswitch(\'external\'); el(\'documentname\').placeholder=core.function.setting.get(\'external\')?\''+core.function.lang('externalPlaceholder')+'\':\''+core.function.lang('internalPlaceholder')+'\'; core.function.loadScript(module.var.packages[(core.function.setting.get(\'external\')||0)],\'module.function.search\');"')
				+'<input type="submit" id="submit" value="'+core.function.lang('formSubmit')+'" hidden="hidden" /> '
				+'<a style="float:right" href="'+module.var.thirdDocumentCategoryPath+'">'+core.function.lang('optionThirdType')+'</a>'
				+'</form>';
			el('temp').innerHTML=el('output').innerHTML='';
		},
		linkfile:function(url){
			// bad filename or dynamic url
			if (typeof(url)==='object'){return '<a href="' + url[0] + '" target="_blank">' + url[1] + '</a><br />';}
			// url with quality filename
			else return '<a href="' + url + '" onclick="module.function.favouriteHandler.set(\''+module.function.favouriteHandler.prepare(url)+'\'); return;" target="_blank">'	+ url.substring(url.lastIndexOf('/'), url.lastIndexOf('.')).substring(1) + '</a><br />';
		},
		favouriteHandler:{
			prepare:function(value){
				return value.substring(value.lastIndexOf('/'), value.lastIndexOf('.')).substring(1).replace(/[^a-z0-9]/gi,'');
			},
			set:function(value){
				var output=core.function.setting.get('favouritedocs');
				if (output){
					if (output.indexOf(value)>-1){
						var tfav=output.split(','), favourites=new Array();
						//create two dimensional array and add sighting if neccessary
						for (var i=0; i<tfav.length; i+=2){
							favourites.push(new Array(tfav[i], parseInt(tfav[i+1])+(tfav[i]==value?1:0)));
						}
						favourites.sort(core.function.sortBySecondColumn);
						//reduce two dimensional array after sorting
						for (i=0; i<favourites.length; i++){
							favourites[i]=favourites[i].join(',');
						}
						//reduce to flat
						output=favourites.join(',');
					}
					else output+=','+value+',1';
				}
				else output=value+',1';
				core.function.setting.set('favouritedocs', output);
			},
			get:function(){
				var output=core.function.setting.get('favouritedocs');
				if (output){
					var tfav=tfav2=new Array();
					//assign link to index as favourite handler
					Object.keys(docs.docs).forEach(function(key){
						tfav[module.function.favouriteHandler.prepare(docs.docs[key])]=module.function.linkfile(docs.docs[key]);
					});
		
					var tfav2=output.split(','); 
					//sef defaul document titles without whitespaces, predefined clicks for hiher postion 
					var defaults='Protocol,10,'
					+'AttendanceList,5,';
					
					output='<br />'+core.function.lang('favouriteCaption')+':<span style="display:inline-block; vertical-align:middle; float:right;">'
					+' <span class="button" title="'+core.function.lang('favouriteDeleteTitle')+'" onclick="module.function.favouriteHandler.reset(\'\')">'+core.function.icon.insert('delete')+'</span>'
					+' <span class="button" title="'+core.function.lang('favouriteDefaultTitle')+'" onclick="module.function.favouriteHandler.reset(\''+defaults+'\')">'+core.function.icon.insert('clipboard')+'</span>'
					+' <span class="button" title="'+core.function.lang('favouriteRestoreTitle')+'" onclick="module.function.favouriteHandler.reset(\''+core.function.setting.get('customfavouritedocs')+'\')">'+core.function.icon.insert('refresh')+'</span>'
					+' <span class="button" title="'+core.function.lang('favouriteSaveTitle')+'" onclick="module.function.favouriteHandler.customreset()">'+core.function.icon.insert('save')+'</span>'
					+'</span><br /><br />';
					for (var i=0; i<tfav2.length; i+=2){
						if (tfav[tfav2[i]]!=undefined) output+=tfav[tfav2[i]];
					}
				}
				return output||'';
			},
			reset:function(output){
				core.function.setting.set('favouritedocs', output);
				alert(core.function.lang('favouriteRestoreConfirm'));
			},
			customreset:function(){
				core.function.setting.set('customfavouritedocs', core.function.setting.get('favouritedocs'));
				alert(core.function.lang('favouriteSaveConfirm'));
			}
		},
		search:function(){
			var list='';
			if (typeof(docs)!='undefined'){
				//list all items for overview
				Object.keys(docs.docs).forEach(function(key){
					list+=module.function.linkfile(docs.docs[key]);
				});
				el('temp').innerHTML=list;
		
				if (el('documentname').value!=''){
					var found=core.function.smartSearch.lookup(el('documentname').value, docs.docs, true);
		
					// check if search matches item-list and display result
					if (found.length>0) {
						list='';
						core.function.smartSearch.relevance.init();
						found.forEach(function(value){
							list+=core.function.smartSearch.relevance.nextstep(value[1]);
							list+=module.function.linkfile(docs.docs[value[0]]);
						});
						el('output').innerHTML=list; list='';
					}
					else el('output').innerHTML=core.function.lang('errorNothingFound', el('documentname').value);
				}
				else el('output').innerHTML=module.function.favouriteHandler.get()||'';
			}
		}
	}
}

var disableOutputSelect=true;
module.function.documentlookup();