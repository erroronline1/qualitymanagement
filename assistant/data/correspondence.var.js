if (typeof correspondence === 'undefined') var correspondence = {};

correspondence.var = {
	lang: {
		inputLoadSubmoduleDefault: {
			en: 'select department...',
			de: 'Bereich wählen...'
		},
		inputLoadTopicDefault: {
			en: 'select topic...',
			de: 'Thema wählen...'
		},
		inputPlaceholder: {
			en: 'first name / last name recipient',
			de: 'Vor-/ Nachname Adressat'
		},
		inputOptionMale: {
			en: 'male',
			de: 'männlich'
		},
		inputOptionFemale: {
			en: 'female',
			de: 'weiblich'
		},
		inputOptionFirstperson: {
			en: 'personally',
			de: 'persönlich'
		},
		inputOptionThirdperson: {
			en: 'for third prson',
			de: 'für dritten'
		},
		inputOptionFormal: {
			en: 'formal',
			de: 'förmlich'
		},
		inputOptionInformal: {
			en: 'informal',
			de: 'persönlich'
		},
	},
	submodules: {
		select: ['', ''],
		allgemein: ['correspondence_common', 'common'],
	},
	selectedModule: function () {
		return el('submodule').options[el('submodule').selectedIndex].value || this.presetModule;
	},
	selectedObject: function () {
		return eval(correspondence.var.selectedModule() + '_data');
	},
	disableOutputSelect: false,
};