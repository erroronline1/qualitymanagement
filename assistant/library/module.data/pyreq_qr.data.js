pyreq_qr.data = {
	appointment: {
		en: function (dates) {
			return 'BEGIN:VEVENT\n' +
				'SUMMARY:' + dates.cause + '\n' +
				'LOCATION:Company, Street, City\n' +
				'DESCRIPTION:' + (dates.details ? dates.details : dates.cause) + '\n' +
				'DTSTART:' + dates.start + '\n' +
				'DTEND:' + dates.end + '\n' +
				'BEGIN:VALARM\n' +
				'TRIGGER;RELATED=START:-PT120M\n' +
				'ACTION:DISPLAY\n' +
				'END:VALARM\n' +
				'END:VEVENT';
		},
		de: function (dates) {
			return pyreq_qr.data.appointment.en(dates);
		}
	},
	labelling: {
		en: function (form) {
			return 'Custom Made' +
				'Name: ' + form.name + '\n' +
				'Date of birth: ' + form.dob + '\n' +
				'Aid: ' + form.aid + '\n' +
				'Delivered: ' + form.delivered +
				(form.process ? '\nProcess number: ' + form.process : '') +
				(form.id ? '\nPatient ID: ' + form.id : '')
		},
		de: function (form) {
			return 'Sonderanfertigung' +
				'Name: ' + form.name + '\n' +
				'Geburtsdatum: ' + form.dob + '\n' +
				'Hilfsmittel: ' + form.aid + '\n' +
				'Lieferdatum: ' + form.delivered +
				(form.process ? '\nVorgangsnummer: ' + form.process : '') +
				(form.id ? '\nPatienten Nummer: ' + form.id : '')
		}
	},
};