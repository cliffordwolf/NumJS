/*
 *  NumJS -- a JavaScript library for numerical computing
 *
 *  Copyright (C) 2011  Clifford Wolf <clifford@clifford.at>
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

// "use strict";

NumJS.Parse = function(text, args, defs)
{
	var code = "(function(" + (typeof(args) != "undefined" ? args : "") + "){\n";
	var idx = 0;

	if (typeof(defs) != "undefined") {
		for (i in defs)
			code += "var " + i + " = " + defs[i] + ";\n";
	}

	// lexical pass: used to identify literals and extract 'non-trivial'
	// literals. I.e. literals that contain '+' and '-' such as "1.23e-5"
	// that would confuse the actual parser.
	var tokens = text.match(/(\.?[0-9][0-9.]*e[+-]?[0-9]+i?|[a-zA-Z_0-9.]+|.)/g);
	text = "";
	for (var i in tokens) {
		if (tokens[i].search(/^\.?[0-9][0-9.]*e[+-]?[0-9]+i?$/) >= 0) {
			text += "$" + idx;
			code += "var $" + (idx++) + " = ";
			if (tokens[i].search(/(.*)i$/) >= 0)
				code += "NumJS.C(0, " + RegExp.$1 + ");\n";
			else
				code += tokens[i] + ";\n";
		} else
			text += tokens[i];
	}

	// this function reduces a textual expression to
	// a single variable index and returns the corrspondig
	// basic "$n" expression, writing the actual js code
	// to the code variable on the way.
	function reduce(text)
	{
		var pos;
		while (1)
		{
			// blocks and function calls
			pos = text.search(/[a-zA-Z_0-9.]*\(/);
			if (pos >= 0)
			{
				var prefix = text.slice(0, pos);
				var postfix = text.slice(pos);
				var funcname = postfix.match(/^[a-zA-Z_0-9.]*/)[0];
				postfix = postfix.slice(funcname.length + 1);

				var i, pcount = 1;
				for (i = 0; pcount > 0; i++) {
					if (i >= postfix.length)
						throw "NumJS.Parse parser error.";
					var ch = postfix.substr(i, 1);
					if (ch == "(")
						pcount++;
					if (ch == ")")
						pcount--;
				}
				var inner = postfix.slice(0, i-1);
				postfix = postfix.slice(i);

				// handle a function call
				if (funcname != "")
				{
					var fcall = funcname + "(";
					if (inner != "") {
						var start = 0;
						for (i = 0; i < inner.length; i++) {
							var ch = inner.substr(i, 1);
							if (ch == "(")
								pcount++;
							if (ch == ")")
								pcount--;
							if (ch == "," && pcount == 0) {
								var arg = inner.slice(start, i);
								if (start != 0)
									fcall += ", ";
								fcall += reduce(arg);
								start = i + 1;
							}
						}
						var arg = inner.slice(start, i);
						if (start != 0)
							fcall += ", ";
						fcall += reduce(arg);
					}

					text = prefix + "$" + idx + postfix;
					code += "var $" + (idx++) + " = " + fcall + ");\n";
					continue;
				}

				text = prefix + reduce(inner) + postfix;
				continue;
			}

			// matrix notation
			pos = text.search(/\[/);
			if (pos >= 0)
			{
				var prefix = text.slice(0, pos);
				var postfix = text.slice(pos + 1);

				var i, pcount = 1;
				for (i = 0; pcount > 0; i++) {
					if (i >= postfix.length)
						throw "NumJS.Parse parser error.";
					var ch = postfix.substr(i, 1);
					if (ch == "[")
						pcount++;
					if (ch == "]")
						pcount--;
				}
				var inner = postfix.slice(0, i-1);
				postfix = postfix.slice(i);

				var start = 0;
				var cellData = new Object();
				var rowNum = 0, colNum = 0;
				var rowId = 0, colId = 0;
				function addCell(txt, term) {
					if (rowId >= rowNum)
						rowNum = rowId + 1;
					if (colId >= colNum)
						colNum = colId + 1;
					cellData[rowId + " " + colId] = reduce(txt);
					if (term == ",")
						colId++;
					if (term == ";")
						rowId++, colId = 0;
				}
				for (i = 0; i < inner.length; i++) {
					var ch = inner.substr(i, 1);
					if (ch == "[")
						pcount++;
					if (ch == "]")
						pcount--;
					if ((ch == "," || ch == ";") && pcount == 0) {
						addCell(inner.slice(start, i), ch);
						start = i + 1;
					}
				}
				if (start != i)
					addCell(inner.slice(start, i), ch);

				code += "var $" + idx + " = NumJS.MAT(" + rowNum + ", " + colNum + ", [";
				for (var i = 0; i < rowNum; i++)
				for (var j = 0; j < colNum; j++) {
					if (i != 0 || j != 0)
						code += ", ";
					if ((i + " " + j) in cellData)
						code +=  cellData[i + " " + j];
					else
						code += "0";
				}
				code += " ]);\n";

				text = prefix + "$" + (idx++) + postfix;
				continue;
			}

			// prefix '+' and '-'
			pos = text.search(/(^|[^$a-zA-Z_0-9.])(\+|-)([$a-zA-Z_0-9.]+)/);
			if (pos >= 0)
			{
				pos += RegExp.$1.length;
				var prefix = text.slice(0, pos);
				var op = RegExp.$2
				pos += op.length;
				var val = RegExp.$3
				pos += val.length;
				var postfix = text.slice(pos);

				val = reduce(val);

				text = prefix + "$" + idx + postfix;
				code += "var $" + (idx++) + " = ";
				if (op == "+")
					code += val + ";\n";
				if (op == "-")
					code += "NumJS.NEG(" + val + ");\n";
				continue;
			}

			// multiply and divide
			pos = text.search(/([$a-zA-Z_0-9.]+)(\*|\/|\\)([$a-zA-Z_0-9.]+)/);
			if (pos >= 0)
			{
				var prefix = text.slice(0, pos);
				var val1 = RegExp.$1;
				pos += val1.length;
				var op = RegExp.$2
				pos += op.length;
				var val2 = RegExp.$3
				pos += val2.length;
				var postfix = text.slice(pos);

				val1 = reduce(val1);
				val2 = reduce(val2);

				text = prefix + "$" + idx + postfix;
				code += "var $" + (idx++) + " = ";
				if (op == "*")
					code += "NumJS.MUL";
				if (op == ".")
					code += "NumJS.DOT";
				if (op == "/")
					code += "NumJS.DIV";
				if (op == "\\")
					code += "NumJS.SOLVE";
				code += "(" + val1 + ", " + val2 + ");\n";
				continue;
			}

			// add and subtract
			pos = text.search(/([$a-zA-Z_0-9.]+)(\+|-)([$a-zA-Z_0-9.]+)/);
			if (pos >= 0)
			{
				var prefix = text.slice(0, pos);
				var val1 = RegExp.$1;
				pos += val1.length;
				var op = RegExp.$2
				pos += op.length;
				var val2 = RegExp.$3
				pos += val2.length;
				var postfix = text.slice(pos);

				val1 = reduce(val1);
				val2 = reduce(val2);

				text = prefix + "$" + idx + postfix;
				code += "var $" + (idx++) + " = ";
				if (op == "+")
					code += "NumJS.ADD";
				if (op == "-")
					code += "NumJS.SUB";
				code += "(" + val1 + ", " + val2 + ");\n";
				continue;
			}

			// handle imaginary literals
			pos = text.search(/^([0-9][0-9.]*)i$/);
			if (pos >= 0) {
				code += "var $" + idx + " = NumJS.C(0, " + RegExp.$1 + ");\n";
				return "$" + (idx++);
			}

			// we are done
			pos = text.search(/^[$a-zA-Z_0-9.]+$/);
			if (pos >= 0)
				return text;

			throw "NumJS.Parse parser error.";
		}
	}

	text = text.replace(new RegExp("[ \t\r\n]", "g"), "");

	var result = reduce(text);
	code += "return " + result + ";\n})";

	return code;
};

