//extend language-model object "core.fn.languageBricks"

core.fn.languageSynthesis.cCom_switch = {
	en: function () {
		return el('switch').checked ? 'has been selected' : 'has not been selected';
	},
	de: function () {
		return el('switch').checked ? 'wurde gewählt' : 'wurde nicht gewählt';
	}
};

correspondence.data.common = {
	/* topic:{
		title: {langage: "for dropdown-selection"},
		controls:'',
		contents:{
			chunk:{
				language:["group", "title", "preselected",
								"first person wording",
								"third person wording"
				]
			}
		}
	}*/
	null: {
		title: {
			en: 'Select Topic...',
			de: 'Thema wählen...'
		},
		controls: "",
		contents: {}
	},
	appointment: {
		title: {
			en: 'Appointment',
			de: 'Terminvereinbarung'
		},
		controls: '<div class="inline">' +
			core.fn.static.insert.radio(core.fn.static.lang('inputOptionMale', 'correspondence'), 'sex', 'male', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
			core.fn.static.insert.radio(core.fn.static.lang('inputOptionFemale', 'correspondence'), 'sex', 'female', false, 'onchange="correspondence.fn.gen()"') + ' ' +
			'</div><div class="inline">' +
			core.fn.static.insert.radio(core.fn.static.lang('inputOptionFirstperson', 'correspondence'), 'person', 'firstperson', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
			core.fn.static.insert.radio(core.fn.static.lang('inputOptionThirdperson', 'correspondence'), 'person', 'thirdperson', false, 'onchange="correspondence.fn.gen()"') + ' ' +
			'</div><div class="inline">' +
			core.fn.static.languageSelection('onchange="correspondence.fn.gen()"').join('<br />') +
			'</div><div class="inline">' +
			core.fn.static.insert.radio(core.fn.static.lang('inputOptionFormal', 'correspondence'), 'age', 'adult', 1, 'onchange="correspondence.fn.gen()"') + '<br />' +
			core.fn.static.insert.radio(core.fn.static.lang('inputOptionInformal', 'correspondence'), 'age', 'child', false, 'onchange="correspondence.fn.gen()"') + '' +
			'</div>',
		contents: {
			letter: {
				en: ["text", "Text", 1,
					"$salutation$,<br /><br />we ask $sie2$ to get in contact with us to make an appointment.<br />Sincerely<br /><br />Company XYZ",
					"$salutation$,<br /><br />we ask $ihn$ to get in contact with us to make an appointment.<br />Sincerely<br /><br />Company XYZ"
				],
				de: ["text", "Text", 1,
					"$salutation$,<br /><br />wir bitten $sie2$ darum $sich$ mit uns zur Terminvereinbarung in Verbindung zu setzen.<br />Mit freundlichen Grüßen<br /><br />Firma XYZ.",
					"$salutation$,<br /><br />wir bitten $ihn$ darum sich mit uns zut Terminvereinbarung in Verbindung zu setzen.<br />Mit freundlichen Grüßen<br /><br />Firma XYZ."
				]

			}
		}
	},
	example: {
		title: {
			en: 'Example',
			de: 'Beispiel'
		},
		controls: '<div class="inline">' +
			core.fn.static.insert.checkbox('Button', 'switch', false,'onchange="correspondence.fn.gen()"') + '<br />' +
			'</div>',
		contents: {
			letter: {
				en: ["text", "Text", 1,
					"The switch with extended language model $cCom_switch$.",
					"The switch with extended language model $cCom_switch$."
				],
				de: ["text", "Text", 1,
					"Der Schalter mit erweitertem Sprachmodell $cCom_switch$.",
					"Der Schalter mit erweitertem Sprachmodell $cCom_switch$."
				]

			}
		}
	},
};