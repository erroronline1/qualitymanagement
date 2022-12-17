pyreq_filter.data = {
	processfilter: {
		//"defaultset": 0,
		"sets": [{
			//"source": "Export.+?\\.csv",
			"sourceformat": "\\\"(.*?)\\\"",
			"headerrowindex": 0,
			"destination": "filtered.csv",
			"columns": [
				"ORIGININDEX",
				"SOMEDATE",
				"CUSTOMERID",
				"NAME",
				"DEATH",
				"AID",
				"PRICE",
				"DELIVERED",
			],
			"filter": [{
					"comment": "keep if all general patterns match",
					"keep": true,
					"patterns": {
						"all": {
							"DELIEVERED": "delivered",
							"NAME": ".+?"
						}
					}
				},
				{
					"comment": "discard if any general exclusions match",
					"keep": false,
					"patterns": {
						"any": {
							"DEATH": ".+?",
							"NAME": "company|special someone",
							"AID": "repair|cancelling|special.*?names"
						}
					}
				},
				{
					"comment": "discard if value is below 400 unless pattern matches",
					"keep": false,
					"patterns": {
						"all": {
							"PRICE": "^[2-9]\\d\\D|^[1-3]\\d{2,2}\\D",
							"AID": "^(?!(?!.*(not|those)).*(but|these|surely)).*"
						}
					}
				}
			],
			"concentrate": [{
					"comment": "discard by identifier and date diff in months, do not contact if last event within x months",
					"keep": false,
					"date": {
						"identifier": "CUSTOMERID",
						"column": "SOMEDATE",
						"format": ["d", "m", "y"],
						"threshold": 6,
						"bias": "<"
					}
				},
				{
					"comment": "keep amount of duplicates of concatenated column(s) value(s), ordered by another column (asc/desc)",
					"keep": true,
					"duplicates": {
						"orderby": ["ORIGININDEX"],
						"descending": false,
						"column": "CUSTOMERID",
						"amount": 1
					}
				},
				{
					"comment": "discard explicit excemptions as stated in excemption file, based on same identifier. source with absolute path or in the same working directory",
					"keep": false,
					"compare": {
						"source": "excemptions.*?.csv",
						"sourceformat": "(.+?)[;\\s]",
						"headerrowindex": 0,
						"patterns": {
							"COMPAREFILEINDEX": {
								"correspond": "ORIGININDEX"
							},
							"COMPAREFILEDELIVERED": {
								"match": "^delivered"
							}
						}
					}
				},
				{
					"comment": "discard by not matching interval in months, optional offset from initial column value",
					"keep": false,
					"interval": {
						"column": "SOMEDATE",
						"format": ["d", "m", "y"],
						"interval": 6,
						"offset": 0
					}
				}
			],
			"evaluate": {
				"EMAIL": "^((?!@).)*$"
			}
		}]
	},
	stocklistfilter: {
		"module": {
			"translate": {
				"____filter": "extend or reduce filters, filters can be regex (case insensitive), single strings or lists with strings but no booleans or integers",
				"filter": {
					"ORDERSTOP": "true"
				},
				"____destination": "choose destination file/path and add wrapping strings to convert a json-dump into a javascript object. modified DATE-string will be replaced with generation date.",
				"destination": "D:\\Quality Management\\assistant\\library\\module.data\\stocklist.data.stocklist.js",
				"wrapstart" :"//this file was automatically created by the assistants filter module\nstocklist.data.stocklist={modified: \"DATE\", content:",
				"wrapend": "};",
				"____unionbyoutputcolumn": "occasionally there are multiple entries in the source file with the same identifier that can be unified",
				"unionbyoutputcolumn": 1,
				"____readcolumns" : "fields have to be lists, even with single entries. lists will be concatenated, values can be processed by global translate or scoped pick, 'process' can either be omitted or set to false",
				"readcolumns": {
					"Item-ID": {
						"fields": ["ID"]
					},
					"Distributor": {
						"fields": ["DISTRIBUTOR"]
					},
					"Article Name": {
						"fields": ["CAPTION"]
					},
					"Order Number": {
						"fields": ["NUMBER"]
					},
					"Package Size": {
						"fields": ["QUANTITY"],
						"process": "translate"
					},
					"Additional Information": {
						"fields": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
					}
				},
				"____static": "this will be added to every element from the output",
				"static": {
					"Documents": "D:/DistributorDocuments"
				}
			},
			"split": {
				"____filter": "extend or reduce filters, filters can be regex (case insensitive), single strings or lists with strings but no booleans or integers",
				"filter": {
					"ORDERSTOP": "true",
					"REPOSITORY": ["0", "1", "21"]
				},
				"____prefix": "add something to the beginning of the output filenames",
				"prefix": "List_",
				"____splitbycolumns": "the input file will be splitted according to the different case insensitive matched values in these columns. you better not mess around with identifiers, product names or other diverse values",
				"splitbycolumns": {
					"REPOSITORY": "(.*)",
					"STORAGE": "([\\w\\d\\s]+)(?:.*)"
				},
				"____orberbyoutputcolumn": "output files will be sorted in ascending order of the column number (not index 0) of the output table",
				"orderbyoutputcolumn": 3,
				"____xlsxwidth": "number of points to width of the excelsheet to handle procentual column widths for readcolumns",
				"xlsxwidth": 120,
				"____readcolumnd" : "fields have to be lists, even with single entries. lists will be concatenated, values can be processed by global translate or scoped pick, 'process' can either be omitted or set to false, width can be set in percents for xlsx-output",
				"readcolumns": {
					"Item-ID": {
						"fields": ["ID"],
						"width": 5
					},
					"Distributor": {
						"fields": ["DISTRIBUTOR"],
						"width": 8
					},
					"Article Name": {
						"fields": ["CAPTION"],
						"width": 25
					},
					"Order Number": {
						"fields": ["NUMBER"],
						"width": 15
					},
					"Package Size": {
						"fields": ["QUANTITY"],
						"process": "translate",
						"width": 5
					},
					"Last Order": {
						"fields": ["LAST_ORDER"],
						"process": "pick",
						"width": 7
					},
					"Additional Information": {
						"fields": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
						"process": false,
						"width": 10
					}
				},
				"____static": "this will be added to every element from the output, formulas are allowed as well but have to be english for xslx!",
				"static": {
					"Quantity": "",
					"Calculation": "=INDIRECT(\"G\"&ROW())"
				},
				"____pick": "take only parts of value as selected by first regex (case sensitive) item, multiple results will be concatenated with second string item",
				"pick": {
					"LAST_ORDER": ["(\\S+)(?:\\s.*)", " "]
				}
			}
		},
		"____source": "if filename is regex, the last touched file will be used. set up row (not index 0) of header row.",
		"source": "ARTICLEMANAGER.CSV",
		"headerrow": 2,
		"____headersourceformat": "csv styles differ so one of the regexes (case insensitive) hopefully will identify header values correctly (with or without quotes)",
		"headersourceformat": ["\"(.+?)\"[;\\s]", "(.+?)[;\\s]"],
		"____sanitize": "replace faulty characters or stupid values with nothing, extend the lists as needed",
		"sanitize": {
			"chars": ["\""],
			"values": ["null"]
		},
		"____translate": "replace e.g. numerical values with legible translations. extend as needed",
		"translate": {
			"QUANTITY": {
				"1": "piece",
				"2": "pair",
				"4": "metre",
				"5": "set",
				"6": "litre",
				"7": "square metre",
				"8": "bag"
			},
			"REPOSITORY":{
				"1": "Central",
				"2": "Department 1",
				"3": "Department 2",
				"4": "Office"
			}
		}
	}
};