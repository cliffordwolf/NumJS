
// Namespace NumShell
if (!window.NumShell)
window.NumShell = (function(){

var fixN = 0;

var hist = new Array();
var hidx = 0;

var env = new Object();

var welcomeMsg = "Type `example' to execute an example session or `help' for command overview.";

var conText = welcomeMsg + "\n\n";
var conActive = 1;

function consoleOut(text)
{
	var conOff = document.getElementById("NumShell.con" + conActive);
	conActive = conActive == 1 ? 2 : 1;
	var conOn = document.getElementById("NumShell.con" + conActive);

	if (conOff && conOn) {
		conText += text;
		conOn.value = conText;
		conOn.scrollTop = conOn.scrollHeight;
		conOn.style.visibility = "visible";
		conOff.style.visibility = "hidden";
	}
}

function val2str(value)
{
	if (fixN > 0 && typeof(value.toFixed) == "function")
		return value.toFixed(fixN);
	if (typeof(value.toString) == "function")
		return value.toString();
	return value;
}

function exec(code)
{
	var builtins = {
		dot: NumJS.DOT,
		pow: NumJS.POW,
		inv: NumJS.INV,
		abs: NumJS.ABS,
		norm: NumJS.NORM,
		arg: NumJS.ARG,
		conj: NumJS.CONJ,
		transp: NumJS.TRANSP,
		exp: NumJS.EXP,
		log: NumJS.LOG,
		det: NumJS.DET,
		re: NumJS.RE,
		im: NumJS.IM,
		round: NumJS.ROUND,
		PI: Math.PI,
		E: Math.E,
	};

	function myEval(code) {
		with (builtins) with (env)
			return eval(code);
	}

	code = code.replace(/^ */, "");

	if (code.search(/^debug (.*)/) == 0) {
		return NumJS.Parse(RegExp.$1);
	}

	if (code.search(/^example *$/) == 0) {
		consoleOut("\n");
		handleExec("prec 2");
		handleExec("A: [ 1, 2, 3; 4i, 5, 6i; -7, 9+9i, 0 ]");
		handleExec("y: [ 10; 20; 30 ]");
		handleExec("x: A \\ y");
		handleExec("A * x");
		return "END OF EXAMPLE";
	}

	if (code.search(/^help *$/) == 0) {
		var text = "\n";
		text += "     example ..................... execute example session\n";
		text += "     help ........................ this help message\n";
		text += "     list ........................ list variables and functions\n";
		text += "     expr   ...................... execute expression\n";
		text += "     var: expr   ................. define variable\n";
		text += "     func(args): expr   .......... define function\n";
		text += "     debug expr   ................ show javascript for expression\n";
		text += "     show expr   ................. display matrix in 2d format\n";
		text += "     prec N   .................... set display precision to N decimals\n";
		if (document.getElementById("NumShell.win"))
			text += "     close ....................... close NumShell window\n";
		text += "     clear ....................... clear screen\n\n";
		text += "     Builtin functions: dot pow inv abs norm arg conj\n";
		text += "                        transp exp log det re im round\n\n";
		text += "     Builtin constants: PI E\n\n";
		text += "     Operators: ( ) * / \\ + -";
		return text;
	}

	if (code.search(/^list *$/) == 0) {
		var text = "";
		for (i in env) {
			text += "  " + i;
		}
		if (text == "")
			text = "*empty*";
		return text;
	}

	if (code.search(/^prec ([0-9]+) *$/) == 0) {
		fixN = +RegExp.$1;
		if (fixN == 0)
			return "*full precision*";
		return (0).toFixed(fixN);
	}

	if (code.search(/^clear *$/) == 0) {
		conText = "";
		return welcomeMsg;;
	}

	if (code.search(/^close *$/) == 0) {
		var win = document.getElementById("NumShell.win");
		if (win)
			win.parentNode.removeChild(win);
		return "This command is only available in bookmarklet mode.";
	}

	if (code.search(/^([A-Za-z][A-Za-z_0-9]*) *:(.*)/) == 0) {
		var name = RegExp.$1;
		var value = (myEval(NumJS.Parse(RegExp.$2)))();
		env[name] = value;
		return val2str(value);
	}

	if (code.search(/^([A-Za-z][A-Za-z_0-9]*) *\(([^()]*)\):(.*)/) == 0) {
		var msg = RegExp.$1 + "(" + RegExp.$2 + ")";
		var name = RegExp.$1;
		var value = myEval(NumJS.Parse(RegExp.$3, RegExp.$2));
		env[name] = value;
		return msg.replace(/ /g, "");
	}

	if (code.search(/^show (.*)/) == 0) {
		var value = (myEval(NumJS.Parse(RegExp.$1)))();
		if (typeof(value) == "object" && "rows" in value && "cols" in value) {
			var text = "";
			var cellData = new Object();
			var maxlen = 0;
			for (var i = 0; i < value.rows; i++)
			for (var j = 0; j < value.cols; j++) {
				var v = val2str(value.get(i, j));
				if (v.length > maxlen)
					maxlen = v.length;
				cellData[i + " " + j] = v;
			}
			for (var i = 0; i < value.rows; i++)
			for (var j = 0; j < value.cols; j++) {
				var t = cellData[i + " " + j];
				while (t.length < maxlen)
					t = " " + t;
				text += "    " + t;
				if (j == value.cols-1 && i != value.rows-1)
					text += "\n";
			}
			return text;
		}
		return val2str(value);
	}

	var value = (myEval(NumJS.Parse(code)))();
	return val2str(value);
}

function handleExec(code)
{
	consoleOut("> " + code + "\n");
	hist.push(code);
	hidx = hist.length;

	try {
		var result = exec(code);
		consoleOut(result + "\n\n");
	} catch (err) {
		consoleOut(err + "\n\n");
	}
}

function handleKey(keyCode)
{
	// enter
	if (keyCode == 13) {
		var code = document.getElementById("NumShell.prompt").value;
		document.getElementById("NumShell.prompt").value = "";
		handleExec(code);
	}
	// up and down
	if (keyCode == 38 && hidx > 0) {
		document.getElementById("NumShell.prompt").value = hist[--hidx];
	}
	if (keyCode == 40 && hidx < hist.length) {
		if (++hidx == hist.length)
			document.getElementById("NumShell.prompt").value = "";
		else
			document.getElementById("NumShell.prompt").value = hist[hidx];
	}
	// page up and page down
	if (keyCode == 33) {
		var conOn = document.getElementById("NumShell.con" + conActive);
		conOn.scrollTop = conOn.scrollTop - 100;
	}
	if (keyCode == 34) {
		var conOn = document.getElementById("NumShell.con" + conActive);
		conOn.scrollTop = conOn.scrollTop + 100;
	}
}

function generateBookmarklet()
{
	var baseuri = window.location.href;
	baseuri = baseuri.replace(/[#?].*$/, "");
	baseuri = baseuri.replace(/[^\/]*$/, "");
	var code = "";
	code += "var el = document.createElement('script');";
	code += "el.setAttribute('src', '" + baseuri + "shell.js');";
	code += "el.addEventListener('load', function(){" +
			"NumShell.generateWindow('" + baseuri + "');}, false);";
	code += "document.body.appendChild(el);";
	document.write("<a href=\"javascript:(function(){" + code + "})();\">" +
			"NumShell bookmarklet (drag and drop to bookmarks folder)</a>\n");
}

function generateWindow(baseuri)
{
	if (document.getElementById("NumShell.prompt") && !document.getElementById("NumShell.win")) {
		window.alert("NumShell is already integrated in this site!\n" +
				"Use integrated NumShell instead of NumShell bookmarklet.");
		return;
	}

	// Load NumJS, if needed
	if (typeof(NumJS) == "undefined") {
		var el = document.createElement('script');
		el.setAttribute('src', baseuri + '../../NumJS.js');
		el.addEventListener('load', function(){
				NumJS.loader_dom(baseuri + '../../', NumShell.run); }, false);
		document.body.appendChild(el);
	}

	// Destroy pre-existing ui, if needed
	var ids = [ "con0", "con1", "con2", "prompt", "win" ];
	for (i in ids) {
		var node = document.getElementById("NumShell." + ids[i]);
		if (node)
			node.parentNode.removeChild(node);
	}

	// Create (new) ui window
	var win = document.body.appendChild(document.createElement('div'));
	win.setAttribute("id", "NumShell.win");
	win.setAttribute("onmousedown", "NumShell.mouse(event)");
	win.style.backgroundColor = "#488";
	win.style.position = "absolute";
	win.style.top = (window.scrollY + 100) + "px";
	win.style.left = (window.scrollX + 100) + "px";
	win.style.padding = "5px";
	win.style.border = "5px solid #000";
	win.style.zIndex = 1000;
	var title = win.appendChild(document.createElement('div'));
	title.appendChild(document.createElement('b')).
			appendChild(document.createTextNode("NumShell - A NumJS Example App"));
	title.style.backgroundColor = "#aff";
	title.style.padding = "5px";

	if (!window.NumShellRegisteredWindowEvents) {
		window.addEventListener('mousemove', NumShell.mouse, false);
		window.addEventListener('mouseup', NumShell.mouse, false);
		window.NumShellRegisteredWindowEvents = 1;
	}

	var ids = [ "con1", "con2", "con0" ];
	for (i in ids) {
		var node = win.appendChild(document.createElement('textarea'));
		node.setAttribute("id", "NumShell." + ids[i]);
		node.setAttribute("rows", "20");
		node.setAttribute("cols", "80");
		node.setAttribute("readonly", "100");
		if (ids[i] != "con0")
			node.style.position = "absolute";
		node.style.visibility = "hidden";
		node.style.fontFamily = "Courier";
		node.style.fontSize = "12px";
	}

	win.appendChild(document.createElement('br'));
	win.appendChild(document.createElement('b')).appendChild(document.createTextNode(">"));
	var prompt = win.appendChild(document.createElement('input'));
	prompt.setAttribute("id", "NumShell.prompt");
	prompt.setAttribute("size", "80");
	prompt.setAttribute("onkeyup", "NumShell.handleKey(event.keyCode)");
	prompt.style.cssFloat = "right";
	prompt.style.fontFamily = "Courier";
	prompt.style.fontSize = "12px";
}

var lastMouseDown = 0;
var lastMouseX = 0;
var lastMouseY = 0;

function mouse(ev)
{
	if (ev.type == "mousedown") {
		lastMouseDown = 1;
	}
	if (ev.type == "mouseout" || ev.type == "mouseup") {
		document.getElementById("NumShell.prompt").focus();
		lastMouseDown = 0;
	}

	if (ev.type == "mousemove" && lastMouseDown == 1) {
		var win = document.getElementById("NumShell.win");
		var relX = ev.pageX - lastMouseX;
		var relY = ev.pageY - lastMouseY;

		win.style.top = +win.style.top.replace(/px/,"") + relY + "px";
		win.style.left = +win.style.left.replace(/px/,"") + relX + "px";
	}

	lastMouseX = ev.pageX;
	lastMouseY = ev.pageY;
}

function run()
{
	consoleOut("");
	document.getElementById("NumShell.prompt").value = "";
	document.getElementById("NumShell.prompt").focus();
}

// Export from Namespace
return {
	handleKey: handleKey,
	generateBookmarklet: generateBookmarklet,
	generateWindow: generateWindow,
	mouse: mouse,
	run: run
}})();

