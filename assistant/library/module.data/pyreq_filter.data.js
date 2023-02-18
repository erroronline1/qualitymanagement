pyreq_filter.data = {
	processfilter: {
		//"defaultset": 0,
		"sets": [{
			"useCase": "This filter works so-and-so and you need to prepare the source files like that...",
			"filesetting": {
				"source": "Export.+?\\.csv",
				"sourceformat": ["\\\"(.*?)\\\"", "(.+?)[;\\r\\n]"],
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
			},
			"filter": [{
					"apply": "filter_by_expression",
					"comment": "keep if all general patterns match",
					"keep": true,
					"match": {
						"all": {
							"DELIEVERED": "delivered",
							"NAME": ".+?"
						}
					}
				},
				{
					"apply": "filter_by_expression",
					"comment": "discard if any general exclusions match",
					"keep": false,
					"match": {
						"any": {
							"DEATH": ".+?",
							"NAME": "company|special someone",
							"AID": "repair|cancelling|special.*?names"
						}
					}
				},
				{
					"apply": "filter_by_expression",
					"comment": "discard if value is below 400 unless pattern matches",
					"keep": false,
					"match": {
						"all": {
							"PRICE": "^[2-9]\\d\\D|^[1-3]\\d{2,2}\\D",
							"AID": "^(?!(?!.*(not|those)).*(but|these|surely)).*"
						}
					}
				}, {
					"apply": "filter_by_monthdiff",
					"comment": "discard by identifier and date diff in months, do not contact if last event within x months",
					"keep": false,
					"date": {
						"column": "SOMEDATE",
						"format": ["d", "m", "y"],
						"threshold": 6,
						"bias": "<"
					}
				},
				{
					"apply": "filter_by_duplicates",
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
					"apply": "filter_by_comparison_file",
					"comment": "discard explicit excemptions as stated in excemption file, based on same identifier. source with absolute path or in the same working directory",
					"keep": false,
					"filesetting": {
						"source": "excemptions.*?.csv",
						"sourceformat": ["\\\"(.*?)\\\"", "(.+?)[;\\r\\n]"],
						"headerrowindex": 0,
						"columns": [
							"COMPAREFILEINDEX"
						]
					},
					"filter": [],
					"match": {
						"all": {
							"ORIGININDEX": "COMPAREFILEINDEX"
						}
					}
				},
				{
					"apply": "filter_by_monthinterval",
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
			"modify": {
				"add": {
					"ANEWCOLUMN": "defaultvalue",
				},
				"replace": {
					"AID": ["match", "replacement value"]
				}
			},
			"evaluate": {
				"EMAIL": "^((?!@).)*$"
			}
		}]
	},
	stocklistfilter: {
		"sets": [{
			"filesetting": {
				"source": "ARTICLEMANAGER.CSV",
				"sourceformat": ["\\\"(.*?)\\\"", "(.+?)[;\\r\\n]"],
				"headerrowindex": 1,
				"destination": "List.xlsx",
				"columns": [
					"ID",
					"DISTRIBUTOR",
					"CAPTION",
					"NUMBER",
					"QUANTITY",
					"LAST_ORDER",
					"INFORMATION",
					"MODEL_NAME",
					"SIZE_NAME",
					"COLOR_NAME",
					"ORDERSTOP"
				]
			},
			"filter": [{
					"apply": "filter_by_expression",
					"comment": "keep if all general patterns match",
					"keep": false,
					"match": {
						"any": {
							"ORDERSTOP": "true",
							"ORDERSTOP": ["0", "1", "21"]
						}
					}
				},
				{
					"apply": "filter_by_duplicates",
					"comment": "keep amount of duplicates of column value, ordered by another concatenated column values (asc/desc)",
					"duplicates": {
						"orderby": ["ID"],
						"descending": false,
						"column": "ID",
						"amount": 1
					}
				},
			],
			"modify": {
				"translate": {
					"QUANTITY": "QUANTITY"
				},
				"replace": [
					[null, "\"", ""],
					[null, ";", ","]
				],
				"rewrite": [{
					"Item-ID": ["ID"],
				}, {
					"Distributor": ["DISTRIBUTOR"],
				}, {
					"Article Name": ["CAPTION"],
				}, {
					"Order Number": ["NUMBER"],
				}, {
					"Package Size": ["QUANTITY"],
				}, {
					"Last Order": ["LAST_ORDER"],
				}, {
					"Additional Information": ["INFORMATION", "MODEL_NAME", "SIZE_NAME", "COLOR_NAME"],
				}],
				"add": {
					"Quantity": "",
					"Calculation": "=INDIRECT(\"G\"&ROW())"
				}
			},
			"split": {
				"REPOSITORY": "(.*)",
				"STORAGE": "([\\w\\d\\s]+)(?:.*)"
			},
			"format": {
				"sheet": {
					"width": 125
				},
				"columns": {
					"Item-ID": 5,
					"Distributor": 8,
					"Article Name": 25,
					"Order Number": 15,
					"Package Size": 5,
					"Last Order": 7,
					"Additional Information": 10,
				}
			}
		}],
		"translations": {
			"QUANTITY": {
				"1": "piece",
				"2": "pair",
				"4": "metre",
				"5": "set",
				"6": "litre",
				"7": "square metre",
				"8": "bag"
			},
			"REPOSITORY": {
				"1": "Central",
				"2": "Department 1",
				"3": "Department 2",
				"4": "Office"
			}
		}
	}
};