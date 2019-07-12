//////////////////////////////////////////////////////////////
//  by error on line 1 (erroronline.one)
//
//  module for searching the frequently asked questions
//
//  dependencies:	data/faq.js
//
//////////////////////////////////////////////////////////////

var module = {
	var: {
		lang: {
			formInputPlaceholder: {
				en: 'search help (3 characters minimum)',
				de: 'Hilfe durchsuchen (mindestens 3 Zeichen)'
			},
			tableOfContents: {
				en: 'Contents',
				de: 'Themen'
			},
		}
	},
	function: {
		help: function () {
			core.function.loadScript('data/help.js', 'module.function.search');
			el('input').innerHTML =
				'<form id="search" action="javascript:module.function.search();">' +
				'<span onclick="module.function.search()">' + core.function.icon.insert('search') + '</span>' +
				'<input type="text" pattern=".{3,}" required placeholder="' + core.function.lang('formInputPlaceholder') + '" id="faq" />' +
				'<input type="submit" id="artikelsuche" value="' + core.function.lang('formSubmit') + '" hidden="hidden" /> ' +
				'</form>';
			el('temp').innerHTML = el('output').innerHTML = " ";
		},
		search: function () {
			if (typeof (faq) != 'undefined') {
				var list = '';
				Object.keys(faq.faq).forEach(function (key) {
					if (faq.faq[key][0]) list += '<a style="cursor:pointer" onclick="el(\'faq\').value=\'' + faq.faq[key][0] + '\'; el(\'search\').submit();">' + faq.faq[key][0] + '</a><br />';
					else list += '<br />';
				});
				el('temp').innerHTML = '<span class="highlight">' + core.function.lang('tableOfContents') + ':</span><br />' + list;

				if (el('faq').value != '') {
					var found = core.function.smartSearch.lookup(el('faq').value, faq.faq, true);

					// check if search matches item-list
					if (found.length > 0) {
						list = '';
						core.function.smartSearch.relevance.init();
						found.forEach(function (value) {
							list += core.function.smartSearch.relevance.nextstep(value[1]);
							var tresult = '<div class="items items70" onclick="core.function.toggleHeight(this)">' + core.function.insert.expand() +
								'<span class="highlight">' + faq.faq[value[0]][0] + ':</span> ' + faq.faq[value[0]][1];

							list += tresult +
								'</div>';
						});
					} else list = core.function.lang('errorNothingFound', el('faq').value);
					el('output').innerHTML = list;
				}
			}
		},
	}
}

var disableOutputSelect = true;
module.function.help();