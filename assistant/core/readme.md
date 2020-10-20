# core overview
a shortened overview of the core-functions that can be made use of in future modules.

## core.js
`el(v)` returns document.getElementById(v)

`value(v)` returns value of v or '' even if v is undefined. useful for function parameters.

`isIE()` returns boolean for browserhacks

`svgClassList()` polyfill for adding/removing classes to svg classList

`core.fn.maxMailSize()` tests whether the browser can handle the maximum body size for maito according to advanced settings

`core.fn.dynamicMailto(address, subject, body)` prefills mailto:-actions, opens mail-client and handles browser dependent maximum body size

`core.fn.escapeHTML(text, br2nl)` returns a string with escaped special chars for mailto anchors

`core.fn.stdout(where, what)` serves as a wrapper for output to innerHTML, but can be used for debugging easily by setting/adding 'console' to *where*

`core.fn.popup(text)` shows or updates a popup box if text is provided, hides it if function called with undefined value

`core.fn.growlNotif(text)` shows a short notification that hides after a set time if text is provided, hides it if function called with undefined value

`core.fn.toggelHeight(toggleel)` toggles the class list of given element to expand or shrink it

`core.fn.sortBySecondColumn(a, b)` sorts two dimensional arrays as paramter for sort()

`core.fn.smartSearch.lookup(userInput, dataBaseObject, additionalCondition)` compares raw user input to objects values and returns an array with matches ordered by relevance/multi matches on multiple query terms. handles optional fuzzy search based on overall application setting

`core.fn.smartSearch.relevance.init` initiates a property in case you want the search results to be separated by relevance

`core.fn.smartSearch.relevance.nextstep` inserts a line between steps of relvance and should be concatenated to the output

`core.fn.lang(block, args)` looks for properties oder property-functions within core or loaded module to return dependent on the chosen language. block is the property name of the to be displayed text block, args is optional for functions. module properties come before core properties.

`core.fn.languageSelection(event)` returns a set of radio inputs based on registered languages. event is optional and can be e.g. an onchange property of the radio button

`core.fn.loadscript(url, callback)` appends url-file to the header and calls the callback function. used for importing / loading modules and data-files

`core.fn.insert.checkbox(label, id, checked, additionalProperty, title)` returns a html checkbox that can be prechecked, event can be an onchange property or similar

`core.fn.insert.radio(label, name, id, checked, additionalProperty, title)` returns a html radio button that can be prechecked, event can be an onchange property or similar

`core.fn.insert.select(options, name, id, selected, additionalProperty)` returns a html select element that can be preselected, event can me an onchange property or similar. options have to be an object with optionId:[value,label]

`core.fn.insert.expand()` returns a html span that implicates whether an box is expanded or shrunken

`core.fn.insert.icon(icon, addclass, id, attributes)` returns an inline svg according to the declared properties within contained asset-object. addclass, id, and attributes are optional

`core.fn.setting.setup()` returns the content of the settings to display within the popup. all the other setting methods are for this primarily but

`core.fn.setting.switch(name)` toggles a setting to true in terms of off/false by default

`core.fn.setting.localStorage.api()` returns whether localstorage is available not cookies to be used

`core.fn.setting.localStorage.remainingSpace()` returns the amount of remaining bytes for storing settings or whatever

`core.fn.setting.set(name, value, errormsg)` stores data in localstorage or cookie. in the latter case for about one year, errormsg is optional and customizable for the usecase in case storage limit is exceeded

`core.fn.setting.get(name)` returns the value of localstorage.item or cookie *name* or false

`core.fn.setting.isset(name)` returns boolean of existence of localstorage.item or cookie *name*. the getter might not be sufficient in case of actual 0 or false values

`core.fn.setting.unset(name)` unsets localstorage.item or cookie *name*

`core.fn.setting.clear()` resets the whole application

`core.fn.stringcompression.compress()` returns an uricomponent encoded base64 encoded string to save some bytes for storage of long strings

`core.fn.stringcompression.decompress()` reverts the base64 encoded string

`core.fn.drm.table(table)` returns a translated table according to data rights managament excel sheet

`core.fn.drm.createHash(string)` returns a hash based on argument string, consider concatenation of name and password to make the hash unique regarding data rights management

`core.fn.drm.searchHash()` returns true if hash is found in given hash table

`core.fn.drm.encryptToken(base36Timestamp, name, password)` returns an encrypted token

`core.fn.drm.decryptToken(hashTable, base36Timestamp, token)` returns true if decrypted hash is found in given hash table

`core.fn.init(query)` creates home screen

`core.history.write(point)` adds an array of callbacks to the history storage if the parameter differs from last entry. removes entries if new entry is added while havinge gone back

`core.history.go('back'||'forth')` yields through the history and processes the stored callbacks

`core.performance.start(track, group)` does start a console timer. starting a group is optional. this is called on every loadScript and should be ended within all callback functions.

`core.performance.stop(track, info, group)` does stop a console timer. info can be some desired result. ending group is optional. 

## ../library/core/core.fn.languageSynthesis.js
extends the core-object with the language synthesis. here you define textblocks that can be switched for $keyword$ within continuous text using the function `core.fn.languageSynthesis.output(block)` called by `'string'.replace(/\$(\w+?)\$/ig,function(match,group1){return core.fn.languageSynthesis.output(group1)})`