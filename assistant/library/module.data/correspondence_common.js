//extend language-model object "core.function.languageBricks"

var additionalOptions = false;

var correspondence_common_data= {
	//contents.property:{language:['first person', 'third person']}
	null: {
		title: "Select Topic...",
		contents: {}
	},
	versandschreiben: {
		title: "Appointment",
		contents: {
			anschreiben: {
				en: ["$salutation$,<br /><br />we ask $sie2$ to get in contact with us to make an appointment.<br />Sincerely<br /><br />Company XYZ",
					"$salutation$,<br /><br />we ask $ihn$ to get in contact with us to make an appointment.<br />Sincerely<br /><br />Company XYZ"
				],
				de: ["$salutation$,<br /><br />wir bitten $sie2$ darum $sich$ mit uns zur Terminvereinbarung in Verbindung zu setzen.<br />Mit freundlichen Grüßen<br /><br />Firma XYZ.",
					"$salutation$,<br /><br />wir bitten $ihn$ darum sich mit uns zut Terminvereinbarung in Verbindung zu setzen.<br />Mit freundlichen Grüßen<br /><br />Firma XYZ."
				]

			}
		}
	},
};