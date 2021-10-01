correspondence.var = {
	lang: {
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
		common: {
			en: 'common',
			de: 'Allgemein'
		},
	},
	selectedModule: function () {
		return el('submodule').options[el('submodule').selectedIndex].value || 'common';
	},
	disableOutputSelect: false,
};