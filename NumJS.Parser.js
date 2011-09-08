
/*
 *  NumJS -- a JavaScript library for numerical computing
 *
 *  Copyright (C) 2011  Clifford Wolf <clifford@clifford.at>
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

"use strict";

NumJS.Parse = function(argNames, text)
{
	var code = "function(" + argNames + "){\n";
	var idx = 0;

	// this function reduces a textual expression to
	// a single variable index and returns the corrspondig
	// basic "$n" expression, writing the actual js code
	// to the code variable on the way.
	function reduce(text)
	{
		var pos;

		function consumeToken() {
			if (!text.match(/^(\$[a-zA-Z_0-9]+|.)/))
				throw "NumJS.Parse parser error.";
			var token = RegExp.$1;
			text = text.replace(/^(\$[a-zA-Z_0-9]+|.)/, "");
			return token;
		}

		while (1)
		{
			// blocks and function calls
			pos = text.search(/[a-zA-Z_0-9]*\(/);
			if (pos >= 0)
			{
				var prefix = text.slice(0, pos);
				var postfix = text.slice(pos);
				var funcname = postfix.match(/^[a-zA-Z_0-9]*/)[0];
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

				if (funcname != "")
					throw "NumJS.Parse functions TBD.";

				text = prefix + reduce(inner) + postfix;
				continue;
			}

			// multiply and divide
			pos = text.search(/([$a-zA-Z_0-9]+)(\*|\.|\/|\\)([$a-zA-Z_0-9]+)/);
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
			pos = text.search(/([$a-zA-Z_0-9]+)(\+|-)([$a-zA-Z_0-9]+)/);
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

				text = prefix + "$" + idx + postfix;
				code += "var $" + (idx++) + " = ";
				if (op == "+")
					code += "NumJS.ADD";
				if (op == "-")
					code += "NumJS.SUB";
				code += "(" + val1 + ", " + val2 + ");\n";
				continue;
			}

			// we are done
			pos = text.search(/^[$a-zA-Z_0-9]+$/);
			if (pos >= 0)
				return text;

			throw "NumJS.Parse parser error.";
		}
	}

	text = text.replace(new RegExp("[ \t\r\n]", "g"), "");

	var result = reduce(text);
	code += "return " + result + ";\n}\n";

	return code;
};

