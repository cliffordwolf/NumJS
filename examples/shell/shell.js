
// Namespace NumShell
if (!window.NumShell)
window.NumShell = (function(){

var fixN = 0;

var hist = new Array();
var hidx = 0;

var env = new Object();
var eqs = new Array();

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

function solve(varlist)
{
	var freeVars = new Array();
	for (var i in varlist)
	{
		var v = env[varlist[i]];
		if (typeof(v) == "number") {
			var hdl = new (function(n){
				this.get = function() { return env[n]; };
				this.set = function(v) { env[n] = v; };
			})(varlist[i]);
			freeVars.push(hdl);
		} else
		if (typeof(v) == "object" && v instanceof NumJS.Cmplx) {
			var hdl_re = new (function(n){
				this.get = function() { return env[n].re; };
				this.set = function(v) { env[n] = NumJS.C(v, env[n].im); };
			})(varlist[i]);
			var hdl_im = new (function(n){
				this.get = function() { return env[n].im; };
				this.set = function(v) { env[n] = NumJS.C(env[n].re, v); };
			})(varlist[i]);
			freeVars.push(hdl_re);
			freeVars.push(hdl_im);
		} else
		if (typeof(v) == "object" && v instanceof NumJS.GenericMatrix) {
			for (var k = 0; k < v.rows; k++)
			for (var l = 0; l < v.cols; l++) {
				var cell = v.get(k, l);
				if (typeof(cell) == "number") {
					var hdl = new (function(n, k, l){
						this.get = function() { return env[n].get(k, l); };
						this.set = function(v) { env[n].set(k, l, v); };
					})(varlist[i], k, l);
					freeVars.push(hdl);
				} else
				if (typeof(cell) == "object" && cell instanceof NumJS.Cmplx) {
					var hdl_re = new (function(n, k, l){
						this.get = function() { return env[n].get(k, l).re; };
						this.set = function(v) { env[n].set(k, l,
								NumJS.C(v, env[n].get(k, l).im)); };
					})(varlist[i], k, l);
					var hdl_im = new (function(n, k, l){
						this.get = function() { return env[n].get(k, l).im; };
						this.set = function(v) { env[n].set(k, l,
								NumJS.C(env[n].get(k, l).re, v)); };
					})(varlist[i], k, l);
					freeVars.push(hdl_re);
					freeVars.push(hdl_im);
				} else
					throw "NumShell solver type error";
			}
		} else
			throw "NumShell solver type error";
	}
	// consoleOut("Solver found " + freeVars.length + " free variables.\n");

	var itercount = 0;
	while (1)
	{
		var diffVals = new Array();

		if (itercount >= 30) {
			// consoleOut("Maximum number of iterations reached.\n");
			return total_res;
		}

		// consoleOut("Solver iteration " + (++itercount) + ":\n");

		for (var i in eqs) {
			eqs[i].diff_v = eqs[i].diff_f();
			var v = eqs[i].diff_v;
			if (typeof(v) == "number") {
				var hdl = new (function(n){
					this.get = function() { return eqs[n].diff_v; };
				})(i);
				diffVals.push(hdl);
			} else
			if (typeof(v) == "object" && v instanceof NumJS.Cmplx) {
				var hdl_re = new (function(n){
					this.get = function() { return eqs[n].diff_v.re; };
				})(i);
				var hdl_im = new (function(n){
					this.get = function() { return eqs[n].diff_v.re; };
				})(i);
				diffVals.push(hdl_re);
				diffVals.push(hdl_im);
			} else
			if (typeof(v) == "object" && v instanceof NumJS.GenericMatrix) {
				for (var k = 0; k < v.rows; k++)
				for (var l = 0; l < v.cols; l++) {
					var cell = v.get(k, l);
					if (typeof(cell) == "number") {
						var hdl = new (function(n, k, l){
							this.get = function() { return eqs[n].diff_v.get(k, l); };
						})(i, k, l);
						diffVals.push(hdl);
					} else
					if (typeof(cell) == "object" && cell instanceof NumJS.Cmplx) {
						var hdl_re = new (function(n, k, l){
							this.get = function() { return eqs[n].diff_v.get(k, l).re; };
						})(i, k, l);
						var hdl_im = new (function(n, k, l){
							this.get = function() { return env[n].diff_v.get(k, l).im; };
						})(i, k, l);
						diffVals.push(hdl_re);
						diffVals.push(hdl_im);
					} else
						throw "NumShell solver type error";
				}
			} else
				throw "NumShell solver type error";
		}

		var J_low = NumJS.MAT(diffVals.length, freeVars.length);
		var J_high = NumJS.MAT(diffVals.length, freeVars.length);
		var res = NumJS.MAT(diffVals.length, 1);

		var total_res = 0;
		for (var i in diffVals)
		{
			var r = diffVals[i].get();
			total_res += Math.abs(r);
			res.set(i, 0, r);
		}

		// consoleOut("  minimizing " + diffVals.length + " differences (current total: " + total_res + ")\n");

		var origVars = new Array();
		for (var j in freeVars)
		{
			var v = freeVars[j].get();
			origVars[j] = v;
			freeVars[j].set(v - NumJS.eps);
			for (var i in eqs)
				eqs[i].diff_v = eqs[i].diff_f();
			for (var i in diffVals) {
				var r = diffVals[i].get();
				J_low.set(i, j, r);
			}
			freeVars[j].set(v + NumJS.eps);
			for (var i in eqs)
				eqs[i].diff_v = eqs[i].diff_f();
			for (var i in diffVals) {
				var r = diffVals[i].get();
				J_high.set(i, j, r);
			}
			freeVars[j].set(v);
		}

		var J = NumJS.DIV(NumJS.SUB(J_high, J_low), NumJS.eps);

		// env["_SOLVE_R"] = res;
		// env["_SOLVE_J"] = J;

		// Solve it without much optimizations: (J'*J) s = J' res
		var Jt = NumJS.TRANSP(J);
		var s = NumJS.SOLVE(NumJS.MUL(Jt, J), NumJS.MUL(Jt, res));

		// env["_SOLVE_S"] = s;

		if (s == null)
			throw "NumShell Solver: Jacoby singularity.";

		var damping = 2;
		var improv_res = total_res * 2;
		while (improv_res > total_res + NumJS.eps)
		{
			damping = damping / 2;
	
			if (damping < 1e-3)
				throw "NumShell Solver: Damping singularity.";

			for (var j in freeVars) {
				var v = freeVars[j].get();
				origVars[j] = v;
				freeVars[j].set(origVars[j] - s.get(j, 0) * damping);
			}

			var improv_res = 0;
			for (var i in eqs)
				eqs[i].diff_v = eqs[i].diff_f();
			for (var i in diffVals)
				improv_res += Math.abs(diffVals[i].get());
		}

		// consoleOut("  applied delta with damping " + damping + ", improved diff by " +
		//		(total_res - improv_res) + "\n");

		if (total_res - improv_res < NumJS.eps)
			return improv_res;

		total_res = improv_res;
	}
}

function example(n)
{
	consoleOut("\n");
	if (n == 1) {
		handleExec("prec 2");
		handleExec("A: [ 1, 2, 3; 4i, 5, 6i; -7, 9+9i, 0 ]");
		handleExec("y: [ 10; 20; 30 ]");
		handleExec("x: A \\ y");
		handleExec("A * x");
	} else
	if (n == 2) {
		handleExec("A: [-1; 0.5]");
		handleExec("B: [+1; 0.2]");
		handleExec("X: [0; 0]");
		handleExec("norm(A-X) = 1.5");
		handleExec("norm(B-X) = 1.5");
		handleExec("solve X");
		handleExec("show X");
	} else {
		var text = "";
		text += "     example 1 ..... solving a complex linear system\n";
		text += "     example 2 ..... finding the intersection of two circles";
		return text;
	}
	return "END OF EXAMPLE";
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
		EPS: NumJS.eps,
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

	if (code.search(/^example *([0-9]+) *$/) == 0) {
		return example(+RegExp.$1);
	}

	if (code.search(/^example *$/) == 0) {
		return example(-1);
	}

	if (code.search(/^help *$/) == 0) {
		var text = "\n";
		text += "     example ..................... execute example session\n";
		text += "     help ........................ this help message\n";
		text += "     list ........................ list variables and functions\n";
		text += "     delete { var | eq-nr } ...... delete var/func or equation\n";
		text += "     expr ........................ execute expression\n";
		text += "     expr = expr ................. create equation\n";
		text += "     var: expr ................... define variable\n";
		text += "     func(args): expr ............ define function\n";
		text += "     solve var1 [var2 [...]] ..... solve equations for variables\n";
		text += "     debug expr .................. show javascript for expression\n";
		text += "     show expr ................... display matrix in 2d format\n";
		text += "     prec N ...................... set display precision to N decimals\n";
		if (document.getElementById("NumShell.win"))
			text += "     close ....................... close NumShell window\n";
		text += "     clear ....................... clear screen\n\n";
		text += "     Builtin functions: dot pow inv abs norm arg conj\n";
		text += "                        transp exp log det re im round\n\n";
		text += "     Builtin constants: EPS PI E\n\n";
		text += "     Operators: ( ) * / \\ + -";
		return text;
	}

	if (code.search(/^list *$/) == 0) {
		var text = "";
		for (var i in env) {
			text += "  " + i;
		}
		if (text == "")
			text = "*empty*";
		for (var i = 0; i < eqs.length; i++)
			text += (i ? "\n" : "\n\n") + "  Eq " + i + ": " +
					eqs[i].lhs + " = " + eqs[i].rhs;
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

	if (code.search(/^delete *([A-Za-z][A-Za-z_0-9]*)/) == 0) {
		var name = RegExp.$1;
		delete env[name];
		return "done.";
	}

	if (code.search(/^delete *([0-9]+)/) == 0) {
		var idx = +RegExp.$1;
		eqs.splice(idx, 1);
		return "done.";
	}

	if (code.search(/^([A-Za-z][A-Za-z_0-9]*) *\(([^()]*)\):(.*)/) == 0) {
		var msg = RegExp.$1 + "(" + RegExp.$2 + ")";
		var name = RegExp.$1;
		var value = myEval(NumJS.Parse(RegExp.$3, RegExp.$2));
		env[name] = value;
		return msg.replace(/ /g, "");
	}

	if (code.search(/^show *(.*)/) == 0) {
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

	if (code.search(/(.*)=(.*)/) >= 0) {
		var eq = { lhs: RegExp.$1, rhs: RegExp.$2 };
		eq.lhs = eq.lhs.replace(/[ \t\r\n]/g, "");
		eq.rhs = eq.rhs.replace(/[ \t\r\n]/g, "");
		eq.lhs_f = myEval(NumJS.Parse(eq.lhs));
		eq.rhs_f = myEval(NumJS.Parse(eq.rhs));
		eq.diff_f = function() { return NumJS.SUB(this.lhs_f(), this.rhs_f()); };
		var msg = "  Eq " + eqs.length + ": " + eq.lhs + " = " + eq.rhs;
		eqs.push(eq);
		return msg;
	}

	if (code.search(/^solve *(.*)/) == 0) {
		var varlist = RegExp.$1;
		varlist = varlist.split(/ +/);
		return solve(varlist);
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

