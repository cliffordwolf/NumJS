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

NumJS.ADD = function(a, b) {
	if (typeof(a.op_add) == "function")
		return a.op_add(a, b);
	if (typeof(b.op_add) == "function")
		return b.op_add(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return a + b;
	throw "NumJS.GenOps type error";
};

NumJS.SUB = function(a, b) {
	if (typeof(a.op_sub) == "function")
		return a.op_sub(a, b);
	if (typeof(b.op_sub) == "function")
		return b.op_sub(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return a - b;
	throw "NumJS.GenOps type error";
};

NumJS.MUL = function(a, b) {
	if (typeof(a.op_mul) == "function")
		return a.op_mul(a, b);
	if (typeof(b.op_mul) == "function")
		return b.op_mul(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return a * b;
	throw "NumJS.GenOps type error";
};

NumJS.DOT = function(a, b) {
	if (typeof(a.op_mul) == "function")
		return a.op_dot(a, b);
	if (typeof(b.op_mul) == "function")
		return b.op_dot(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return a * b;
	throw "NumJS.GenOps type error";
};

NumJS.DIV = function(a, b) {
	if (typeof(a.op_div) == "function")
		return a.op_div(a, b);
	if (typeof(b.op_div) == "function")
		return b.op_div(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return a / b;
	throw "NumJS.GenOps type error";
};

NumJS.SOLVE = function(a, b) {
	if (typeof(a.op_solve) == "function")
		return a.op_solve(a, b);
	if (typeof(b.op_solve) == "function")
		return b.op_solve(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return b / a;
	throw "NumJS.GenOps type error";
};

NumJS.INV = function(a) {
	if (typeof(a.op_inv) == "function")
		return a.op_inv(a);
	if (typeof(a) == "number")
		return 1 / a;
	throw "NumJS.GenOps type error";
};

NumJS.NEG = function(a) {
	if (typeof(a.op_neg) == "function")
		return a.op_neg(a);
	if (typeof(a) == "number")
		return -a;
	throw "NumJS.GenOps type error";
};

NumJS.ABS = function(a) {
	if (typeof(a.op_abs) == "function")
		return a.op_abs(a);
	if (typeof(a) == "number")
		return Math.abs(a);
	throw "NumJS.GenOps type error";
};

NumJS.NORM = function(a) {
	if (typeof(a.op_norm) == "function")
		return a.op_norm(a);
	if (typeof(a) == "number")
		return Math.abs(a);
	throw "NumJS.GenOps type error";
};

NumJS.ARG = function(a) {
	if (typeof(a.op_arg) == "function")
		return a.op_arg(a);
	if (typeof(a) == "number")
		return a >= 0 ? 0 : Math.PI;
	throw "NumJS.GenOps type error";
};

NumJS.CONJ = function(a) {
	if (typeof(a.op_conj) == "function")
		return a.op_conj(a);
	if (typeof(a) == "number")
		return a;
	throw "NumJS.GenOps type error";
};

NumJS.TRANSP = function(a) {
	if (typeof(a.op_transp) == "function")
		return a.op_transp(a);
	if (typeof(a) == "number")
		return a;
	throw "NumJS.GenOps type error";
};

NumJS.POW = function(a, b) {
	if (typeof(a.op_pow) == "function")
		return a.op_pow(a, b);
	if (typeof(b.op_pow) == "function")
		return b.op_pow(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return Math.pow(a, b);
	throw "NumJS.GenOps type error";
};

NumJS.EXP = function(a) {
	if (typeof(a.op_exp) == "function")
		return a.op_exp(a);
	if (typeof(a) == "number")
		return Math.exp(a);
	throw "NumJS.GenOps type error";
};

NumJS.LOG = function(a) {
	if (typeof(a.op_log) == "function")
		return a.op_log(a);
	if (typeof(a) == "number")
		return Math.log(a);
	throw "NumJS.GenOps type error";
};

NumJS.DET = function(a) {
	if (typeof(a.op_det) == "function")
		return a.op_det(a);
	if (typeof(a) == "number")
		return a;
	throw "NumJS.GenOps type error";
};

NumJS.RE = function(a) {
	if (typeof(a.op_re) == "function")
		return a.op_re(a);
	if (typeof(a) == "number")
		return a;
	throw "NumJS.GenOps type error";
};

NumJS.IM = function(a) {
	if (typeof(a.op_im) == "function")
		return a.op_im(a);
	if (typeof(a) == "number")
		return 0;
	throw "NumJS.GenOps type error";
};

NumJS.EQ = function(a, b) {
	if (typeof(a.op_eq) == "function")
		return a.op_eq(a, b);
	if (typeof(b.op_eq) == "function")
		return b.op_eq(a, b);
	if (typeof(a) == "number" && typeof(b) == "number")
		return a == b;
	throw "NumJS.GenOps type error";
};

NumJS.EQ_ABS = function(a, b, d) {
	if (typeof(a.op_eq) == "function")
		return a.op_eq_abs(a, b, d);
	if (typeof(b.op_eq) == "function")
		return b.op_eq_abs(a, b, d);
	if (typeof(a) == "number" && typeof(b) == "number")
		return Math.abs(a - b) <= d;
	throw "NumJS.GenOps type error";
};

NumJS.EQ_REL = function(a, b, d) {
	if (typeof(a.op_eq) == "function")
		return a.op_eq_rel(a, b, d);
	if (typeof(b.op_eq) == "function")
		return b.op_eq_rel(a, b, d);
	if (typeof(a) == "number" && typeof(b) == "number")
		return Math.abs(a - b) <= d * Math.min(Math.abs(a), Math.abs(b));
	throw "NumJS.GenOps type error";
};

