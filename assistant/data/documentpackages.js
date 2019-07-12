// folder-separators have to be / instead of / because / being an escape string that can not be handled with replace()
// document-references could be just files with a quality filename or a two-dimensional array with url and description

var EXCEPTIONS = {
	versorgt: {
		docs: [
			"E:/Quality Management/published/Attendance List.pdf",
		],
		notsuitable: [
			"PackageII",
		]
	},
	noserialprint: ["E:/Quality Management/published/Sample Form.pdf"],
};

var JSONDATA = {
	PackageI: {
		CategoryI: {
			primary: [
				"E:/Quality Management/published/Sample Form.pdf",
				"E:/Quality Management/published/Another Sample Form.pdf",
				"E:/Quality Management/published/Protocol.pdf",
			],
			secondary: [
				"E:/Quality Management/published/Process Instruction.pdf",
				"E:/Quality Management/published/Another Process Instruction .pdf",
			]
		},
		CategoryII: {
			primary: [
				"E:/Quality Management/published/Sample Form.pdf",
				"E:/Quality Management/published/Protocol.pdf",
			],
			secondary: [
				"E:/Quality Management/published/Process Instruction.pdf",
			]
		},
	},
	PackageII: {
		CategoryI: {
			primary: [
				"E:/Quality Management/published/Having Several Dozen Documents Making This System Plausible.pdf",
			],
			secondary: []
		},
	},
};