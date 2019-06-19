//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for checking if a item exists in stock
//
//  dependencies:	data/stocklist.js
//					artikelmanager.xlsm
//
//////////////////////////////////////////////////////////////

var module={
	var:{
		inventoryControl:'inventory.control@email.adr',
		lang:{
			inputPlaceholder:{
				en:'item, 3 characters minimum',
				de:'Artikel (mindestens 3 Zeichen)'},
			useCaseDescription:{
				en:function(){return (module.function.search()?'There are currently '+module.function.search()+' items listed. ':'')
				+'These are the products that have permission to be ordered and used in production. Look for sample entries from &quot;Manufacturer&quot; and mess around with keywords.';},
				de:function(){return (module.function.search()?'Aktuell hat die Artikelliste '+module.function.search()+' Einträge. ':'')
				+'An dieser Stelle könne alle zugelassenen Artikel eingesehen werden. Suche nach Standardeinträgen von &quot;Manufacturer&quot; und spiel mit Suchbegriffen.';}},
			filterAll:{
				en:'all items',
				de:'alle Artikel'},
			filterReadymade:{
				en:'ready-made aids only',
				de:'nur Konfektionsartikel'},
			filterNoReadymade:{
				en:'all but ready-made aids',
				de:'keine Konfektionsartikel'},
			filterStock:{
				en:'in stock only',
				de:'nur Lagerartikel'},
			helpChangeItemCaption:{
				en:'change',
				de:'ändern'},
			helpChangeItemTitle:{
				en:'request change at inventory control',
				de:'Änderung beim Einkauf beantragen'},
			helpChangeItemPopup:{
				en:'please specify\\ne.g \\\'item name spelled wrong\\\'',
				de:'Bitte Änderung erläutern\\nz.B. \\\'Artikelname falsch\\\''},
			helpChangeItemSubject:{
				en:'Change item in stock list',
				de:'Artikel im Artikelstamm ändern'},
			helpDeleteItemCaption:{
				en:'delete',
				de:'löschen'},
			helpDeleteItemTitle:{
				en:'request deletion at intentory control',
				de:'Löschung beim Einkauf beantragen'},
			helpDeleteItemPopup:{
				en:'Please specify\\ne.g. \\\'no longer available\\\'',
				de:'Bitte Löschung erläutern\\nz.B. \\\'Aus dem Programm genommen\\\''},
			helpDeleteItemSubject:{
				en:'Delete item from stock list',
				de:'Artikel aus dem Artikelstamm löschen'},
		},
	},
	function:{
		translate:{
			filter:function(){
				//id:[select value, select text, filter for smartsearch]
				return {
					all:['all', core.function.lang('filterAll'), 'true'],
					conf:['conf', core.function.lang('filterReadymade'), 'stocklistdata.content[key][6]==\'ja\''],
					nconf:['nconf', core.function.lang('filterNoReadymade'), 'stocklistdata.content[key][6]==\'nein\''],
					store:['store', core.function.lang('filterStock'), 'stocklistdata.content[key][7]!=\'nein\''],
				};
			},
			returnselect:function(){
				var output=new Object();
				Object.keys(module.function.translate.filter()).forEach(function(key){
				output[key]=[module.function.translate.filter()[key][0],module.function.translate.filter()[key][1]];
				});
				return output;
			},
		},
		search:function(){
			var list='';
			if (typeof(stocklistdata)!='undefined'){
				if (el('itemname').value!=''){
					var found=core.function.smartSearch.lookup(el('itemname').value, stocklistdata.content, module.function.translate.filter()[el('stockfilter').options[el('stockfilter').selectedIndex].value][2]);
					// check if search matches item-list
					if (found.length>0) {
						core.function.smartSearch.relevance.init();
						found.forEach(function(value){
							list+=core.function.smartSearch.relevance.nextstep(value[1]);
							var tresult='<div class="items items70" onclick="core.function.toggleHeight(this)">'+core.function.insert.expand(), mailbody='';
							for (var h=0; h<stocklistdata.content[0].length;h++){
								tresult+='<p><span class="highlight">'+stocklistdata.content[0][h]+':</span> '+stocklistdata.content[value[0]][h]+'</p>';
								mailbody+=stocklistdata.content[0][h]+': '+stocklistdata.content[value[0]][h]+"\n";
							}
							list+=tresult
							+'<a title="'+core.function.lang('helpChangeItemTitle')+'" onclick="return confirm(\''+core.function.lang('helpChangeItemPopup')+'\');" href="mailto:'+module.var.inventoryControl+'?subject='+core.function.escapeHTML(core.function.lang('helpChangeItemSubject'))+'&body='+core.function.escapeHTML(mailbody)+'">'+core.function.lang('helpChangeItemCaption')+'</a> '
							+'<a title="'+core.function.lang('helpDeleteItemTitle')+'" onclick="return confirm(\''+core.function.lang('helpDeleteItemPopup')+'\');" href="mailto:'+module.var.inventoryControl+'?subject='+core.function.escapeHTML(core.function.lang('helpDeleteItemSubject'))+'&body='+core.function.escapeHTML(mailbody)+'">'+core.function.lang('helpDeleteItemCaption')+'</a>'
							+'</div>';
						});
					}
					else list=core.function.lang('errorNothingFound', el('itemname').value);
					el('output').innerHTML=list; list='';
				}
				else {
					return stocklistdata.content.length-1;
				}
			}
		},
		stocklist:function (){
			core.function.loadScript('data/stocklist.js','module.function.search');
			el('input').innerHTML=
				'<form id="search" action="javascript:module.function.search();">'
				+'<span onclick="el(\'search\').submit()">'+core.function.icon.insert('search')+'</span>'
				+'<input type="text" pattern=".{3,}" required placeholder="'+core.function.lang('inputPlaceholder')+'" id="itemname" />'
				+core.function.insert.select(module.function.translate.returnselect(),'stockfilter','stockfilter',(core.function.cookie.get('stockfilter') || 'all'),'onchange="core.function.cookie.set(\'stockfilter\',el(\'stockfilter\').options[el(\'stockfilter\').selectedIndex].value,3600*24*365); module.function.search();"')
				+'<input type="submit" id="submit" value="'+core.function.lang('formSubmit')+'" hidden="hidden" /> '
				+'<span style="float:right;"><input type="button" id="searchname" value="'+core.function.lang('webSearch')+'" onclick="window.open(\'https://www.google.de/#q=\'+el(\'itemname\').value,\'_blank\');" title="'+core.function.lang('webSearchTitle')+'" /></span>';
				+'</form>'
			el('output').innerHTML=el('temp').innerHTML='';
			el('temp').innerHTML=core.function.lang('useCaseDescription');
		},
						
	}
}

var disableOutputSelect=true;
module.function.stocklist();