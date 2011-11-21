#!/bin/bash
modules=$( sed '/^NumJS.modules/,/^\];/ p; d;' NumJS.js | cut -sf2 -d'"'; )
{ sed '1,/^ *$/ p; d;' NumJS.js; echo; echo "// Git: $(git describe --always)"
echo "// Modules:" $modules; echo "var NumJS = new Object();"; echo; echo
for mod in $modules; do grep -v '"use strict"' NumJS.$mod.js; done; } > numjs_packed.js
