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

if (typeof(NumJS) == "undefined")
	var NumJS = new Object();

NumJS.Cmplx = function(re, im) {
	this.re = re;
	this.im = im;
};

NumJS.C = function(re, im) {
	return new NumJS.Cmplx(re, im);
};

NumJS.P = function(abs, arg) {
	var re = abs * Math.cos(arg);
	var im = abs * Math.sin(arg);
	return new NumJS.Cmplx(re, im);
};

NumJS.Cmplx.prototype =
{
	op_add: function(a, b) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return NumJS.C(a.re + b.re, a.im + b.im);
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return NumJS.C(a.re + b, a.im);
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return NumJS.C(a + b.re, b.im);
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_add) == "function"))
			return b.op_add(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_sub: function(a, b) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return NumJS.C(a.re - b.re, a.im - b.im);
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return NumJS.C(a.re - b, a.im);
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return NumJS.C(a - b.re, b.im);
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_sub) == "function"))
			return b.op_sub(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_mul: function(a, b) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return NumJS.C(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return NumJS.C(a.re * b, a.im * b);
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return NumJS.C(a * b.re, a * b.im);
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_mul) == "function"))
			return b.op_mul(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_dot: function(a, b) {
		return this.op_mul(a, b);
	},
	op_div: function(a, b) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return NumJS.C((a.re*b.re + a.im*b.im) / (b.re*b.re + b.im*b.im),
					(a.im*b.re - a.re*b.im) / (b.re*b.re + b.im*b.im));
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return NumJS.C(a.re / b, a.im / b);
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return NumJS.C(a / (b.re*b.re + b.im*b.im), (-a*b.im) / (b.re*b.re + b.im*b.im));
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_div) == "function"))
			return b.op_div(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_inv: function(a) {
		if (a instanceof NumJS.Cmplx)
			return NumJS.C(1 / (a.re*a.re + a.im*a.im), -a.im / (a.re*a.re + a.im*a.im));
		throw "NumJS.Cmplx type error";
	},
	op_abs: function(a) {
		return Math.sqrt(a.re*a.re + a.im*a.im);
	},
	op_norm: function(a) {
		return Math.sqrt(a.re*a.re + a.im*a.im);
	},
	op_arg: function(a) {
		return Math.atan2(a.im, a.re);
	},
	op_conj: function(a) {
		return NumJS.C(a.re, -a.im);
	},
	op_re: function(a) {
		return a.re;
	},
	op_im: function(a) {
		return a.im;
	},
	toString: function() {
		return this.re + "+" + this.im + "i";
	}
};

