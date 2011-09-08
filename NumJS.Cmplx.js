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
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return NumJS.C(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return NumJS.C(a.re * b, a.im * b);
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return NumJS.C(a * b.re, a * b.im);
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_dot) == "function"))
			return b.op_dot(a, b);
		throw "NumJS.Cmplx type error";
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
	op_solve: function(a, b) {
		var aIsScalar = typeof(a) == "number" || a instanceof NumJS.Cmplx;
		var bIsScalar = typeof(b) == "number" || b instanceof NumJS.Cmplx;
		if (aIsScalar && bIsScalar)
			return this.op_div(b, a);
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_solve) == "function"))
			return b.op_solve(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_pow: function(a, b) {
		var aIsScalar = typeof(a) == "number" || a instanceof NumJS.Cmplx;
		var bIsScalar = typeof(b) == "number" || b instanceof NumJS.Cmplx;
		if (aIsScalar && bIsScalar) {
			var aIsReal = NumJS.IM(a) == 0;
			var bIsReal = NumJS.IM(b) == 0;
			if (aIsReal && bIsReal)
				return Math.pow(NumJS.RE(a), NumJS.RE(b));
			if (aIsReal)
				return NumJS.EXP(NumJS.MUL(b, NumJS.LOG(a)));
			if (bIsReal)
				return NumJS.P(Math.pow(NumJS.ABS(a), NumJS.RE(b)), NumJS.ARG(a) * NumJS.RE(b));
		}
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_pow) == "function"))
			return b.op_pow(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_inv: function(a) {
		return NumJS.C(1 / (a.re*a.re + a.im*a.im), -a.im / (a.re*a.re + a.im*a.im));
	},
	op_neg: function(a) {
		return NumJS.C(-a.re, -a.im);
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
	op_transp: function(a) {
		return a;
	},
	op_exp: function(a) {
		var len = Math.exp(a.re);
		if (a.im == 0)
			return len;
		return NumJS.C(len * Math.cos(a.im), len * Math.sin(a.im));
	},
	op_log: function(a) {
		if (a.im == 0)
			return Math.log(a.re);
		throw "NumJS.Cmplx type error";
	},
	op_det: function(a) {
		return a;
	},
	op_re: function(a) {
		return a.re;
	},
	op_im: function(a) {
		return a.im;
	},
	op_eq: function(a, b) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return a.re == b.re && a.im == b.im;
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return a.re == b && a.im == 0;
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return a == b.re && 0 == b.im;
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_eq) == "function"))
			return b.op_eq(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_eq_abs: function(a, b, d) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx))
			return Math.abs(a.re - b.re) <= d && Math.abs(a.im - b.im) <= d;
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number"))
			return Math.abs(a.re - b) <= d && Math.abs(a.im - 0) <= d;
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx))
			return Math.abs(a - b.re) <= d && Math.abs(0 - b.im) <= d;
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_eq) == "function"))
			return b.op_eq_abs(a, b);
		throw "NumJS.Cmplx type error";
	},
	op_eq_rel: function(a, b, d) {
		if ((a instanceof NumJS.Cmplx) && (b instanceof NumJS.Cmplx)) {
			d *= Math.min(this.op_abs(a), this.op_abs(b));
			return Math.abs(a.re - b.re) <= d && Math.abs(a.im - b.im) <= d;
		}
		if ((a instanceof NumJS.Cmplx) && (typeof(b) == "number")) {
			d *= Math.min(this.op_abs(a), Math.abs(b));
			return Math.abs(a.re - b) <= d && Math.abs(a.im - 0) <= d;
		}
		if ((typeof(a) == "number") && (b instanceof NumJS.Cmplx)) {
			d *= Math.min(Math.abs(a), this.op_abs(b));
			return Math.abs(a - b.re) <= d && Math.abs(0 - b.im) <= d;
		}
		if (!(b instanceof NumJS.Cmplx) && (typeof(b.op_eq) == "function"))
			return b.op_eq_rel(a, b);
		throw "NumJS.Cmplx type error";
	},
	toString: function() {
		return "(" + this.re + (this.im >= 0 ? "+" : "") + this.im + "i)";
	}
};

