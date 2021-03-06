function el(v) {
	return document.getElementById(v);
}

function isIE() {
	return !!document.documentMode;
}

function value(v) { //handles even unset parameters when in doubt
	if (typeof v === 'undefined') return '';
	else return v;
}

var svgClassList = { //classList.add and *.remove not supported for svg in ie, this works as a polyfill
	add: function (element, classname) {
		if (element.classList) element.classList.add(classname);
		else if (element.getAttribute('class').indexOf(classname) < 0) element.setAttribute('class', element.getAttribute('class') + ' ' + classname);
	},
	remove: function (element, classname) {
		if (element.classList) element.classList.remove(classname);
		else if (element.getAttribute('class').indexOf(classname) > -1) element.setAttribute('class', element.getAttribute('class').replace(classname, ' '));
	},
};

if (typeof core === 'undefined') var core = {};

core.fn = {
	maxMailSize: function () {
		if (confirm(core.fn.lang('settingMailSizeDeterminationHint'))) {
			for (var i = core.fn.setting.get('settingDirectMailSize'); i > 256; i--) {
				var good = 1,
					num = '';
				for (var j = 0; j < i; j++) num += 'a';
				try {
					location.href = 'mailto:thisIsSupposedToBeACasuallyLongTest@eMail.address?body=' + num
				} catch (e) {
					good = 0;
				}
				if (good == 1) {
					break;
				}
			}
		}
		return;
	},
	dynamicMailto: function (address, subject, body) {
		body = value(body);
		if (core.fn.escapeHTML(body, true).length > core.var.directMailSize) body = core.fn.lang('errorMailSizeExport');
		var mail, content = 'mailto:' + value(address) + '?' + (value(subject).length ? 'subject=' + core.fn.escapeHTML(value(subject), true) : '') + (value(subject).length && body.length ? '&' : '') + (body.length ? 'body=' + core.fn.escapeHTML(body, true) : '');

		if (!core.fn.setting.get('settingMailtoMethod')) { //i told you this might switch in future
			//this elegant way works with windows 10
			mail = document.createElement('a');
			mail.href = content;
			mail.click();
		} else {
			//this legacy way works with windows 7 but may leave a window/tab
			mail = window.open(content, 'emailWindow');
			if (mail && mail.open && !mail.closed) mail.close();
		}
		return;
	},
	linkSelector: function (content, window){
	},
	mailtoLimit: function (body) {
		var bodysize = core.fn.escapeHTML(body, true).length;
		el('mailtoLimit').style.width = Math.min(bodysize / core.var.directMailSize, 1) * 100 + "%";
		if (bodysize > core.var.directMailSize) {
			el('mailtoLimit').classList.remove('green', 'orange');
			el('mailtoLimit').classList.add('red');
		} else if (bodysize > core.var.directMailSize * .8) {
			el('mailtoLimit').classList.remove('green', 'red');
			el('mailtoLimit').classList.add('orange');
		} else {
			el('mailtoLimit').classList.remove('orange', 'red');
			el('mailtoLimit').classList.add('green');
		}
	},
	escapeHTML: function (text, br2nl) { //primary use for escaping special chars for mailto
		if (br2nl !== "undefined" || br2nl) text = text.replace(/<br \/>|<br>/g, "\n");
		return encodeURIComponent(text);
	},

	stdout: function (where, what) { //handles output, thus is suitable for unit-testing and debugging.
		//can set array of where to same what, strings are converted to array automatically, 'console' is reserved
		if (typeof where === 'string') where = [where];
		where.forEach(function (w) {
			if (core.fn.setting.get('settingOutputMonitor') || w === 'console') {
				var group = w + ' from ' + core.var.currentScope;
				console.groupCollapsed(group);
				if (isIE()) console.log(what.match(/.{1,1024}/g));
				else console.log(what);
				console.groupEnd(group);
			}
			if (w !== 'console') document.getElementById(w).innerHTML = what;
		});
	},
	popup: function (text) { //toggle notification popup
		otext = '<span style="display:block; width:100%; text-align:right;">' + core.fn.insert.icon('closepopup', 'bigger', false, 'title="' + core.fn.lang('popupCloseButton') + '" onclick="core.fn.popup()"') + '</span>' + text;
		if (el('popup').style.opacity == '1' && typeof text === 'undefined') {
			el('popup').style.opacity = '0';
			el('popuptext').style.right = '-100vw';
			setTimeout(function () {
				el('popup').style.display = 'none';
				core.fn.stdout('popuptext', otext);
			}, 100);
		} else {
			core.fn.stdout('popuptext', otext);
			el('popup').style.display = 'block';
			el('popup').style.opacity = '1';
			setTimeout(function () {
				el('popuptext').style.right = '0vw';
			}, 100);
		}
	},
	growlNotif: function (text) { // short popups for status information
		if (typeof text !== 'undefined') {
			el('growlNotif').innerHTML = text;
			el('growlNotif').classList.add('growlNotifshow');
			window.setTimeout(core.fn.growlNotif, core.fn.setting.get('settinggrowlNotifInterval') * 1000 || 2000);
		}
		else el('growlNotif').classList.remove('growlNotifshow');
	},
	toggleHeight: function (toggleel) { //toggle height from divs having .items-class
		var notoggle = new Array('label', 'input', 'select', 'textarea', 'a');
		if (toggleel.classList.contains('items') && (toggleel.querySelectorAll(':hover').length == 0 || notoggle.indexOf(toggleel.querySelectorAll(':hover')[0].nodeName.toLowerCase()) < 0))
			toggleel.classList.toggle('expand');
		if (isIE()) toggleel.scrollTop = 0;
		else toggleel.scroll({
			top: 0,
			behavior: 'smooth'
		});
		//override for anchor node in ie11 is not recognized because of reasons
	},

	sortBySecondColumn: function (a, b) { //for two-dimensional arrays
		if (a[1] === b[1]) {
			return 0;
		} else {
			return (a[1] < b[1]) ? 1 : -1;
		}
	},

	smartSearch: {
		lookup: function (userInput, dataBaseObject, additionalCondition) {
			// returns an array of indices of the databaseObject based on matches of the user-input sorted by relevance/number of matches of more than one search keyword
			// user input will be sanitized of special chars whitespaces and chunks of less than three characters
			// as the additional condition might be evaluated during runtime it has to be an executed expression and being handed over as a boolean or string
			//
			// data base will be searched for single words as well as a concatenated string

			var sanitizeRegEx = /[^a-zA-Z0-9äÄöÖüÜß\+\-\s]/g,
				sanitizeRegExWOControl = /[^a-zA-Z0-9äÄöÖüÜß]/g,
				fuzzyOverride = /\?|\*/g, //pseudo-wildcards activate fuzzy search, mostly resulting in more relevant results
				quoted = /[\-\+]{0,1}\"(.+?)\"/g; //adding relevance to otherwise whitespace separated terms with particular order 
			var	query = new Array(),
				filter = new Array(),
				found = new Array(),
				mandatory = false,
				processedUserInput=userInput,
				quoted_queries=[];
				initial_query=[];

			// initiate query terms array, starting with sanitized quoted terms
			quoted_queries = userInput.toLowerCase().match(quoted);
			if (quoted_queries) {
				for (var i = 0; i < quoted_queries.length; i++){ // sanitize
					initial_query.push(quoted_queries[i].replace(sanitizeRegEx, '').replace(/\s/g, ''));
				}
			}
			// assign remaining single terms to query array splitting by whitespace, stripping all but allowed characters including preceding whitespace
			// if term longer than 2 characters
			processedUserInput.replace(quoted, '').toLowerCase().replace(sanitizeRegEx, '').split(/[\s]/g).forEach(function(term){
				if (term.length > 2) initial_query.push(term);
			});
			//sort -terms to filter, +terms to mandatory
			//splicing the query array directly instantaneously influences the foreach
			initial_query.forEach(function (word) {
				if (word.substring(0, 1) == '-') filter.push(word.substring(1));
				else if (word.substring(0, 1) == '+') {
					mandatory = true;
					query.push(word.substring(1));
				}
				else query.push(word);
			});
			//add concatenated query of terms without filtered
			if (query.length > 1 && query.join('').length > 2) query.push(userInput.replace(filter, '').toLowerCase().replace(sanitizeRegExWOControl, ''));

			function fuzzy(haystack, needle, fuzzy, ratio) {
				if (haystack.indexOf(needle) > -1) return 2; // covers basic partial matches, avoids unnecessary nested loops
				if (!fuzzy) return false; // breaks if fuzzySearch is not set
				//yield through every character position of haystack
				for (var sp = 0; sp <= haystack.length - needle.length; sp++) {
					// haystack
					// haysta
					//  aystac
					//   ystack
					var matches = 0;
					//yield trough every character position of needle
					for (var i = 0; i < needle.length; i++) {
						// haysta
						// n
						//  e
						//   e
						//    d
						//     l
						//      e
						var charPos = haystack.substring(sp, sp + needle.length).indexOf(needle[i]);
						if (haystack.substring(sp, sp + needle.length)[i] === needle[i]) { //current character of needle matches exact position in haystack-block
							matches += 2;
						} else if (charPos > -1) { //current character of needle does not match position but can be found
							matches += 1;
						} else matches; //current character of needle can not be found in haystack block
						//break if ratio can not reached any longer
						if (((matches / (i + 1)) + ratio) / 2 < ratio) break;
					}
					if (matches / needle.length >= ratio) return matches / needle.length;
				}
				return false;
			};

			if (query.length > 0) {
				//reminder: keep these kind of assignments out of loops for performance reasons!
				var fuzzySearch = core.fn.setting.get('settingFuzzySearch') || Boolean(userInput.match(fuzzyOverride));
				var fuzzyRatio = 2 - ((core.fn.setting.get('settingFuzzyThreshold') || 5) * .1); //fuzzy ratio of 1.5 by default is quite reasonable determined through trial and error

				Object.keys(dataBaseObject).forEach(function (key) {
					var haystack = dataBaseObject[key],
						filtered = false;
					if (typeof (haystack) === 'object') haystack = haystack.join();
					//filter filename in case of pdf-files else take raw string
					haystack = haystack.replace(/\S+\/.+\/(.+)\.pdf/g, "$1");
					//strip all remaining special chars
					haystack = haystack.toLowerCase().replace(sanitizeRegEx, '').replace(/\s/g, '');
					for (var i = 0; i < filter.length; i++) {
						if (haystack.indexOf(filter[i]) > -1) {
							filtered = true;
							break;
						}
					}

					if (!filtered) {
						//compare every query part between whitespaces 
						query.forEach(function (needle) {
							var fuzzyquery = fuzzy(haystack, needle, fuzzySearch, fuzzyRatio);
							if (typeof (haystack) === 'string' && fuzzyquery && eval(additionalCondition)) {
								var exist;
								found.forEach(function (value, index) {
									if (value[0] === key) exist = index;
								});
								if (exist != undefined) found[exist][1] += fuzzyquery;
								else found.push(new Array(key, fuzzyquery));
							}
						});
					}
				});
			}
			found = found.sort(core.fn.sortBySecondColumn) || 0
			
			// deletes all results that have not the highest ranking if mandatory-flag is set, aka if only all query terms apply
			if (mandatory && found){
				for (var i = found.length - 1; i > 0 ; i--){
					if (found[i][1] < found[0][1]) found.splice(i,1);
				}					
			}
			
			return found;
		},
		relevance: {
			//used to make intersections between relevance levels
			init: function () {
				this.initiated = 0;
			},
			nextstep: function (value) {
				if (this.initiated === 0) this.initiated = value;
				if (this.initiated > value) var out = '<hr />';
				this.initiated = value;
				return out || '';
			}
		}
	},
	lang: function (block, module, args) { // returns module language bricks first
		try {
			if (typeof eval(module).var.lang[block][core.var.selectedLanguage] === "function") return eval(module).var.lang[block][core.var.selectedLanguage](args);
		} catch (e) {}
		try {
			if (typeof core.var.lang[block][core.var.selectedLanguage] === "function") return core.var.lang[block][core.var.selectedLanguage](args);
		} catch (e) {}
		try {
			return eval(module).var.lang[block][core.var.selectedLanguage]
		} catch (e) {}
		try {
			return core.var.lang[block][core.var.selectedLanguage];
		} catch (e) {}
		console.log('error: ' + block);
		return undefined;
	},
	languageSelection: function (event) { //returns an array of radio inputs based on registered langages
		var sel = new Array();
		Object.keys(core.var.registeredLanguages).forEach(function (key) {
			sel.push(core.fn.insert.radio(core.var.registeredLanguages[key][1], 'lang', core.var.registeredLanguages[key][0], core.var.registeredLanguages[key][0] === core.var.selectedLanguage, event));
		});
		return sel;
	},
	loadScript: function (url, callback) { //load given script-files into scope, e.g. load desired modules and data-files
		if (url != '') {
			if (typeof (callback) !== 'undefined') core.performance.start(callback);

			// create new script node
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;
			// evaluate callback function on load event
			if (typeof (callback) !== 'undefined') {

				// add module-vars to head in case of module call
				var scriptname = url.match(/\/(.*?)\./).pop();
				if (scriptname in core.var.modules) {
					var scriptvar = document.createElement('script');
					scriptvar.type = 'text/javascript';
					scriptvar.src = core.var.moduleVarDir + scriptname + '.var.js';
				}

				var skip = false;
				script.onload = function () { //not ie
					eval(callback);
					skip = true;
				};
				if (!skip) script.onreadystatechange = function () { //ie
					if (this.readyState === 'complete') {
						eval(callback);
					}
				};
				//set current scope(==module name), window title and load module.var-file
				if (callback.indexOf('init') > -1 && scriptname in core.var.modules) {
					core.var.currentScope = scriptname;
					document.title = core.fn.lang('title') + ' - ' + core.var.modules[core.var.currentScope].display[core.var.selectedLanguage];
					if (core.var.modules[core.var.currentScope].wide) el('temp').classList.add('contentWide');
					else el('temp').classList.remove('contentWide');
				}
			}
			//append node(s)
			if (typeof scriptvar !== "undefined") document.head.appendChild(scriptvar);
			setTimeout(function () {
				document.head.appendChild(script);
			}, core.fn.setting.get('settingVarPreloadTime') || 50);
		}
	},

	insert: { //handle repetitive design patterns
		checkbox: function (label, id, checked, additionalProperty, title) {
			return '<label class="custominput"' + (title ? ' title="' + title + '"' : '') + '>' + label + '<input type="checkbox" id="' + id + '" ' + (eval(checked) ? 'checked="checked" ' : '') + (additionalProperty ? additionalProperty : '') + ' /><span class="checkmark"></span></label>';
		},
		radio: function (label, name, id, checked, additionalProperty, title) {
			return '<label class="custominput"' + (title ? ' title="' + title + '"' : '') + '>' + label + '<input type="radio" name="' + name + '" id="' + id + '" ' + (eval(checked) ? 'checked="checked"' : '') + (additionalProperty ? additionalProperty : '') + ' /><span class="checkmark"></span></label>';
		},
		select: function (options, name, id, selected, additionalProperty) {
			// output has to be object with optionId:[value,label] pairs
			var output = '<select name="' + name + '" id="' + id + '" ' + (additionalProperty ? additionalProperty : '') + '>'
			if (options != null)
				Object.keys(options).forEach(function (key) {
					output += '<option value="' + options[key][0] + '" ' + (selected === key ? 'selected="selected" ' : '') + '>' + options[key][1] + '</option>';
				});
			output += '</select>';
			return output;
		},
		expand: function () {
			return '<span class="itemresize" title="' + core.fn.lang('itemResizeTitle') + '"></span>';
		},
		mailtoLimit: function (width) {
			//			if (value(width)=='') width='100%';
			return '<div id="mailtoLimitBar" style="width:' + (width || '100%') + '" title="' + core.fn.lang('mailtoLimitBar') + '"><div id="mailtoLimit"></div></div>';
		},
		icon: function (icon, addclass, id, attributes) { //easy icon handler for inline svg
			//key[viewbox,transform scale, d-path]
			const asset = {
				home: ['0 0 2048 2048', '1,-1', 'M1024 1883l941 -942l-90 -90l-83 82v-805h-640v640h-256v-640h-640v805l-83 -82l-90 90zM1664 256v805l-640 640l-640 -640v-805h384v640h512v-640h384z'],
				back: ['0 0 2048 2048', '1,-1', 'M2048 960h-1798l787 -787l-90 -90l-941 941l941 941l90 -90l-787 -787h1798v-128z'],
				forth: ['0 0 2048 2048', '1,-1', 'M2042 1024l-941 -941l-90 90l787 787h-1798v128h1798l-787 787l90 90z'],
				settings: ['0 0 2048 2048', '1,-1', 'M256 1152q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50t-10 -50t-27.5 -40.5t-40.5 -27.5t-50 -10t-50 10t-40.5 27.5t-27.5 40.5t-10 50t10 50t27.5 40.5t40.5 27.5t50 10zM1024 1152q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50t-10 -50t-27.5 -40.5t-40.5 -27.5t-50 -10t-50 10t-40.5 27.5t-27.5 40.5t-10 50t10 50t27.5 40.5t40.5 27.5t50 10zM1792 1152q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50t-10 -50t-27.5 -40.5t-40.5 -27.5t-50 -10t-50 10t-40.5 27.5t-27.5 40.5t-10 50t10 50t27.5 40.5t40.5 27.5t50 10z'],
				search: ['0 0 2048 2048', '1,-1', 'M1344 2048q97 0 187 -25t168 -71t142.5 -110.5t110.5 -142.5t71 -168t25 -187t-25 -187t-71 -168t-110.5 -142.5t-142.5 -110.5t-168 -71t-187 -25q-125 0 -239.5 42t-210.5 121l-785 -784q-19 -19 -45 -19t-45 19t-19 45t19 45l784 785q-79 96 -121 210.5t-42 239.5 q0 97 25 187t71 168t110.5 142.5t142.5 110.5t168 71t187 25zM1344 768q119 0 224 45.5t183 123.5t123.5 183t45.5 224t-45.5 224t-123.5 183t-183 123.5t-224 45.5t-224 -45.5t-183 -123.5t-123.5 -183t-45.5 -224t45.5 -224t123.5 -183t183 -123.5t224 -45.5z'],
				closepopup: ['0 0 2048 2048', '1,-1', 'M0 1664h2048v-1152h-2048v1152zM128 1536v-896h1280v896h-1280zM1920 640v896h-384v-896h384zM989 1405l317 -317l-317 -317l-90 90l162 163h-421v128h421l-162 163z'],
				info: ['0 0 2048 2048', '1,-1', 'M960 128q-133 0 -255.5 34t-229.5 96.5t-194.5 150t-150 194.5t-96.5 229.5t-34 255.5t34 255.5t96.5 229.5t150 194.5t194.5 150t229.5 96.5t255.5 34t255.5 -34t229.5 -96.5t194.5 -150t150 -194.5t96.5 -229.5t34 -255.5t-34 -255.5t-96.5 -229.5t-150 -194.5t-194.5 -150t-229.5 -96.5t-255.5 -34zM960 1920q-115 0 -221 -30t-198.5 -84t-168.5 -130t-130 -168.5t-84 -199t-30 -220.5t30 -220.5t84 -199t130 -168.5t168.5 -130t198.5 -84t221 -30q114 0 220.5 30t199 84t168.5 130t130 168.5t84 198.5t30 221q0 114 -30 220.5t-84 199t-130 168.5t-168.5 130t-199 84t-220.5 30zM896 1280h128v-640h-128v640zM896 1536h128v-128h-128v128z'],
				update: ['0 0 2048 2048', '1,-1', 'M1024 1536v-549l365 -366l-90 -90l-403 402v603h128zM1536 1408h297q-56 117 -140.5 211.5t-190 161.5t-227.5 103t-251 36q-123 0 -237.5 -32t-214 -90.5t-181.5 -140.5t-140.5 -181.5t-90.5 -214t-32 -237.5t32 -237.5t90.5 -214t140.5 -181.5t181.5 -140.5t213.5 -90.5t238 -32q150 0 289 48.5t253 135.5t197.5 207.5t123.5 265.5l123 -34q-45 -166 -140.5 -304t-226 -237.5t-289 -154.5t-330.5 -55q-141 0 -272 36.5t-245 103t-207.5 160t-160 207.5t-103 244.5t-36.5 272.5q0 141 36.5 272t103 245t160 207.5t207.5 160t244.5 103t272.5 36.5q140 0 272 -37t248.5 -105.5t212 -166.5t163.5 -221v274h128v-512h-512v128z'],
				feedbackrequest: ['0 0 2048 2048', '1,-1', 'M514 467q25 -85 63 -160q-10 -20 -20.5 -42.5t-31.5 -33.5l-173 -87q-34 -16 -69 -16h-9.5t-9.5 1l-47 -94q-8 -16 -23.5 -25.5t-33.5 -9.5q-26 0 -45 19t-19 45q0 12 7 30t16.5 37.5t19.5 36.5t15 28q-26 40 -26 87v165q0 16 7 29l576 1152l-65 32l-237 -474q-8 -16 -23.5 -25.5t-33.5 -9.5q-26 0 -45 19t-19 45q0 13 7 29l239 478q16 32 43 50.5t63 18.5q35 0 66.5 -17t61.5 -32l71 142q8 17 23.5 26t33.5 9q13 0 22 -4q12 24 23.5 47.5t26 42.5t35.5 30.5t53 11.5t61 -15l94 -47q32 -16 50.5 -42.5t18.5 -63.5q0 -34 -15.5 -63.5t-29.5 -58.5q14 -8 23 -23t9 -32q0 -12 -8.5 -32.5t-19.5 -42.5t-22 -42t-16 -31q-43 -7 -84 -18.5t-82 -26.5l82 164l-192 96l-282 -562q-5 -10 -12.5 -19t-12.5 -18q-14 -21 -26 -42.5t-23 -44.5q-21 -41 -36 -84q-4 -10 -7 -21.5t-8 -21.5l-262 -524v-150q0 -11 8 -19t19 -8l166 80zM1033 1859l87 -43l29 58l-87 43zM1344 1408q97 0 187 -25t168.5 -71t142.5 -110t110 -142.5t71 -168.5t25 -187t-25 -187t-71 -168.5t-110 -142.5t-142.5 -110t-168.5 -71t-187 -25t-187 25t-168.5 71t-142.5 110t-110 142.5t-71 168.5t-25 187t25 187t71 168.5t110 142.5t142.5 110t168.5 71t187 25zM1344 128q119 0 224 45.5t183 123.5t123.5 183t45.5 224t-45.5 224t-123.5 183t-183 123.5t-224 45.5t-224 -45.5t-183 -123.5t-123.5 -183t-45.5 -224t45.5 -224t123.5 -183t183 -123.5t224 -45.5zM1280 384h128v-128h-128v128zM1344 1152q53 0 99.5 -20t81.5 -55t55 -81.5t20 -99.5q0 -46 -14 -81t-35.5 -63t-46.5 -50.5t-46.5 -44.5t-35.5 -45t-14 -52v-48h-128v48q0 46 14 81t35.5 63t46.5 50.5t46.5 44.5t35.5 45t14 52q0 27 -10 50t-27.5 40.5t-40.5 27.5t-50 10t-50 -10t-40.5 -27.5t-27.5 -40.5t-10 -50h-128q0 53 20 99.5t55 81.5t81.5 55t99.5 20z'],
				mail: ['0 0 2048 2048', '1,-1', 'M0 1664h2048v-1280h-2048v1280zM1905 1536h-1762l881 -441zM128 512h1792v888l-896 -447l-896 447v-888z'],
				delete: ['0 0 2048 2048', '1,-1', 'M1792 1664h-128v-1472q0 -40 -15 -75t-41 -61t-61 -41t-75 -15h-1024q-40 0 -75 15t-61 41t-41 61t-15 75v1472h-128v128h512v128q0 27 10 50t27.5 40.5t40.5 27.5t50 10h384q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50v-128h512v-128zM768 1792h384v128h-384v-128z M1536 1664h-1152v-1472q0 -26 19 -45t45 -19h1024q26 0 45 19t19 45v1472zM768 384h-128v1024h128v-1024zM1024 384h-128v1024h128v-1024zM1280 384h-128v1024h128v-1024z'],
				save: ['0 0 2048 2048', '1,-1', 'M1792 1920q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50v-1664h-1563l-229 230v1434q0 27 10 50t27.5 40.5t40.5 27.5t50 10h1536zM512 1152h1024v640h-1024v-640zM1280 640h-640v-384h128v256h128v-256h384v384zM1792 1792h-128v-768h-1280v768h-128v-1381l154 -155h102 v512h896v-512h384v1536z'],
				refresh: ['0 0 2048 2048', '1,-1', 'M1297 2010q166 -45 304 -140.5t237.5 -226t154.5 -289t55 -330.5q0 -141 -36.5 -272t-103 -245t-160 -207.5t-207.5 -160t-245 -103t-272 -36.5t-272 36.5t-245 103t-207.5 160t-160 207.5t-103 244.5t-36.5 272.5q0 140 37 272t105.5 248.5t166.5 212t221 163.5h-274 v128h512v-512h-128v297q-117 -56 -211.5 -140.5t-161.5 -190t-103 -227.5t-36 -251q0 -123 32 -237.5t90.5 -214t140.5 -181.5t181.5 -140.5t213.5 -90.5t238 -32q123 0 237.5 32t214 90.5t181.5 140.5t140.5 181.5t90.5 213.5t32 238q0 150 -48.5 289t-135.5 253 t-207.5 197.5t-265.5 123.5l34 123v0z'],
				reset: ['0 0 2048 2048', '1,-1', 'M1408 1740q-29 -21 -61 -34.5t-67 -22.5v131q56 19 106.5 45.5t98.5 60.5h51v-768h-128v588zM2048 1024q0 -141 -36.5 -272t-103 -245t-160 -207.5t-207.5 -160t-245 -103t-272 -36.5t-272 36.5t-245 103t-207.5 160t-160 207.5t-103 244.5t-36.5 272.5q0 139 36.5 271t105 249t166.5 213t220 163h-272v128h512v-512h-128v298q-117 -56 -211.5 -140.5t-161.5 -190.5t-103 -228t-36 -251q0 -123 32 -237.5t90.5 -214t140.5 -181.5t181.5 -140.5t213.5 -90.5t238 -32q123 0 237.5 32t214 90.5t181.5 140.5t140.5 181.5t90.5 213.5t32 238h128z'],
				clipboard: ['0 0 2048 2048', '1,-1', 'M1792 1792v-1792h-1536v1792h512q0 53 20 99.5t55 81.5t81.5 55t99.5 20t99.5 -20t81.5 -55t55 -81.5t20 -99.5h512zM640 1536h768v128h-256v128q0 27 -10 50t-27.5 40.5t-40.5 27.5t-50 10t-50 -10t-40.5 -27.5t-27.5 -40.5t-10 -50v-128h-256v-128zM1664 1664h-128 v-256h-1024v256h-128v-1536h1280v1536zM768 1152h768v-128h-768v128zM768 768h768v-128h-768v128zM768 384h768v-128h-768v128zM512 1152h128v-128h-128v128zM512 768h128v-128h-128v128zM512 384h128v-128h-128v128z'],
				document: ['0 0 2048 2048', '1,-1', 'M1792 1499v-1499h-1664v2048h1115zM1280 1536h293l-293 293v-293zM1664 128v1280h-512v512h-896v-1792h1408z'],
				folder: ['0 0 2048 2048', '1,-1', 'M1920 1280q26 0 49.5 -10t41 -27.5t27.5 -40.5t10 -49q0 -30 -14 -58l-419 -839h-1615v1408q0 27 10 50t27.5 40.5t40.5 27.5t50 10h352q45 0 77.5 -9.5t58 -23.5t45.5 -31t40.5 -31t44 -23.5t54.5 -9.5h736q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50v-256h256zM128 591l309 618q17 33 47.5 52t67.5 19h984v256h-736q-45 0 -77.5 9.5t-58 23.5t-45.5 31t-40.5 31t-44 23.5t-54.5 9.5h-352v-1073zM1920 1152h-1368l-384 -768h1368z'],
				shelf: ['0 0 2048 2048', '1,-1', 'M2048 2048v-2048h-2048v2048h2048zM1920 1920h-640v-512h640v512zM1280 768h640v512h-640v-512zM128 1920v-1152h1024v1152h-1024zM128 128h640v512h-640v-512zM1920 128v512h-1024v-512h1024z'],
				shoppingcart: ['0 0 2048 2048', '1,-1', 'M1600 512q40 0 75 -15t61 -41t41 -61t15 -75t-15 -75t-41 -61t-61 -41t-75 -15t-75 15t-61 41t-41 61t-15 75q0 31 11 64h-534q11 -33 11 -64q0 -40 -15 -75t-41 -61t-61 -41t-75 -15t-75 15t-61 41t-41 61t-15 75q0 55 29.5 102t79.5 71l-432 1299h-189v128h281l85 -256 h1682l-298 -896h-1085l85 -256h850zM409 1536l213 -640h1035l213 640h-1461zM768 320q0 26 -19 45t-45 19t-45 -19t-19 -45t19 -45t45 -19t45 19t19 45zM1600 256q26 0 45 19t19 45t-19 45t-45 19t-45 -19t-19 -45t19 -45t45 -19z'],
				argument: ['0 0 2048 2048', '1,-1', 'M958 720q101 -40 184 -106.5t142 -152.5t91.5 -187t32.5 -210v-64h-128v64q0 119 -45.5 224t-123.5 183t-183 123.5t-224 45.5t-224 -45.5t-183 -123.5t-123.5 -183t-45.5 -224v-64h-128v64q0 109 32.5 210t91.5 187t142 152.5t184 106.5q-45 31 -81 72t-61 88.5 t-38.5 100t-13.5 107.5q0 93 35.5 174.5t96 142t142 96t174.5 35.5t174.5 -35.5t142 -96t96 -142t35.5 -174.5q0 -55 -13.5 -107.5t-38.5 -100t-61 -88.5t-81 -72zM704 768q66 0 124 25t101.5 68.5t69 102t25.5 124.5t-25.5 124t-69 101.5t-101.5 69t-124 25.5t-124.5 -25.5 t-102 -69t-68.5 -101.5t-25 -124t25 -124.5t68.5 -102t102 -68.5t124.5 -25zM2048 2048v-1024h-256l-384 -384v384h-128v128h256v-203l203 203h181v768h-1280v-230q-32 -4 -64.5 -10.5t-63.5 -17.5v386h1536z'],
				signature: ['0 0 2048 2048', '1,-1', 'M1984 256q26 0 45 -18.5t19 -45.5q0 -24 -17 -44q-30 -35 -69 -62.5t-83 -46.5t-91 -29t-92 -10q-99 0 -183 38.5t-152 109.5q-49 51 -109 79.5t-132 28.5q-70 0 -131.5 -28.5t-109.5 -79.5l-9.5 -9t-23 -22.5l-29.5 -29.5t-30.5 -30t-25 -25t-12.5 -13q-19 -19 -45 -19 t-45 19t-19 45t19 45q54 54 102 104t100 88t114 60.5t145 22.5q99 0 183 -38.5t152 -109.5q49 -51 109 -79.5t132 -28.5q76 0 132 28.5t109 79.5q11 10 21.5 15t25.5 5zM1235 1758q14 -8 23 -23t9 -32q0 -8 -2 -15t-5 -14l-707 -1415q-9 -19 -28 -28l-173 -87 q-32 -16 -69 -16h-9.5t-9.5 1l-47 -94q-8 -16 -23.5 -25.5t-33.5 -9.5q-26 0 -45 19t-19 45q0 12 7 30t16.5 37.5t19.5 36.5t15 28q-26 40 -26 87v165q0 16 7 29l576 1152l-65 32l-237 -474q-8 -16 -23.5 -25.5t-33.5 -9.5q-26 0 -45 19t-19 45q0 13 7 29l239 478 q16 32 43 50.5t63 18.5q35 0 66.5 -17t61.5 -32l71 142q8 17 23.5 26t33.5 9q13 0 22 -4q12 24 23.5 47.5t26 42.5t35.5 30.5t53 11.5t61 -15l94 -47q32 -16 50.5 -42.5t18.5 -63.5q0 -34 -15.5 -63.5t-29.5 -58.5zM1033 1859l87 -43l29 58l-87 43zM1117 1674l-192 96 l-669 -1337v-150q0 -11 8 -19t19 -8q4 0 16.5 5t29 13t35 17.5t35.5 18.5t30 16t19 10z'],
				checklist: ['0 0 2048 2048', '1,-1', 'M640 1152v128h1408v-128h-1408zM640 1664h1408v-128h-1408v128zM640 768v128h1408v-128h-1408zM640 384v128h1408v-128h-1408zM192 1579l211 210l90 -90l-301 -301l-173 173l90 90zM192 1195l211 210l90 -90l-301 -301l-173 173l90 90zM192 811l211 210l90 -90l-301 -301l-173 173l90 90zM192 427l211 210l90 -90l-301 -301l-173 173l90 90z'],
				batchmail: ['0 0 2048 2048', '1,-1', 'M0.125 1664v-1082q28.998 23 60.9961 39.5t66.9961 28.5v815l895.945 -449l895.945 449v-953h-703.957v-128h831.949v1280h-2047.88zM1024.06 1160l-752.954 376h1505.91zM933.068 448l-225.986 -227l89.9941 -90l317.98 317l-317.98 317l-89.9941 -90zM549.092 512 q-49.9971 0 -110.493 2.5q-60.4971 2.5 -121.493 -0.5t-117.992 -14.5q-56.9971 -11.5 -101.494 -40t-70.9961 -77.5q-26.498 -49 -26.498 -126q0 -53 20.499 -99.5q20.498 -46.5 54.9961 -81t81.4951 -55t98.9941 -20.5v128q-26.998 0 -49.9971 10 q-22.998 10 -40.4971 27.5t-27.499 40.5q-9.99902 23 -9.99902 50t9.99902 50q10 23 27.499 40.5t40.4971 27.5q22.999 10 49.9971 10h292.982l-161.99 -163l89.9941 -90l316.98 317l-316.98 317l-89.9941 -90z'],
				generalsetting: ['0 0 2048 2048', '1,-1', 'M1783 1060q0 -9 0.5 -18t0.5 -18t-0.5 -18t-0.5 -18l259 -161l-159 -383l-297 68q-24 -26 -50 -50l68 -297l-383 -159l-161 259q-9 0 -18 -0.5t-18 -0.5t-18 0.5t-18 0.5l-161 -259l-383 159l68 297q-26 24 -50 50l-297 -68l-159 383l259 161q0 9 -0.5 18t-0.5 18t0.5 18t0.5 18l-259 161l159 383l297 -68q24 26 50 50l-68 297l383 159l161 -259q9 0 18 0.5t18 0.5t18 -0.5t18 -0.5l161 259l383 -159l-68 -297q26 -24 50 -50l297 68l159 -383zM1666 930q2 24 4 47.5t2 47.5q0 23 -2 47t-4 47l236 147l-86 208l-271 -63q-31 38 -63.5 70t-70.5 64l63 271l-208 86l-148 -236q-23 2 -47 4t-47 2q-24 0 -47.5 -2t-47.5 -4l-147 236l-208 -86l63 -271q-38 -31 -70 -63.5t-64 -70.5l-271 63l-86 -208l236 -148q-2 -24 -4 -47.5t-2 -47.5q0 -23 2 -47t4 -47l-236 -147l86 -208l271 63q31 -38 63.5 -70t70.5 -64l-63 -271l208 -86l148 236q23 -2 47 -4t47 -2q24 0 47.5 2t47.5 4l147 -236l208 86l-63 271q38 31 70 63.5t64 70.5l271 -63l86 208zM1024 1400q78 0 146.5 -29.5t119.5 -80.5t80.5 -119.5t29.5 -146.5t-29.5 -146.5t-80.5 -119.5t-119.5 -80.5t-146.5 -29.5t-146.5 29.5t-119.5 80.5t-80.5 119.5t-29.5 146.5t29.5 146.5t80.5 119.5t119.5 80.5t146.5 29.5zM1024 760q55 0 103 20.5t84 56.5t56.5 84t20.5 103t-20.5 103t-56.5 84t-84 56.5t-103 20.5t-103 -20.5t-84 -56.5t-56.5 -84t-20.5 -103t20.5 -103t56.5 -84t84 -56.5t103 -20.5z'],
				moduleselector: ['0 0 2048 2048', '1,-1', 'M1600 1024h192v-896h-1664v1664h896v-192l448 448l576 -576zM1054 1472l418 -418l418 418l-418 418zM1024 1344v-320h320zM256 1024h640v640h-640v-640zM896 896h-640v-640h640v640zM1024 896v-640h640v640h-640z'],
				advancedsetting: ['0 0 2048 2048', '1,-1', 'M128 1152q52 0 99 20.5t81.5 55t55 81t20.5 99.5q0 71 -3 142t4.5 138.5t32 130.5t78.5 117t125 83t147 29v-128q-53 0 -99.5 -20.5t-81 -55t-55 -81.5t-20.5 -99q0 -56 2 -110.5t0.5 -107t-9.5 -102t-27 -94.5t-52 -86t-85 -76q52 -35 85 -76t52 -86t27 -94.5t9.5 -102t-0.5 -107t-2 -110.5q0 -53 20.5 -99.5t55 -81t81 -55t99.5 -20.5v-128q-76 0 -147 29t-125 83t-78.5 117t-32 130.5t-4.5 138.5t3 142q0 52 -20.5 99t-55 81.5t-81.5 55t-99 20.5v128zM1280 2048q76 0 147 -29t125 -83t78.5 -117t32 -130.5t4.5 -138.5t-3 -142q0 -53 20.5 -99.5t55 -81t81 -55t99.5 -20.5v-128q-53 0 -99.5 -20.5t-81 -55t-55 -81.5t-20.5 -99q0 -71 3 -142t-4.5 -138.5t-32 -130.5t-78.5 -117t-125 -83t-147 -29v128q52 0 99 20.5t81.5 55t55 81t20.5 99.5q0 56 -2 110.5t-0.5 107t9.5 102t27 94.5t52 86t85 76q-52 35 -85 76t-52 86t-27 94.5t-9.5 102t0.5 107t2 110.5q0 52 -20.5 99t-55 81.5t-81.5 55t-99 20.5v128z'],
				faq: ['0 0 2048 2048', '1,-1', 'M960 2044q132 0 254 -34t228.5 -96.5t193.5 -149.5t149.5 -193.5t96.5 -228.5t34 -254t-34 -254t-96.5 -228.5t-149.5 -193.5t-193.5 -149.5t-228.5 -96.5t-254 -34t-254 34t-228.5 96.5t-193.5 149.5t-149.5 193.5t-96.5 228.5t-34 254t34 254t96.5 228.5t149.5 193.5t193.5 149.5t228.5 96.5t254 34zM960 252q115 0 222 30t200 84.5t169 130.5t130.5 169t84.5 200t30 222t-30 222t-84.5 200t-130.5 169t-169 130.5t-200 84.5t-222 30t-222 -30t-200 -84.5t-169 -130.5t-130.5 -169t-84.5 -200t-30 -222t30 -222t84.5 -200t130.5 -169t169 -130.5t200 -84.5t222 -30zM896 640h128v-128h-128v128zM960 1600q66 0 124 -25.5t101.5 -69t69 -101.5t25.5 -124q0 -60 -19 -104.5t-47.5 -80.5t-61.5 -65.5t-61.5 -59t-47.5 -63t-19 -75.5v-64h-128v64q0 60 19 104.5t47.5 80.5t61.5 65.5t61.5 59t47.5 62.5t19 76q0 40 -15 75t-41 61t-61 41t-75 15t-75 -15t-61 -41t-41 -61t-15 -75h-128q0 66 25 124t68.5 101.5t102 69t124.5 25.5z'],
				construction: ['0 0 2048 2048', '1,-1', 'M1280 0l140 281l-268 268v-357q0 -40 -15 -75t-41 -61t-61 -41t-75 -15t-75 15t-61 41t-41 61t-15 75v241l-1 2q-5 -19 -18 -32l-280 -281q-28 -28 -65 -43t-76 -15q-41 0 -77.5 15.5t-63.5 42.5t-43 63.5t-16 77.5q0 40 15.5 77t43.5 65l197 198v368q-33 -11 -64 -11 q-40 0 -75 15t-61 41t-41 61t-15 75v320q0 20 11.5 36.5t30.5 23.5l-151 151q-19 19 -19 45t19 45t45 19t45 -19l205 -204l375 93q18 5 39 3.5t40 -1.5q0 53 20 99.5t55 81.5t81.5 55t99.5 20t99.5 -20t81.5 -55t55 -81.5t20 -99.5q0 -51 -19.5 -98t-54.5 -82l134 -611 q2 -10 3 -20t1 -20q0 -58 -31.5 -106.5t-85.5 -71.5l254 -253l183 366l384 -768h-768zM1024 1792q-27 0 -50 -10t-40.5 -27.5t-27.5 -40.5t-10 -50t10 -50t27.5 -40.5t40.5 -27.5t50 -10t50 10t40.5 27.5t27.5 40.5t10 50t-10 50t-27.5 40.5t-40.5 27.5t-50 10zM320 1088 q26 0 45 19t19 45v115q0 23 14 40t35 22q14 4 44 12t62 16.5t60.5 15t39.5 6.5q26 0 45.5 -19t19.5 -46q0 -17 -5.5 -28t-15.5 -18.5t-22.5 -12t-25.5 -8.5l261 -260v124q0 26 18.5 45t44.5 19q23 0 41 -13.5t23 -36.5q18 -77 32.5 -154t34.5 -153q6 -23 22.5 -36.5 t40.5 -13.5q26 0 44.5 18.5t18.5 44.5q0 5 -2 15l-124 571q-32 -9 -66 -9q-69 0 -128 34t-94 94h-90l-456 -114v-270q0 -26 19 -45t45 -19zM1024 561q-3 5 -12 23.5t-22 44t-27 54t-26 53t-20.5 41t-9.5 17.5q-17 21 -32.5 37t-31 30.5t-32.5 29.5t-36 35l-263 263v-613 q0 -26 -19 -45l-216 -216q-21 -21 -21 -51q0 -29 21 -50.5t50 -21.5q30 0 51 21l262 262v229q0 26 19 45t45 19q18 0 33.5 -9.5t23.5 -25.5l128 -256q7 -13 7 -29v-256q0 -26 19 -45t45 -19t45 19t19 45v369zM1664 482l-177 -354h354z'],
				outlook: ['0 0 50 50', '1,1', 'M 28.875 0 C 28.855469 0.0078125 28.832031 0.0195313 28.8125 0.03125 L 0.8125 5.34375 C 0.335938 5.433594 -0.0078125 5.855469 0 6.34375 L 0 43.65625 C -0.0078125 44.144531 0.335938 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 29.101563 50.023438 29.402344 49.949219 29.632813 49.761719 C 29.859375 49.574219 29.996094 49.296875 30 49 L 30 38 L 34.0625 38 C 34.019531 38.332031 34 38.660156 34 39 C 34 43.40625 37.59375 47 42 47 C 46.40625 47 50 43.40625 50 39 C 50 37.609375 49.628906 36.296875 49 35.15625 C 49.003906 35.105469 49.003906 35.050781 49 35 L 49 17.65625 C 49.082031 17.433594 49.082031 17.191406 49 16.96875 L 49 12 C 49 11.449219 48.550781 11 48 11 L 30 11 L 30 1 C 30.003906 0.710938 29.878906 0.4375 29.664063 0.246094 C 29.449219 0.0546875 29.160156 -0.0351563 28.875 0 Z M 28 2.1875 L 28 11.6875 C 27.941406 11.882813 27.941406 12.085938 28 12.28125 L 28 36.6875 C 27.941406 36.882813 27.941406 37.085938 28 37.28125 L 28 47.8125 L 2 42.84375 L 2 7.15625 Z M 30 13 L 47 13 L 47 16.78125 L 33.75 24.625 L 30 21.53125 Z M 14.84375 15.53125 C 12.324219 15.53125 10.308594 16.40625 8.78125 18.1875 C 7.253906 19.96875 6.5 22.304688 6.5 25.1875 C 6.5 27.917969 7.246094 30.144531 8.75 31.84375 C 10.253906 33.542969 12.207031 34.40625 14.59375 34.40625 C 17.042969 34.40625 19.007813 33.503906 20.53125 31.75 C 22.054688 29.992188 22.8125 27.679688 22.8125 24.8125 C 22.8125 22.023438 22.09375 19.800781 20.625 18.09375 C 19.15625 16.390625 17.222656 15.53125 14.84375 15.53125 Z M 14.75 19.0625 C 16.027344 19.0625 17.042969 19.605469 17.78125 20.65625 C 18.519531 21.707031 18.875 23.171875 18.875 25.0625 C 18.875 26.878906 18.476563 28.292969 17.71875 29.3125 C 16.957031 30.335938 15.949219 30.84375 14.65625 30.84375 C 13.398438 30.84375 12.371094 30.332031 11.59375 29.28125 C 10.820313 28.230469 10.4375 26.773438 10.4375 24.96875 C 10.4375 23.1875 10.816406 21.769531 11.59375 20.6875 C 12.367188 19.605469 13.433594 19.0625 14.75 19.0625 Z M 47 19.125 L 47 32.78125 C 45.628906 31.679688 43.886719 31 42 31 C 38.660156 31 35.789063 33.082031 34.59375 36 L 30 36 L 30 24.09375 L 33.03125 26.59375 C 33.355469 26.867188 33.820313 26.90625 34.1875 26.6875 Z M 42 33 C 45.324219 33 48 35.675781 48 39 C 48 42.324219 45.324219 45 42 45 C 38.675781 45 36 42.324219 36 39 C 36 35.675781 38.675781 33 42 33 Z M 41 34 L 41 41 L 46 41 L 46 39 L 43 39 L 43 34 Z'],
				word: ['0 0 50 50', '1,1', 'M 28.875 0 C 28.855469 0.0078125 28.832031 0.0195313 28.8125 0.03125 L 0.8125 5.34375 C 0.335938 5.433594 -0.0078125 5.855469 0 6.34375 L 0 43.65625 C -0.0078125 44.144531 0.335938 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 29.101563 50.023438 29.402344 49.949219 29.632813 49.761719 C 29.859375 49.574219 29.996094 49.296875 30 49 L 30 44 L 47 44 C 48.09375 44 49 43.09375 49 42 L 49 8 C 49 6.90625 48.09375 6 47 6 L 30 6 L 30 1 C 30.003906 0.710938 29.878906 0.4375 29.664063 0.246094 C 29.449219 0.0546875 29.160156 -0.0351563 28.875 0 Z M 28 2.1875 L 28 6.6875 C 27.941406 6.882813 27.941406 7.085938 28 7.28125 L 28 42.8125 C 27.972656 42.945313 27.972656 43.085938 28 43.21875 L 28 47.8125 L 2 42.84375 L 2 7.15625 Z M 30 8 L 47 8 L 47 42 L 30 42 L 30 37 L 44 37 L 44 35 L 30 35 L 30 29 L 44 29 L 44 27 L 30 27 L 30 22 L 44 22 L 44 20 L 30 20 L 30 15 L 44 15 L 44 13 L 30 13 Z M 4.625 15.65625 L 8.4375 34.34375 L 12.1875 34.34375 L 14.65625 22.375 C 14.769531 21.824219 14.875 21.101563 14.9375 20.25 L 14.96875 20.25 C 14.996094 21.023438 15.058594 21.75 15.1875 22.375 L 17.59375 34.34375 L 21.21875 34.34375 L 25.0625 15.65625 L 21.75 15.65625 L 19.75 28.125 C 19.632813 28.828125 19.558594 29.53125 19.53125 30.21875 L 19.5 30.21875 C 19.433594 29.339844 19.367188 28.679688 19.28125 28.21875 L 16.90625 15.65625 L 13.40625 15.65625 L 10.78125 28.0625 C 10.613281 28.855469 10.496094 29.582031 10.46875 30.25 L 10.40625 30.25 C 10.367188 29.355469 10.308594 28.625 10.21875 28.09375 L 8.1875 15.65625 Z'],
				email: ['0 0 2048 2048', '1,-1', 'M1024 2048q141 0 272 -36.5t245 -103t207.5 -160t160 -207.5t103 -245t36.5 -272q0 -55 -10.5 -114.5t-31.5 -116.5t-53 -108t-74.5 -89.5t-96.5 -61t-118 -22.5q-54 0 -105.5 14.5t-95.5 41.5t-80.5 66t-60.5 88q-30 -47 -69 -85.5t-85 -66.5t-98.5 -43t-109.5 -15 q-102 0 -185 44.5t-141.5 116.5t-90 164t-31.5 187t31.5 187t90 164t141.5 116.5t185 44.5q95 0 176.5 -41t143.5 -112v153h128v-512v-128q0 -53 20 -99.5t55 -81.5t81.5 -55t99.5 -20q44 0 80.5 18.5t65 49t49.5 70t34.5 82.5t20 85.5t6.5 78.5q0 123 -32 237.5t-90.5 214 t-140.5 181.5t-181.5 140.5t-214 90.5t-237.5 32t-237.5 -32t-214 -90.5t-181.5 -140.5t-140.5 -181.5t-90.5 -214t-32 -237.5t32 -237.5t90.5 -214t140.5 -181.5t181.5 -140.5t213.5 -90.5t238 -32q178 0 343 68l49 -118q-94 -39 -192.5 -58.5t-199.5 -19.5 q-141 0 -272 36.5t-245 103t-207.5 160t-160 207.5t-103 244.5t-36.5 272.5q0 141 36.5 272t103 245t160 207.5t207.5 160t244.5 103t272.5 36.5zM960 640q75 0 134.5 34.5t100.5 89.5t63 123.5t22 136.5t-22 136.5t-63 123.5t-100.5 89.5t-134.5 34.5t-134.5 -34.5 t-100.5 -89.5t-63 -123.5t-22 -136.5t22 -136.5t63 -123.5t100.5 -89.5t134.5 -34.5z'],
				print: ['0 0 2048 2048', '1,-1', 'M1920 1280q26 0 49.5 -10t41 -27.5t27.5 -41t10 -49.5v-896h-512v-256h-1024v256h-512v896q0 26 10 49.5t27.5 41t41 27.5t49.5 10h384v768h1024v-768h384zM640 1280h768v640h-768v-640zM1408 640h-768v-512h768v512zM1920 1152h-1792v-768h384v384h1024v-384h384v768z M320 1024q26 0 45 -19t19 -45t-19 -45t-45 -19t-45 19t-19 45t19 45t45 19z'],
				websearch: ['0 0 2048 2048', '1,-1', 'M1024 2048q141 0 272 -36.5t245 -103t207.5 -160t160 -207.5t103 -245t36.5 -272t-36.5 -272t-103 -245t-160 -207.5t-207.5 -160t-245 -103t-272 -36.5t-272 36.5t-245 103t-207.5 160t-160 207.5t-103 244.5t-36.5 272.5q0 141 36.5 272t103 245t160 207.5t207.5 160t244.5 103t272.5 36.5zM1833 1408q-38 81 -92 152.5t-120 130.5t-143 105t-161 75q36 -50 65 -106t51.5 -115.5t38.5 -120.5t28 -121h333zM1920 1024q0 133 -37 256h-363q8 -64 12 -127.5t4 -128.5t-4 -128.5t-12 -127.5h363q37 123 37 256zM1024 128q49 0 91.5 27t78.5 71t64.5 99.5t50.5 112.5t37 110t23 92h-690q8 -39 23 -92t37 -110t50.5 -112.5t64.5 -99.5t78.5 -71t91.5 -27zM1391 768q8 64 12.5 127.5t4.5 128.5t-4.5 128.5t-12.5 127.5h-734q-8 -64 -12.5 -127.5t-4.5 -128.5t4.5 -128.5t12.5 -127.5h734zM128 1024q0 -133 37 -256h363q-8 64 -12 127.5t-4 128.5t4 128.5t12 127.5h-363q-37 -123 -37 -256zM1024 1920q-49 0 -91.5 -27t-78.5 -71t-64.5 -99.5t-50.5 -112.5t-37 -110t-23 -92h690q-8 39 -23 92t-37 110t-50.5 112.5t-64.5 99.5t-78.5 71t-91.5 27zM731 1871q-84 -29 -161 -75t-143 -105t-120 -130.5t-92 -152.5h333q12 60 28 121t38.5 120.5t51.5 115.5t65 106zM215 640q38 -81 92 -152.5t120 -130.5t143 -105t161 -75q-36 50 -65 106t-51.5 115.5t-38.5 120.5t-28 121h-333zM1317 177q84 29 161 75t143 105t120 130.5t92 152.5h-333q-12 -60 -28 -121t-38.5 -120.5t-51.5 -115.5t-65 -106z'],
				fileexplorer: ['0 0 2048 2048', '1,-1', 'M2048 256h-384v-128h-384v128h-512v-128h-384v128h-384v1536q0 27 10 50t27.5 40.5t40.5 27.5t50 10h480q45 0 77.5 -9.5t58 -23.5t45.5 -31t40.5 -31t44 -23.5t54.5 -9.5h992q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50v-1408zM128 1792v-128h480q24 0 42 4.5t33 13t29.5 20t31.5 26.5q-17 15 -31.5 26.5t-29.5 20t-33 13t-42 4.5h-480zM1280 384v256h-512v-256h512zM1536 256v576q0 26 -19 45t-45 19h-896q-26 0 -45 -19t-19 -45v-576h128v512h768v-512h128zM1920 1664h-992q-31 0 -54.5 -9.5t-44 -23.5t-41 -31t-45.5 -31t-57.5 -23.5t-77.5 -9.5h-480v-1152h256v448q0 40 15 75t41 61t61 41t75 15h896q40 0 75 -15t61 -41t41 -61t15 -75v-448h256v1280z'],
				bug: ['0 0 2048 2048', '1,-1', 'M1608 1151q65 -2 122 -27.5t99 -68.5t66.5 -100.5t24.5 -122.5v-192h-128v192q0 32 -10.5 61.5t-29 54t-44.5 42t-57 26.5q6 -29 9.5 -59.5t3.5 -60.5v-256q0 -7 -1 -13t-2 -13l6 6q60 -60 92 -138t32 -163t-32 -162.5t-92 -137.5l-90 90q42 42 64 95.5t22 113.5q0 68 -31 132q-31 -100 -90.5 -183t-139.5 -142t-176.5 -92t-201.5 -33t-201.5 33t-176.5 92t-139.5 142t-90.5 183q-31 -64 -31 -132q0 -60 22 -113.5t64 -95.5l-90 -90q-60 60 -92.5 137.5t-32.5 162.5t32.5 163t92.5 138l6 -6q-1 7 -2 13t-1 13v256q0 30 3.5 60.5t9.5 59.5q-31 -9 -57 -26.5t-44.5 -42t-29 -54t-10.5 -61.5v-192h-128v192q0 65 24.5 122.5t66.5 100.5t99 68.5t122 27.5q31 70 80 135q-57 10 -105.5 38.5t-83.5 70.5t-55 94.5t-20 110.5v192h128v-192q0 -40 15 -75t41 -61t61 -41t75 -15h64v-3q47 35 96 59q-15 32 -23.5 66.5t-8.5 69.5q0 70 31 135l-140 140l90 90l127 -127q45 39 98.5 60.5t113.5 21.5t113.5 -21.5t98.5 -60.5l127 127l90 -90l-140 -140q31 -65 31 -135q0 -35 -8.5 -69.5t-23.5 -66.5q26 -13 49.5 -27.5t46.5 -31.5v3h64q40 0 75 15t61 41t41 61t15 75v192h128v-192q0 -58 -20 -110.5t-55 -94.5t-83.5 -70.5t-105.5 -38.5q49 -65 80 -135zM1024 1792q-40 0 -75 -15t-61 -41t-41 -61t-15 -75q0 -50 24 -90q42 11 83.5 17.5t84.5 6.5t84.5 -6.5t83.5 -17.5q24 40 24 90q0 40 -15 75t-41 61t-61 41t-75 15zM1536 896q0 104 -41 197t-110.5 163t-162.5 111t-198 41t-198 -41t-162.5 -111t-110.5 -163t-41 -197v-256q0 -106 40.5 -199t110 -162.5t162.5 -110t199 -40.5t199 40.5t162.5 110t110 162.5t40.5 199v256z'],
				shuffle: ['0 0 2048 2048', '1,-1', 'M1765 1408q-127 -4 -240.5 -35.5t-215 -87t-192.5 -132.5t-172 -170q-34 -39 -68 -76t-72 -72q-168 -153 -372 -238t-433 -85v128q131 0 248.5 30.5t222.5 86t198.5 134t177.5 174.5q35 41 70.5 79t75.5 74q81 72 170.5 130t187 99t202 63.5t213.5 25.5l-147 147l90 90l302 -301l-302 -301l-90 90zM805 1212q-22 -24 -42.5 -48.5t-43.5 -48.5q-74 68 -157.5 122.5t-174.5 92.5t-188 58t-199 20v128q229 0 433 -85.5t372 -238.5zM1709 877l302 -301l-302 -301l-90 90l147 147q-110 3 -215.5 26t-203.5 64.5t-188.5 100.5t-171.5 133q22 24 42.5 48.5t43.5 48.5q72 -66 152 -119t167.5 -91t181 -59t191.5 -24l-146 147z'],
				pdf: ['0 0 2048 2048', '1,-1', 'M1920 384h-128v-384h-1664v384h-128v1024h128v640h1243l421 -421v-219h128v-1024zM1408 1664h165l-165 165v-165zM256 1408h1408v128h-384v384h-1024v-512zM1664 384h-1408v-256h1408v256zM1792 1280h-1664v-768h1664v768zM448 1152q40 0 75 -15t61 -41t41 -61t15 -75t-15 -75t-41 -61t-61 -41t-75 -15h-64v-128h-128v512h192zM448 896q26 0 45 19t19 45t-19 45t-45 19h-64v-128h64zM896 1152q53 0 99.5 -20t81.5 -55t55 -81.5t20 -99.5t-20 -99.5t-55 -81.5t-81.5 -55t-99.5 -20h-128v512h128zM896 768q27 0 50 10t40.5 27.5t27.5 40.5t10 50t-10 50t-27.5 40.5t-40.5 27.5t-50 10v-256zM1280 1152h320v-128h-192v-128h192v-128h-192v-128h-128v512z'],
				clock: ['0 0 2048 2048', '1,-1', 'M1024 0q-142 0 -272.5 36.5t-244.5 103t-207.5 160t-160 207.5t-103 245t-36.5 272t36.5 272t103 245t160 207.5t207.5 160t245 103t272 36.5t272 -36.5t245 -103t207.5 -160t160 -207.5t103 -245t36.5 -272q0 -142 -36.5 -272.5t-103 -244.5t-160 -207.5t-207.5 -160t-245 -103t-272 -36.5zM1024 1920q-123 0 -237.5 -32t-214 -90.5t-181.5 -140.5t-140.5 -181.5t-90.5 -214t-32 -237.5t32 -237.5t90.5 -214t140.5 -181.5t181.5 -140.5t214 -90.5t237.5 -32t237.5 32t214 90.5t181.5 140.5t140.5 181.5t90.5 214t32 237.5t-32 237.5t-90.5 214t-140.5 181.5t-181.5 140.5t-214 90.5t-237.5 32zM1024 1024v640h-128v-768h512v128h-384z'],
				refreshall: ['0 0 2048 2048', '1,-1', 'M2048 1024q0 -140 -37 -272t-106 -248t-167.5 -212.5t-220.5 -163.5h275v-128h-512v512h128v-294q117 55 211.5 139.5t161 189.5t103 226.5t36.5 250.5q0 123 -32 237.5t-90.5 214t-140.5 181.5t-181.5 140.5t-214 90.5t-237.5 32t-237.5 -32t-214 -90.5t-181.5 -140.5t-140.5 -181.5t-90.5 -214t-32 -237.5q0 -150 48 -289t135 -253t208 -197.5t266 -123.5l-34 -123q-110 31 -208.5 84t-182 124t-150.5 159t-113.5 187t-71.5 208t-25 224q0 141 36.5 272t103.5 244.5t160.5 207t207 160.5t244.5 103.5t272 36.5t272 -36.5t244.5 -103.5t207 -160.5t160.5 -207t103.5 -244.5t36.5 -272zM1536 1024l-768 -443v886z'],
				refreshnone: ['0 0 2048 2048', '1,-1', 'M2048 1024q0 -140 -37 -272t-106 -248t-167.5 -212.5t-220.5 -163.5h275v-128h-512v512h128v-294q117 55 211.5 139.5t161 189.5t103 226.5t36.5 250.5q0 123 -32 237.5t-90.5 214t-140.5 181.5t-181.5 140.5t-214 90.5t-237.5 32t-237.5 -32t-214 -90.5t-181.5 -140.5t-140.5 -181.5t-90.5 -214t-32 -237.5q0 -150 48 -289t135 -253t208 -197.5t266 -123.5l-34 -123q-110 31 -208.5 84t-182 124t-150.5 159t-113.5 187t-71.5 208t-25 224q0 141 36.5 272t103.5 244.5t160.5 207t207 160.5t244.5 103.5t272 36.5t272 -36.5t244.5 -103.5t207 -160.5t160.5 -207t103.5 -244.5t36.5 -272zM1536 1024l-768 -443v886zM896 802l384 222l-384 222v-444z'],
				translate: ['0 0 2048 2048', '1,-1', 'M601 896l298 -896h-134l-86 256h-334l-86 -256h-134l298 896h178zM637 384l-125 374l-125 -374h250zM640 1792v-384h256v-128h-384v512h128zM257 899q-60 45 -108 102t-81 122t-50.5 137.5t-17.5 147.5q0 88 23 170t64.5 153t100 129.5t129.5 100t153 64.5t170 23t170 -23t153 -64.5t129.5 -100t100 -129.5t64.5 -153t23 -170q0 -32 -3.5 -64t-9.5 -64h-133q8 32 13 64t5 64q0 106 -40.5 199t-110 162.5t-162.5 110t-199 40.5t-199 -40.5t-162.5 -110t-110 -162.5t-40.5 -199q0 -110 45.5 -208.5t126.5 -171.5zM2030 606q2 -8 2 -13v-96q0 -4 -2 -12q-8 -2 -13 -2q-40 1 -79 2t-79 1h-321v-33q0 -52 1 -104t3 -104v-4q0 -24 -9 -48t-29 -38q-14 -10 -39.5 -15.5t-54.5 -8t-56.5 -3t-43.5 -0.5q-6 0 -19 0.5t-18 5.5q-3 3 -7 16t-6 18q-7 26 -16.5 48.5t-23.5 45.5q34 -4 68 -5.5t68 -1.5q24 0 36.5 7.5t12.5 33.5v190h-319q-40 0 -80 -1l-80 -2q-8 0 -12 3q-2 6 -2 11v96q0 3 0.5 7.5t2.5 6.5q6 2 11 2l80 -2t80 -1h319q-2 26 -2.5 52.5t-5.5 52.5q20 -2 39.5 -3.5t39.5 -3.5q2 0 3.5 -0.5t3.5 -0.5q35 25 67 53t64 57h-308q-42 0 -83.5 -1t-83.5 -2q-8 0 -12 3q-2 6 -2 11v95q0 4 2 12q8 2 12 2q42 -1 83.5 -2t83.5 -1h373q16 0 30 4.5t25 4.5q8 0 23 -12t30 -28t26.5 -32.5t11.5 -24.5q0 -10 -6.5 -15.5t-14.5 -9.5q-14 -7 -27 -18t-25 -21q-52 -43 -104.5 -83.5t-109.5 -77.5v-11h321q40 0 79 1t79 2q7 0 13 -3zM1391 1159q0 30 -1 61t-8 60q69 0 137 -6q6 -1 12.5 -3t6.5 -10q0 -5 -3 -12t-5 -12q-2 -6 -3.5 -16t-2 -21.5t-0.5 -22v-16.5v-13h296q42 0 83.5 1t83.5 2q7 0 13 -3q3 -5 3 -10q-1 -17 -2 -35.5t-1 -35.5v-58q0 -36 1 -72.5t2 -72.5q0 -3 -0.5 -7t-2.5 -6q-8 -2 -13 -2t-25 -0.5t-41 -0.5q-19 0 -34 1t-17 3q-2 8 -2.5 24t-0.5 36q0 33 1 68t1 52h-802v-14.5t0.5 -25t0.5 -31v-33.5q0 -29 -1 -52.5t-3 -25.5q-8 -2 -13 -2h-102q-11 0 -13 3t-2 13q1 40 1 79v79v58t-1 58q0 5 2 11q8 2 13 2q42 -1 83.5 -2t83.5 -1h275v11z'],
				key: ['0 0 2048 2048', '1,-1', 'M2048 475v-475h-512v256h-256v256h-256v207q-74 -39 -155 -59t-165 -20q-97 0 -187 25t-168 71t-142.5 110.5t-110.5 142.5t-71 168t-25 187t25 187t71 168t110.5 142.5t142.5 110.5t168 71t187 25t187 -25t168 -71t142.5 -110.5t110.5 -142.5t71 -168t25 -187q0 -51 -8 -101t-23 -98zM1920 421l-690 690q22 57 36 114.5t14 118.5q0 119 -45.5 224t-123.5 183t-183 123.5t-224 45.5t-224 -45.5t-183 -123.5t-123.5 -183t-45.5 -224t45.5 -224t123.5 -183t183 -123.5t224 -45.5q97 0 190.5 33t168.5 95h89v-256h256v-256h256v-256h256v293zM512 1664q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50t-10 -50t-27.5 -40.5t-40.5 -27.5t-50 -10t-50 10t-40.5 27.5t-27.5 40.5t-10 50t10 50t27.5 40.5t40.5 27.5t50 10z'],
			};
			addclass = addclass || '';
			try {
				var rtrn = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"' + asset[icon][0] + '\" style=\"transform: scale(' + asset[icon][1] + ');\" class=\"icon ' + addclass + '\" ' + (value(id) != '' ? ' id=\"' + id + '\" ' : '') + (value(attributes) != '' ? ' ' + attributes : '') + '><path d=\"' + asset[icon][2] + '\"></path></svg>';
			} catch (error) {
				var rtrn = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"' + asset.construction[0] + '\" style=\"transform: scale(' + asset.construction[1] + ');\" class=\"icon ' + addclass + '\" ' + (value(id) != '' ? ' id=\"' + id + '\" ' : '') + (value(attributes) != '' ? ' ' + attributes : '') + '><path d=\"' + asset.construction[2] + '\"></path></svg>';
			}
			//weird hack: svg seem not to support the title attribute. so there has to be a wrapper if attributes contain title
			var title = value(attributes).match(/title="(.*?)"/g);
			if (title) return ['<span ' + title + '>', rtrn, '</span>'].join('');
			else return rtrn;
		},
	},

	setting: { //core-object because of reusable switch-methods
		setup: function () { //displays settings menu
			return '<div id="popupcontent">' +
				'<article class="home" style="border-right:1px solid; line-height:3em">' +
				'<span onclick="core.fn.stdout(\'settingContent\', core.fn.setting.setupMain());" style="cursor:pointer">' + core.fn.insert.icon('generalsetting') + core.fn.lang('settingMainCaption') + '</span><br />' +
				'<span onclick="core.fn.stdout(\'settingContent\', core.fn.setting.setupAdvanced());" style="cursor:pointer">' + core.fn.insert.icon('advancedsetting') + core.fn.lang('settingAdvancedCaption') + '</span><br />' +
				'<span onclick="core.fn.stdout(\'settingContent\', core.fn.setting.setupModules());" style="cursor:pointer">' + core.fn.insert.icon('moduleselector') + core.fn.lang('settingModuleselectorCaption') + '</span><br />' +
				'<span onclick="core.fn.stdout(\'settingContent\', core.fn.setting.setupKey());" style="cursor:pointer">' + core.fn.insert.icon('key') + core.fn.lang('settingKeyCaption') + '</span><br />' +
				'<span onclick="core.fn.stdout(\'settingContent\', core.fn.setting.setupDebug());" style="cursor:pointer">' + core.fn.insert.icon('bug') + 'Debugging</span><br />' +
				'<span onclick="core.fn.stdout(\'settingContent\', updateTracker.enlist());" style="cursor:pointer">' + core.fn.insert.icon('update') + 'Updates</span><br />' +
				'<span onclick="core.fn.stdout(\'settingContent\', aboutNotification[core.var.selectedLanguage]+\'<hr />\'+core.fn.lang(\'settingGeneralHint\')+\'<hr />\'+randomTip.enlist());" style="cursor:pointer">' + core.fn.insert.icon('info') + 'About</span><br />' +
				'</article>' +
				'<aside id="settingContent">' + core.fn.setting.setupMain() + '</aside>' +
				'<div>';
		},
		setupMain: function () { //returns main settings
			if (typeof (core.var) !== 'undefined') {
				var themeSelector = new Object();
				//create theme-selector
				Object.keys(core.var.themes).forEach(function (key) {
					themeSelector[key] = [key, core.var.themes[key][core.var.selectedLanguage]];
				});
			}
			return core.fn.lang('settingThemeCaption') + ':<br />' + core.fn.insert.select(themeSelector, 'settingTheme', 'settingTheme', (core.fn.setting.get('settingTheme') || null), 'onchange="core.fn.setting.theme(this.value)"') +
				'<br /><br />' + core.fn.lang('settingMenusizeCaption') + ':<br />' + core.fn.insert.checkbox(core.fn.lang('settingMenusizeSelector'), 'settingSmallmenu', (core.fn.setting.get('settingSmallmenu') || 0), 'onchange="core.fn.setting.switch(\'settingSmallmenu\'); core.fn.growlNotif(core.fn.lang(\'settingRestartNeccessary\'))"', core.fn.lang('settingRestartNeccessary')) +
				'<br />' + core.fn.lang('settingFontsizeCaption') + ':<br /><input type="range" min="-5" max="10" value="' + (core.fn.setting.get('settingFontsize') || 0) + '" onchange="core.fn.setting.fontsize(this.value)" />' +
				'<br />' + core.fn.lang('settingLanguageCaption') + ':<br />' + core.fn.insert.select(core.var.registeredLanguages, 'settingLanguage', 'settingLanguage', (core.var.selectedLanguage || null), 'title="' + core.fn.lang('settingRestartNeccessary') + '" onchange="core.fn.setting.set(\'settingLanguage\',(this.value)); core.fn.growlNotif(core.fn.lang(\'settingRestartNeccessary\'))"') +
				'<br /><br />' + core.fn.insert.checkbox(core.fn.lang('settingSearchOptionFuzzy'), 'settingFuzzySearch', (core.fn.setting.get('settingFuzzySearch') || 0), 'onchange="core.fn.setting.switch(\'settingFuzzySearch\')"') +
				'<br /><small>' + core.fn.lang('settingSearchOptionFuzzyHint') + '</small>' +
				'<br />' + core.fn.insert.checkbox(core.fn.lang('settingCopyOptionSelector'), 'settingNewWindowCopy', (core.fn.setting.get('settingNewWindowCopy') || 0), 'onchange="core.fn.setting.switch(\'settingNewWindowCopy\')"') +
				'<br /><small>' + core.fn.lang('settingCopyOptionHint') + '</small>' +
				'<br />' + core.fn.insert.checkbox(core.fn.lang('settingNotificationSelector'), 'settingNotificationHide' + updateTracker.latestMajorUpdate(), (core.fn.setting.get('settingNotificationHide' + updateTracker.latestMajorUpdate())), 'onchange="core.fn.setting.switch(\'settingNotificationHide' + updateTracker.latestMajorUpdate() + '\')"', core.fn.lang('settingRestartNeccessary')) +
				'<br /><small>' + core.fn.lang('settingNotificationHint') + '</small>';
		},
		setupModules: function () { //returns module selector
			if (typeof (core.var) !== 'undefined') {
				var moduleSelector = '';
				//create module-selector
				Object.keys(core.var.modules).forEach(function (key) {
					moduleSelector += core.fn.insert.checkbox(core.var.modules[key].display[core.var.selectedLanguage], 'module_' + key, (core.fn.setting.isset('module_' + key) ? core.fn.setting.get('module_' + key) : core.var.modules[key].enabledByDefault), 'onchange="core.var.modules[\'' + key + '\'].enabledByDefault == el(\'module_' + key + '\').checked ? core.fn.setting.unset(\'module_' + key + '\'): core.fn.setting.set(\'module_' + key + '\', el(\'module_' + key + '\').checked); core.fn.growlNotif(core.fn.lang(\'settingRestartNeccessary\'))"', core.fn.lang('settingRestartNeccessary')) + '<br />';
				});
			} else moduleSelector = core.fn.lang('errorLoadingModules');
			return moduleSelector;
		},
		setupKey: function () { //returns password construction - please forgive me the ugly nested javascript creation
			return '<form onsubmit="' +
					'if (!el(\'setupkeyname\').value.trim() || !el(\'setupkeypassword0\').value.trim() || el(\'setupkeypassword0\').value != el(\'setupkeypassword1\').value)' +
						'el(\'keygenresult\').innerHTML=\''+ core.fn.lang('settingKeyError') +'\';' +
					'else el(\'keygenresult\').innerHTML=\'' +
						'<a href=&quot;#&quot; onclick=&quot;core.fn.dynamicMailto(\\\''+ core.var.eMailAddress.admin.address + '\\\', \\\'' + core.fn.lang('settingKeyMailHeader') + '\\\', el(\\\'setupkeyname\\\').value + \\\': \\\' + core.fn.drm.createHash(el(\\\'setupkeyname\\\').value + el(\\\'setupkeypassword0\\\').value));&quot;>'+ core.fn.lang('settingKeyResult') +'</a>' +
					
					'\'; return false;' +
				'">' +
				core.fn.lang('settingKeyName') + '<br /><input type="text" id="setupkeyname" required /><br /><br />' +
				core.fn.lang('settingKeyPassword0') + core.var.drm.pwLength.min + ' - ' + core.var.drm.pwLength.max + '<br /><input type="password" pattern=".{' + core.var.drm.pwLength.min + ',' + core.var.drm.pwLength.max + '}" required id="setupkeypassword0" /><br /><br />' +
				core.fn.lang('settingKeyPassword1') + '<br /><input type="password" required id="setupkeypassword1" /><br /><br />' +
				'<br /><input type="submit" value="' + core.fn.lang('settingKeySubmit') + '" /></form><br />' +
				'<br /><span id="keygenresult"></span>' 
			;
		},
		setupAdvanced: function () { //return advanced settings
			var osSelector = new Object();
			//create os-selector
			Object.keys(core.var.oss).forEach(function (key) {
				osSelector[key] = [key, core.var.oss[key]];
			});

			return '<input type="button" onclick="core.fn.setting.clear(); core.fn.growlNotif(core.fn.lang(\'settingRestartNeccessary\'))" value="' + core.fn.lang('settingResetApp') + '" title="' + core.fn.lang('settingRestartNeccessary') + '" /><br />' +
				'<br />' + core.fn.lang('settingSelectedOsCaption') + ':<br />' + core.fn.insert.select(osSelector, 'settingSelectedOs', 'settingSelectedOs', core.var.selectedOs(), 'onchange="core.fn.setting.set(\'settingSelectedOs\',this.value)"') +
				'<br /><br />' + core.fn.lang('settingFuzzyThresholdCaption') + ':<br /><input type="range" min="0" max="10" value="' + (core.fn.setting.get('settingFuzzyThreshold') || 5) + '" onchange="core.fn.setting.set(\'settingFuzzyThreshold\',(this.value))" />' +
				'<br />' + core.fn.lang('settingGlobalSearchCaption') + ':<br /><input type="range" min="1" max="10" value="' + (core.fn.setting.get('settingGlobalSearchTime') || 3) + '" onchange="core.fn.setting.set(\'settingGlobalSearchTime\',(this.value))" />' +
				'<br />' + core.fn.lang('settinggrowlNotifIntervalCaption') + ':<br /><input type="range" min="1" max="10" value="' + (core.fn.setting.get('settinggrowlNotifInterval') || 2) + '" onchange="core.fn.setting.set(\'settinggrowlNotifInterval\',(this.value))" />' +
				'<br />' + core.fn.lang('settingVarPreloadCaption') + ':<br /><input type="range" min="0" max="1000" step="50" value="' + (core.fn.setting.get('settingVarPreloadTime') || 50) + '" onchange="core.fn.setting.set(\'settingVarPreloadTime\',(this.value))" />' +
				//  as of 2-2020 chrome, edge and ie11 support somewhere (but not exactly) up to 2^11 characters minus mailto:{xxx}?subject={xxx}&body=
				//  only firefox seemingly supports up to 2^15 characters (32768 - the afore mentioned)
				'<br />' + core.fn.lang('settingMailSizeDeterminationCaption') + ':<br /><input type="range" min="100" max="32400" step="300" value="' + ((core.fn.setting.get('settingDirectMailSize') || core.var.directMailSize)) + '" onchange="core.fn.setting.set(\'settingDirectMailSize\',(this.value)); el(\'currentDirectMailSize\').innerHTML=this.value; core.fn.growlNotif(core.fn.lang(\'settingRestartNeccessary\'))" title="' + core.fn.lang('settingRestartNeccessary') + '" />' +
				' <span id="currentDirectMailSize">' + ((core.fn.setting.get('settingDirectMailSize') || core.var.directMailSize)) + '</span><br /><input type="button" onclick="core.fn.maxMailSize()" value="' + core.fn.lang('settingMailSizeDeterminationCheck') + '" title="' + core.fn.lang('settingMailSizeDeterminationHint') + '" />' +
				'<br /><br />' + core.fn.insert.checkbox(core.fn.lang('settingMailtoMethod'), 'settingMailtoMethod', (core.fn.setting.get('settingMailtoMethod') || 0), 'onchange="core.fn.setting.switch(\'settingMailtoMethod\')"');
		},
		setupDebug: function () { //return debugging options
			var settingsDump = '';
			if (this.localStorage.api()) settingsDump = JSON.stringify(localStorage, null, '\t')
			else if (document.cookie.length) document.cookie.split("; ").forEach(function (c) {
				var settings=c.split('=');
				settingsDump += settings[0] + '=' + decodeURIComponent(settings[1]) + '\n';
			});
			return core.fn.insert.checkbox('Console Performance Monitor', 'settingPerformanceMonitor', (core.fn.setting.get('settingPerformanceMonitor') || 0), 'onchange="core.fn.setting.switch(\'settingPerformanceMonitor\')"') +
				'<br />' + core.fn.insert.checkbox('Console Output Monitor', 'settingOutputMonitor', (core.fn.setting.get('settingOutputMonitor') || 0), 'onchange="core.fn.setting.switch(\'settingOutputMonitor\')"') +
				'<br /><br />' + core.fn.lang('settingDebugSpaceCaption') + core.fn.setting.localStorage.remainingSpace() + ' Byte' +
				'<br /><br />'+core.fn.lang('settingDebugDumpCaption')+':<br /><textarea readonly onfocus="this.select()" style="width:100%; height:15em;">' + settingsDump + '</textarea>' +
				'<br /><input type="text" placeholder="'+ core.fn.lang('settingDeleteDistinctPlaceholder') +'" id="deleteDistinctSettings" />' +
				core.fn.insert.icon('delete', 'bigger', false,
					'title="'+ core.fn.lang('settingDeleteDistinctPlaceholder') +'" ' +
					'onclick="el(\'deleteDistinctSettings\').value.split(/\\W/).forEach(function(s){if (s) core.fn.setting.unset(s)});"') +
				'<br />' +
				core.fn.insert.icon('feedbackrequest', 'bigger', false,
					'title="' + core.fn.lang('settingMailDebugDump') +
					'" onclick="core.fn.dynamicMailto(core.var.eMailAddress.admin.address, \'' + core.fn.lang('title') + ' - Debug Settings\')"');
		},
		theme: function (theme) {
			el('colortheme').href = 'core/' + theme + '.css';
			core.fn.setting.set('settingTheme', theme);
		},
		fontsize: function (value) {
			fontsize = document.body.style.fontSize = (value / 10 + 1) + 'em';
			core.fn.setting.set('settingFontsize', value);
		},
		switch: function (name) { // off/false by default
			if (el(name).checked) core.fn.setting.set(name, 1);
			else core.fn.setting.unset(name);
		},

		localStorage: {
			api: function() { //returns boolean whether local storage is accessible
				try {
					localStorage.setItem('void', 'localStorageTest');
					localStorage.removeItem('void');
					return true;
				} catch (e) {
					return false;
				}
			},
			remainingSpace: function(){
				if (this.api()) {
					var max=5000000, current=0; //tested in compatible browsers to be slightly more than 5mb
					Object.keys(localStorage).forEach(function(key){
						current += key.length + localStorage.getItem(key).length;
					});
					return max - current;
				}
				else {
					return 10234 - document.cookie.length; //maximum overall cookie storage size
				}
			}
		},
		set: function (name, value, errormsg) {
			var saved=false;
//			value=core.fn.stringcompression.deflate(value.toString());
			if (this.localStorage.api()) {
				if (this.localStorage.remainingSpace() > name.length + toString(value).length){
					window.localStorage.setItem(name, value);
					saved=true;
				}
			} else {
				var now = new Date(),
					time = now.getTime() + 3600 * 24 * 365 * 1000;
				now.setTime(time);
				
				cookie = name + '=' + encodeURIComponent(value) + '; expires=' + now.toUTCString() + ';';
				cookie = name + '=' + value + '; expires=' + now.toUTCString() + ';';
				if (this.localStorage.remainingSpace() > cookie.length && cookie.length < 4092){
					document.cookie = cookie;
					saved=true;
				}
			}
			if (!saved) core.fn.popup(core.fn.lang('errorStorageLimit')+ (typeof errormsg !=='undefined' ? '<br />' + errormsg : ''));
			return saved;
		},
		get: function (name) {
			var value=false;
			if (this.localStorage.api()) {
				if (window.localStorage.getItem(name) == null) return false;
				else value = window.localStorage.getItem(name);
			} else {
				var x = document.cookie;
				if (x.indexOf(name + '=') > -1) {
					var c = x.substring(x.indexOf(name)),
						start = c.indexOf('=') + 1,
						end = c.indexOf(';') > -1 ? c.indexOf(';') : false;
					value = decodeURIComponent(end ? c.substring(start, end) : c.substring(start));

				} else return false;
			}
//			if (value) return core.fn.stringcompression.inflate(value);
			if (value) return value;
		},
		isset: function (name) {
			if (this.localStorage.api()) {
				if (window.localStorage.getItem(name) == null) return false;
				else return true;
			} else {
				if (document.cookie.indexOf(name + '=') > -1) return true;
				else return false;
			}
		},
		unset: function (name) {
			if (this.localStorage.api()) {
				window.localStorage.removeItem(name);
			} else {
				document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + ';';
			}
		},
		clear: function () { //resets whole application
			if (this.localStorage.api()) {
				window.localStorage.clear();
			} else {
				document.cookie.split(";").forEach(function (c) {
					document.cookie = c.replace(/^ +/g, "").replace(/=.*/g, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;");
				});
			}
		}
	},
	stringcompression: {
		// this makes sense for expectable long strings that have to be uricomponent-encoded to save up a bit storage space e.g. within cookies converting the string with base64 encoding
		// do not use generally for short strings being bloated up (like settings etc) 
		compress: function(str) {
			// encodeURIComponent to get percent-encoded UTF-8, convert the percent encodings into raw bytes which can be fed into btoa.
			return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
				function toSolidBytes(match, p1) {
					return String.fromCharCode('0x' + p1);
			}));
		},
		decompress: function(str) {
			// from bytestream, to percent-encoding, to original string.
			return decodeURIComponent(atob(str).split('').map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
		}
	},
	drm: {
		table: function(table){
			return core.var.drm.data[core.var.drm.translate[table]];
		},
		createHash: function(str) {
			var hash = 0, i;
			for (i = 0; i < str.length; i++) {
				hash  = (hash * 31) + str.charCodeAt(i) | 0;
			}
			return hash;
		},
		searchHash: function(hashTable, hash){
			var found = false;
			Object.keys(hashTable).forEach(function (key) {
				if (hashTable[key] == hash) { found = key}
			});
			return found;
		},
		encryptToken:function(base36Timestamp, name, password){
			// encrypt with unknown password length
			// ridiculous high divisor because large numbers will be parsed with scientific exponent in ie
			// Math.round for floating errors
			return Math.round((this.createHash(name+password) * password.length * parseInt(base36Timestamp, 36) / Math.pow(2,22))).toString(36);
		},
		decryptToken:function(hashTable, base36Timestamp, token){
			// Math.round for floating errors
			var embeddedhash = Math.round(parseInt(token, 36) * Math.pow(2,22) / parseInt(base36Timestamp, 36)), i, possible, found;
			// brute force password length but return name only
			// reversed engineering might get the password length but not the actual password
			for (i = core.var.drm.pwLength.min; i < core.var.drm.pwLength.max; i++){
				possible = Math.round(embeddedhash / i);
				found = this.searchHash(hashTable, possible) || false;
				if (found) break;
			}
			return found;
		}
	},
	
	init: function (query) { //displays start screen
		core.fn.stdout('input',
			'<form id="search" action="javascript:globalSearch.search(el(\'globalsearch\').value);">' +
			'<input type="text" pattern=".{3,}" id="globalsearch" placeholder="' +
			core.fn.lang('globalSearchPlaceholder') + '" class="search" value="' + value(query).replace(/"/g,'&quot;') + '" />' +
			'<span onclick="globalSearch.search(el(\'globalsearch\').value);" class="search">' + core.fn.insert.icon('search') + '</span>' +
			'<input type="submit" id="submit" value="' + core.fn.lang('formSubmit') + '" hidden="hidden" /> ' +
			'</form>');
		el('globalsearch').focus();
		var eMailList = core.fn.lang('importantMails') + '<p>';
		Object.keys(core.var.eMailAddress).forEach(function(key){
			eMailList += '<a href="mailto:' + core.var.eMailAddress[key].address + '">' + core.fn.insert.icon('mail') + core.var.eMailAddress[key].display[core.var.selectedLanguage]+ '</a><br />';
		});
		eMailList += '</p>';
		core.fn.stdout('temp',
			core.fn.lang('greeting') + '<br />' +
			(core.var.letterTemplate ? '<br /><a href="' + core.var.letterTemplate + '" target="_blank">' +
				core.fn.insert.icon('word') + core.fn.lang('openLetterTemplate') + '</a><br />' : '') +
			(core.var.outlookWebUrl ? '<br /><a href="' + core.var.outlookWebUrl + '" target="_blank">' +
				core.fn.insert.icon('outlook') + core.fn.lang('openOutlook') + '</a><br />' : '') +
			(core.var.publishedFolder ? '<br /><a href="' + core.var.publishedFolder + '" target="_blank">' +
				core.fn.insert.icon('pdf') + core.fn.lang('openPublishedFolder') + '</a><br />' : '') +
			'<br /><br /><div class="items items71" onclick="core.fn.toggleHeight(this)">' + core.fn.insert.expand() + eMailList + '</div>' +
			'<br /><br /><div id="randomTip">' + randomTip.show() + '</div>'
			);
		core.fn.stdout('output', '');
		core.var.currentScope = null;
		Object.keys(core.var.modules).forEach(function (key) {
			if (el('module' + key) != 'undefined' && el('module' + key) != null) el('module' + key).checked = false;
		});
		document.title = core.fn.lang('title')
		if (typeof query !== 'undefined') globalSearch.search(query);
		el('temp').classList.remove('contentWide')
		core.history.write(['core.fn.init(\'' + value(query) + '\')']);
	},
};
core.history = { //stores and restores last actions. since last actions can only occur after loading the modules scripts into scope
	// there is no need to recall these, just call the modules functions. however not all settings within the module can
	// be accessed through history. slidersettings are either stored as global setting or not at all.
	// history will only store last modules, submodules and queries. store an array as a sequence of necessary function calls
	// to come back to the desired point e.g.
	// core.fn.history.write(['core.fn.init()',''globalSearch(\'' + search + '\')'']);
	// or use api-like callbacks within the modules
	// this was implemented after performance monitor. you will see the parameters looking similar but since history
	// will handle sequential callbacks as opposed to performance tracking this was not combined on purpose
	// initialize history as array
	storage: [],
	currentStep: 1,
	write: function (point) {
		function areDifferent(a1, a2) {
			if (typeof a1 === 'undefined') return true;
			var i = a1.length;
			while (i--) {
				if (a1[i] !== a2[i]) return true;
			}
			return false;
		}
		if (areDifferent(core.history.storage[core.history.storage.length - (core.history.currentStep)], point)) {
			core.history.storage.splice(core.history.storage.length - (core.history.currentStep - 1));
			core.history.storage.push(point);
			core.history.currentStep = 1;
			core.history.buttoncolor();
		}
	},
	go: function (dir) {
		if (dir === 'back') core.history.currentStep = ++core.history.currentStep <= core.history.storage.length ? core.history.currentStep : core.history.storage.length;
		else core.history.currentStep = --core.history.currentStep > 0 ? core.history.currentStep : 1;
		if (typeof core.history.storage[core.history.storage.length - core.history.currentStep] !== 'undefined') {
			core.history.storage[core.history.storage.length - core.history.currentStep].forEach(function (key) {
				core.var.currentScope = key.substring(0, key.indexOf('.')) != 'core' ? key.substring(0, key.indexOf('.')) : null;
				document.title = core.fn.lang('title') + (core.var.currentScope ? ' - ' + core.var.modules[core.var.currentScope].display[core.var.selectedLanguage] : '');
				slider.slide(core.var.currentScope);
				if (core.var.currentScope != null && core.var.modules[core.var.currentScope].wide) el('temp').classList.add('contentWide');
				else el('temp').classList.remove('contentWide');
				core.performance.start(key);
				eval(key);

			});
		}
		core.history.buttoncolor();
	},
	buttoncolor: function () {
		//classList.add and *.remove not supported for svg in ie
		if (core.history.currentStep < 2)
			svgClassList.add(el('titleforthbutton'), 'inactiveicon');
		else svgClassList.remove(el('titleforthbutton'), 'inactiveicon');
		if (core.history.currentStep === core.history.storage.length)
			svgClassList.add(el('titlebackbutton'), 'inactiveicon');
		else svgClassList.remove(el('titlebackbutton'), 'inactiveicon');

	}
};
core.performance = { //starts and dispays timers to console, assigned with function calls and can display additional results
	start: function (track, group) {
		if (core.fn.setting.get('settingPerformanceMonitor')) {
			if (typeof group !== 'undefined') console.group(track);
			console.time(track);
		}
	},
	stop: function (track, info, group) {
		if (core.fn.setting.get('settingPerformanceMonitor')) {
			console.groupCollapsed(track);
			console.timeEnd(track);
			console.trace();
			if (typeof info !== 'undefined' && info) {
				if (isIE()) console.log(info);
				else {
					if (typeof info === 'object') {
						console.groupCollapsed('\u2b91 additional info:');
						console.table(info);
						console.groupEnd();
					} else console.log('\u2b91 ' + info);
				}
			}
			console.groupEnd();
			if (typeof group !== 'undefined') console.groupEnd();
		}
	},

};

// mainfile functions and objects
var slider = { //just fancy animation of content on module change
	modules: new Array(null),
	recent: 0,
	slide: function (mod) {
		el('content').classList.remove('slideup', 'slidedown');
		var newone = el('content').cloneNode(true);
		el('content').parentNode.replaceChild(newone, el('content'));
		core.fn.stdout(['input', 'temp', 'output'], '');
		if (slider.modules.indexOf(mod) > slider.recent) el('content').classList.add('slideup')
		if (slider.modules.indexOf(mod) < slider.recent) el('content').classList.add('slidedown')

		slider.recent = slider.modules.indexOf(mod)
	}
};

function select_module() { //load module list and return the main menu
	if (typeof (core.var.modules) !== 'undefined') {
		var output = '<span style="font-size:200%; line-height:200%">' + core.var.logo + core.fn.lang('title', false) + '</span>';
		Object.keys(core.var.modules).forEach(function (key) {
			if (typeof core.var.modules[key] === 'object' && (core.fn.setting.isset('module_' + key) ? eval(core.fn.setting.get('module_' + key)) : core.var.modules[key].enabledByDefault)) {
				//create module-selector
				opt = 'modules/' + key + '.js';
				output += '<input type="radio" name="modulemenu" id="module' + key + '" /><label for="module' + key + '" title="' + core.var.modules[key].display[core.var.selectedLanguage] + '" onclick="slider.slide(\'' + key + '\'); core.fn.loadScript(\'' + opt + '\', \'' + key + '.fn.init(\\\'\\\')\'); return;">' + core.var.modules[key].icon + core.var.modules[key].display[core.var.selectedLanguage] + '</label>';
				slider.modules.push(key);
			}
		});
		core.fn.stdout('menu', output);
	} else core.fn.popup(core.fn.lang('errorLoadingModules'));
}

function selectText(element) { //selection of output-content on click if not disabled
	if (core.var.currentScope != null && (eval(core.var.currentScope).var.disableOutputSelect === "undefined" || !(eval(core.var.currentScope).var.disableOutputSelect))) {
		if (core.fn.setting.get('settingNewWindowCopy')) {
			var win = window.open("", "win"),
				doc = win.document;
			doc.open("text/html", "replace");
			doc.write('<html><head><title>' + core.fn.lang('copycontentNewWindowCaption') + '</title><style>body {font-family:\'' + core.var.corporateFontFace + '\'; font-size:' + core.var.corporateFontSize + '; background-color:' + window.getComputedStyle(document.body, "").getPropertyValue("background-color") + '; font-color:' + window.getComputedStyle(document.body, "").getPropertyValue("color") + ';}</style></head><body onclick="window.self.close()"><div id="text">' + el(element).innerHTML + '</div></body></html>');
			doc.close();

			var text = doc.getElementById('text'),
				range, selection;
		} else {
			var doc = document,
				text = doc.getElementById(element),
				range, selection, win = window.self;
		}

		if (doc.body.createTextRange) {
			range = doc.body.createTextRange();
			range.moveToElementText(text);
			range.select();
		} else if (window.getSelection) {
			selection = win.getSelection();
			range = doc.createRange();
			range.selectNodeContents(text);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}
}

var globalSearch = { //searches all modules using their api-methods from the start page
	result: {},
	contribute: function (property, value) {
		if (typeof this.result[property] === 'undefined') this.result[property] = [value];
		else this.result[property].push(value);
	},
	search: function (search) {
		if (value(search) != '') {
			core.performance.start('globalSearch', 'group');
			document.body.style.cursor = 'progress';
			var delay = 0;
			//clear result on search initialization
			globalSearch.result = {};
			//load every module and fire api. api appends its result to the global search result because of asynchronous loading.
			Object.keys(core.var.modules).forEach(function (key) {
				if (typeof core.var.modules[key] === 'object') {
					//load every module and fire api function
					opt = 'modules/' + key + '.js';
					core.fn.loadScript(opt, key + '.api.available(\'' + search + '\')');
				}
			});
			setTimeout(function () {
				globalSearch.display()
			}, (core.fn.setting.get('settingGlobalSearchTime') || 3) * 1000);
			core.history.write(['core.fn.init(\'' + search + '\')']);
		}
	},
	display: function () {
		if (Object.keys(this.result).length) {
			var displayResult = '<br />';
			Object.keys(this.result).forEach(function (mod) {
				displayResult += '<div class="items items143" onclick="core.fn.toggleHeight(this)">' +
					core.fn.insert.expand() +
					core.var.modules[mod].icon + core.var.modules[mod].display[core.var.selectedLanguage] + '<br />';
				globalSearch.result[mod].sort(core.fn.sortBySecondColumn);
				globalSearch.result[mod].forEach(function (key) {
					//console.log(mod,key);
					displayResult += key[0] + '<br />';
				});
				displayResult += '</div>';
			});
		} else var displayResult = core.fn.lang('errorNothingFound', null, el('globalsearch').value);
		core.fn.stdout('output', displayResult);
		document.body.style.cursor = 'default';
		core.performance.stop('globalSearch', null, 'endgroup');
	}
};