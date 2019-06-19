# core overview
a shortened overview of the core-functions that can be made use of in future modules.

## core.js
`el(v)` returns document.getElementById(v)

`core.function.popup(text)` shows or updates a modal box if text is provided, hides it if function called with null value

`core.function.toggelHeight(toggleel)` toggles the class list of given element to expand or shrink it

`core.function.escapeHTML(text, br2nl)` returns a string with escaped special chars for mailto anchors

`core.function.sortBySecondColumn(a, b)` sorts two dimensional arrays as paramter for sort()

`core.function.smartSearch.lookup(userInput, dataBaseObject, additionalCondition)` compares raw user input to objects values and returns an array with matches ordered by relevance/multi matches on multiple query terms. handles optional fuzzy search based on overall application setting

`core.function.smartSearch.relevance.init` initiates a property in case you want the search results to be separated by relevance

`core.function.smartSearch.relevance.nextstep` inserts a line between steps of relvance and should be concatenated to the output

`core.function.lang(block, args)` looks for properties oder property-functions within core or loaded module to return dependent on the chosen language. block is the property name of the to be displayed text block, args is optional for functions. module properties come before core properties.

`core.function.languageSelection(event)` returns a set of radio inputs based on registered languages. event is optional and can be e.g. an onchange property of the radio button

`core.function.loadscript(url, callback)` appends url-file to the header and calls the callback function. used for importing / loading modules and data-files

`core.function.cookie.set(name, value, expires)` sets a cookie that expires in *expires* seconds

`core.function.cookie.get(name)` returns the value of cookie *name* or false

`core.function.cookie.unset(name)` unsets cookie *name*

`core.function.insert.checkbox(label, id, checked, event)` returns a html checkbox that can be prechecked, event can be an onchange property or similar

`core.function.insert.radio(label, name, id, checked, event)` returns a html radio button that can be prechecked, event can be an onchange property or similar

`core.function.insert.select(options, name, id, selected, event)` returns a html select element that can be preselected, event can me an onchange property or similar. options have to be an object with optionId:[value,label]

`core.function.insert.expand()` returns a html span that implcates whether a boy is expanded or shrunken

`core.function.setting.setup()` returns the content of the settings to display within the popup modal. all the other setting methods are for this primarily but

`core.function.setting.switch(name)` toggles a cookie in terms of on by default

`core.function.setting.reversedswitch(name)` toggles a cookie in terms of off by default

`core.function.icon.insert(icon)` returns an inline svg according to the before declares properties within the parent property

## core_langage_synthesis.js
extends the core-object with the language synthesis. here you define textblocks that can be switched for $keyword$ within continuous text using the function `core.function.languageSynthesis.output(block)` called by `'string'.replace(/\$(\w+?)\$/ig,function(match,group1){return core.function.languageSynthesis.output(group1)})`