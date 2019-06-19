//language builder concerning $dummies$ in js-data-files. can be extended in external js-data-files (recommended) or module-scripts
core.function.languageSynthesis={
	// case:{	language:[ child male, child female, adult male, adult female]}
	// this is awkward in english but makes the most sense in german. i don't know about other languages.
	// sometimes this method requires special phrasing, but most of the time it gets the job well done.
	// items must not be empty otherwise output method gets undefined and awaits a function that istn't there, returns error
	// methods for language mostly to be found in external js-data-files
	er:{	en:['he', 'she', 'he', 'she'],
			de:['der Kunde', 'die Kundin','der Kunde', 'die Kundin']},
	ihm:{	en:['him', 'her', 'him', 'her'],
			de:['dem Kunden', 'der Kundin','dem Kunden', 'der Kundin']},
	dessen:{en:['his', 'her', 'his', 'her'],
			de:['des Patienten', 'der Patientin', 'des Patienten', 'der Patientin']},
	ihn:{	en:['him', 'her', 'him', 'her'],
			de:['den Kunden', 'die Kundin', 'den Kunden', 'die Kundin']},

	sie:{	en:['you', 'you', 'you', 'you'],
			de:['Du', 'Du', 'Sie', 'Sie']},
	sie2:{	en:['you', 'you', 'you', 'you'],
			de:['Dich', 'Dich', 'Sie', 'Sie']},
	sich:{	en:['you', 'you', 'you', 'you'],
			de:['Dich', 'Dich', 'sich', 'sich']},

	salutation:{	en:['Dear ', 'Dear ', 'Dear Mr. ', 'Dear Mrs. '],
					de:['Lieber ', 'Liebe ', 'Sehr geehrter Herr ', 'Sehr geehrte Frau ']},
	shortname:{		en:[' ', ' ', 'Mr. ', 'Mrs. '],
					de:[' ', ' ', 'Herr ', 'Frau ']},
	shortnameaccusativ:{en:[' ', ' ', 'Mr. ', 'Mrs. '],
					de:[' ', ' ', 'Herrn ', 'Frau ']},

	longname:{ en:function(){return el('name').value;},
				de:function(){return el('name').value;}},

	outputLanguage:function(){
		try {/* if language selection is available */ return core.var.registeredLanguages[document.querySelector('input[name="lang"]:checked').id][0] || core.var.selectedLanguage;}
		catch (e) {return core.var.selectedLanguage;}},
	output:function(block){
		var withname=['salutation','shortname','shortnameaccusativ'], name, index=0;
		if (el('adult')) if(el('adult').checked) index=2;
		if (el('female')) if(el('female').checked) index+=1;
		if (withname.indexOf(block)>-1) {
			if (el('name').value){
				var namen=el('name').value.trim().split(' ');
				if (el('adult')) if(el('adult').checked) name=namen[namen.length-1]; 
				if (el('child')) if(el('child').checked) name=namen[0];
				
				return this[block][this.outputLanguage()][index]+name
			}
		}
		try { return this[block][this.outputLanguage()][index] || this[block][this.outputLanguage()]();}
		catch (e) {console.log(e+' handling '+block)};
	},
};
