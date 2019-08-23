# core overview
a shortened overview of the core-functions that can be made use of in future modules.

## core.js
`el(v)` returns document.getElementById(v)

`value(v)` returns value of v or '' even if v is undefined. useful for function parameters.

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

`core.function.insert.checkbox(label, id, checked, additionalProperty, title)` returns a html checkbox that can be prechecked, event can be an onchange property or similar

`core.function.insert.radio(label, name, id, checked, additionalProperty, title)` returns a html radio button that can be prechecked, event can be an onchange property or similar

`core.function.insert.select(options, name, id, selected, additionalProperty)` returns a html select element that can be preselected, event can me an onchange property or similar. options have to be an object with optionId:[value,label]

`core.function.insert.expand()` returns a html span that implicates whether an box is expanded or shrunken

`core.function.setting.setup()` returns the content of the settings to display within the popup modal. all the other setting methods are for this primarily but

`core.function.setting.switch(name)` toggles a cookie in terms of on by default

`core.function.setting.reversedswitch(name)` toggles a cookie in terms of off by default

`core.function.setting.set(name, value)` stores data in localstorage or cookie. in the latter case for about one year

`core.function.setting.get(name)` returns the value of localstorage.item or cookie *name* or false

`core.function.setting.unset(name)` unsets localstorage.item or cookie *name*

`core.function.setting.clear()` resets the whole application

`core.function.icon.insert(icon)` returns an inline svg according to the before declared properties within the parent property

`core.history.write(point)` adds an array of callbacks to the history storage if the parameter differs from last entry. removes entries if new entry is added while havinge gone back

`core.history.go('back'||'forth')` yields through the history and processes the stored callbacks

`core.performance.start(track, group)` does start a console timer. starting a group is optional. this is called on every loadScript and should be ended within all callback functions.

`core.performance.stop(track, info, group)` does stop a console timer. info can be some desired result. ending group is optional. 

## core_langage_synthesis.js
extends the core-object with the language synthesis. here you define textblocks that can be switched for $keyword$ within continuous text using the function `core.function.languageSynthesis.output(block)` called by `'string'.replace(/\$(\w+?)\$/ig,function(match,group1){return core.function.languageSynthesis.output(group1)})`