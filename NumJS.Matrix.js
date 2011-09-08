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

// Generic Matrix -- do not instanciate directly!

NumJS.GenericMatrix = function() {
};

NumJS.GenericMatrix.prototype =
{
	get: function(i, j) {
		throw "NumJS.Matrix called virtual function from NumJS.GenericMatrix";
	},
	set: function(i, j, v) {
		throw "NumJS.Matrix called virtual function from NumJS.GenericMatrix";
	},
	copy: function() {
		var result;
		if (this instanceof NumJS.CMatrix) {
			result = new NumJS.CMatrix(this.rows, this.cols);
		} else {
			result = new NumJS.RMatrix(this.rows, this.cols);
		}
		for (var i=0; i < this.rows; i++)
		for (var j=0; j < this.cols; j++)
			result.set(i, j, this.get(i, j));
		return result;
	},
	clone: function() {
		return this.copy();
	},
	op_add: function(a, b) {
		if ((a instanceof NumJS.GenericMatrix) && (b instanceof NumJS.GenericMatrix))
		{
			var result;
			if (a.rows != b.rows || a.cols != b.cols)
				throw "NumJS.Matrix dimension mismatch";
			if ((a instanceof NumJS.CMatrix) || (b instanceof NumJS.CMatrix))
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.ADD(a.get(i, j), b.get(i, j)));
			return result;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_add) == "function"))
			return b.op_add(a, b);
		throw "NumJS.Matrix type error";
	},
	op_sub: function(a, b) {
		if ((a instanceof NumJS.GenericMatrix) && (b instanceof NumJS.GenericMatrix))
		{
			var result;
			if (a.rows != b.rows || a.cols != b.cols)
				throw "NumJS.Matrix dimension mismatch";
			if ((a instanceof NumJS.CMatrix) || (b instanceof NumJS.CMatrix))
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.SUB(a.get(i, j), b.get(i, j)));
			return result;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_sub) == "function"))
			return b.op_sub(a, b);
		throw "NumJS.Matrix type error";
	},
	op_mul: function(a, b) {
		var aIsMatrix = a instanceof NumJS.GenericMatrix;
		var bIsMatrix = b instanceof NumJS.GenericMatrix;
		if (aIsMatrix && bIsMatrix)
		{
			var result;
			if (a.cols != b.rows)
				throw "NumJS.Matrix dimension mismatch";
			if ((a instanceof NumJS.CMatrix) || (b instanceof NumJS.CMatrix))
				result = new NumJS.CMatrix(a.rows, b.cols);
			else
				result = new NumJS.RMatrix(a.rows, b.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < b.cols; j++)
			{
				var v = result.get(i, j);
				for (var k=0; k < a.cols; k++)
					v = NumJS.ADD(v, NumJS.MUL(a.get(i, k), b.get(k, j)));
				result.set(i, j, v);
			}
			return result;
		}
		var aIsScalar = typeof(a) == "number" || a instanceof NumJS.Cmplx;
		var bIsScalar = typeof(b) == "number" || b instanceof NumJS.Cmplx;
		if (aIsMatrix && bIsScalar)
		{
			var result;
			if ((a instanceof NumJS.CMatrix) || (b instanceof NumJS.Cmplx))
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.MUL(a.get(i, j), b));
			return result;
		}
		if (aIsScalar && bIsMatrix)
		{
			var result;
			if ((b instanceof NumJS.CMatrix) || (a instanceof NumJS.Cmplx))
				result = new NumJS.CMatrix(b.rows, b.cols);
			else
				result = new NumJS.RMatrix(b.rows, b.cols);
			for (var i=0; i < b.rows; i++)
			for (var j=0; j < b.cols; j++)
				result.set(i, j, NumJS.MUL(b.get(i, j), a));
			return result;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_mul) == "function"))
			return b.op_mul(a, b);
		throw "NumJS.Matrix type error";
	},
	op_dot: function(a, b) {
		if ((a instanceof NumJS.GenericMatrix) && (b instanceof NumJS.GenericMatrix))
		{
			var result = 0;
			if (a.cols != b.cols || a.rows != b.rows)
				throw "NumJS.Matrix dimension mismatch";
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < b.cols; j++)
				result = NumJS.ADD(result, NumJS.MUL(a.get(i, j), b.get(i, j)));
			return result;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_dot) == "function"))
			return b.op_dot(a, b);
		throw "NumJS.Matrix type error";
	},
	op_div: function(a, b) {
		var aIsMatrix = a instanceof NumJS.GenericMatrix;
		var bIsScalar = typeof(b) == "number" || b instanceof NumJS.Cmplx;
		if (aIsMatrix && bIsScalar)
		{
			var result;
			if ((a instanceof NumJS.CMatrix) || (b instanceof NumJS.CMatrix))
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.DIV(a.get(i, j), b));
			return result;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_div) == "function"))
			return b.op_div(a, b);
		throw "NumJS.Matrix type error";
	},
	op_solve: function(a, b) {
		var aIsMatrix = a instanceof NumJS.GenericMatrix;
		var bIsMatrix = b instanceof NumJS.GenericMatrix;
		if (aIsMatrix && bIsMatrix) {
			var PLU = a.PLU();
			if (PLU == null)
				return null;
			return PLU.solve(b);
		}
		var aIsScalar = typeof(a) == "number" || a instanceof NumJS.Cmplx;
		if (aIsScalar && bIsMatrix)
			return this.op_div(b, a);
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_solve) == "function"))
			return b.op_solve(a, b);
		throw "NumJS.Matrix type error";
	},
	op_pow: function(a, b) {
		var aIsMatrix = a instanceof NumJS.GenericMatrix;
		var bIsScalar = typeof(b) == "number" || b instanceof NumJS.Cmplx;
		if (aIsMatrix && bIsScalar)
		{
			var result;
			if (a.cols != a.rows)
				throw "NumJS.Matrix dimension mismatch";
			if (NumJS.IM(b) != 0 || NumJS.RE(b) != Math.round(NumJS.RE(b)) || NumJS.RE(b) < 0)
				throw "NumJS.Matrix negative, fractional or complex matrix power";
			if ((a instanceof NumJS.CMatrix) || (b instanceof NumJS.CMatrix))
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
				result.set(i, i, 1);
			for (var i=0; i < NumJS.RE(b); i++)
				result = NumJS.MUL(result, a);
			return result;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_div) == "function"))
			return b.op_div(a, b);
		throw "NumJS.Matrix type error";
	},
	op_neg: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.NEG(a.get(j, i)));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_abs: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.ABS(a.get(j, i)));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_norm: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var norm2 = 0;
			if (a.cols != 1 && a.rows != 1)
				throw "NumJS.Matrix dimension mismatch";
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++) {
				var v = a.get(j, i);
				if (NumJS.IM(v) != 0)
					throw "NumJS.Matrix type error";
				v = NumJS.RE(v);
				norm2 += v*v;
			}
			return Math.sqrt(norm2);
		}
		throw "NumJS.Matrix type error";
	},
	op_arg: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.ARG(a.get(j, i)));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_conj: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.CONJ(a.get(j, i)));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_transp: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, a.get(j, i));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_det: function(a) {
		var PLU = a.PLU();
		if (PLU == null)
			return 0;
		return PLU.det();
	},
	op_re: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.RE(a.get(j, i)));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_im: function(a) {
		if (a instanceof NumJS.GenericMatrix)
		{
			var result;
			if (a instanceof NumJS.CMatrix)
				result = new NumJS.CMatrix(a.rows, a.cols);
			else
				result = new NumJS.RMatrix(a.rows, a.cols);
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < a.cols; j++)
				result.set(i, j, NumJS.IM(a.get(j, i)));
			return result;
		}
		throw "NumJS.Matrix type error";
	},
	op_eq: function(a, b) {
		if ((a instanceof NumJS.GenericMatrix) && (b instanceof NumJS.GenericMatrix))
		{
			if (a.cols != b.cols || a.rows != b.rows)
				throw "NumJS.Matrix dimension mismatch";
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < b.cols; j++)
				if (!NumJS.EQ(a.get(i, j), b.get(i, j)))
					return false;
			return true;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_eq) == "function"))
			return b.op_eq(a, b);
		throw "NumJS.Matrix type error";
	},
	op_eq_abs: function(a, b, d) {
		if ((a instanceof NumJS.GenericMatrix) && (b instanceof NumJS.GenericMatrix))
		{
			if (a.cols != b.cols || a.rows != b.rows)
				throw "NumJS.Matrix dimension mismatch";
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < b.cols; j++)
				if (!NumJS.EQ_ABS(a.get(i, j), b.get(i, j), d))
					return false;
			return true;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_eq_abs) == "function"))
			return b.op_eq_abs(a, b);
		throw "NumJS.Matrix type error";
	},
	op_eq_rel: function(a, b, d) {
		if ((a instanceof NumJS.GenericMatrix) && (b instanceof NumJS.GenericMatrix))
		{
			if (a.cols != b.cols || a.rows != b.rows)
				throw "NumJS.Matrix dimension mismatch";
			for (var i=0; i < a.rows; i++)
			for (var j=0; j < b.cols; j++)
				if (!NumJS.EQ_REL(a.get(i, j), b.get(i, j), d))
					return false;
			return true;
		}
		if (!(b instanceof NumJS.GenericMatrix) && (typeof(b.op_eq_rel) == "function"))
			return b.op_eq_rel(a, b);
		throw "NumJS.Matrix type error";
	},
	toString: function() {
		var str = "[ ";
		for (var i=0; i < this.rows; i++)
		{
			for (var j=0; j < this.cols; j++)
				str += (j > 0 ? ", " : "") + this.get(i, j);
			if (i < this.rows-1)
				str += "; "
		}
		str += " ]";
		return str;
	}
};

// Matrix of real values

NumJS.RMatrix = function(rows, cols, initdata) {
	this.rows = rows;
	this.cols = cols;
	if (typeof(Float32Array) != "undefined")
		this.data = new Float32Array(this.rows * this.cols);
	else
		this.data = Array();
	this.cache = new Object();
	for (var i=0; i < this.rows; i++)
	for (var j=0; j < this.cols; j++)
		this.data[i*this.cols + j] = 0;
	if (initdata instanceof Array) {
		if (initdata.length != this.rows*this.cols)
			throw "NumJS.Matrix initdata dimension mismatch";
		for (var i = 0; i < initdata.length; i++)
			this.data[i] = initdata[i];
	}
};

NumJS.RM = function(rows, cols, initdata) {
	return new NumJS.RMatrix(rows, cols, initdata);
};

NumJS.RMatrix.prototype = new NumJS.GenericMatrix();

NumJS.RMatrix.prototype.get = function(i, j) {
	var idx = i*this.cols + j;
	return this.data[idx];
};

NumJS.RMatrix.prototype.set = function(i, j, v) {
	var idx = i*this.cols + j;
	this.data[idx] = v;
	this.cache = new Object();
};

// Matrix of complex values

NumJS.CMatrix = function(rows, cols, initdata) {
	this.rows = rows;
	this.cols = cols;
	if (typeof(Float32Array) != "undefined") {
		this.re_data = new Float32Array(this.rows * this.cols);
		this.im_data = new Float32Array(this.rows * this.cols);
	} else {
		this.re_data = Array();
		this.im_data = Array();
	}
	this.cache = new Object();
	for (var i=0; i < this.rows; i++)
	for (var j=0; j < this.cols; j++) {
		this.re_data[i*this.cols + j] = 0;
		this.im_data[i*this.cols + j] = 0;
	}
	if (initdata instanceof Array) {
		if (initdata.length != this.rows*this.cols)
			throw "NumJS.Matrix initdata dimension mismatch";
		for (var i = 0; i < initdata.length; i++) {
			this.re_data[i] = NumJS.RE(initdata[i]);
			this.im_data[i] = NumJS.IM(initdata[i]);
		}
	}
};

NumJS.CM = function(rows, cols, initdata) {
	return new NumJS.CMatrix(rows, cols, initdata);
};

NumJS.CMatrix.prototype = new NumJS.GenericMatrix();

NumJS.CMatrix.prototype.get = function(i, j) {
	var idx = i*this.cols + j;
	return NumJS.C(this.re_data[idx], this.im_data[idx]);
};

NumJS.CMatrix.prototype.set = function(i, j, v) {
	var idx = i*this.cols + j;
	this.re_data[idx] = NumJS.RE(v);
	this.im_data[idx] = NumJS.IM(v);
	this.cache = new Object();
};

// Permutation Matrix

NumJS.PMatrix = function(dim, initdata) {
	this.sign = 1;
	this.rows = dim;
	this.cols = dim;
	this.data = Array();
	this.cache = new Object();
	for (var i=0; i < dim; i++)
		this.data[i] = i;
	if (initdata instanceof Array)
	{
		var tmp = new Array();
		if (initdata.length != dim)
			throw "NumJS.Matrix initdata dimension mismatch";
		for (var i = 0; i < initdata.length; i++)
			tmp[i] = this.data[i] = initdata[i];

		// detecting sign: shakersort and count number of exchanges
		var sort_done = 0;
		while (!sort_done) {
			sort_done = 1;
			for (var i = 1; i < dim; i++)
				if (tmp[i-1] > tmp[i]) {
					sort_done = 0;
					this.sign *= -1;
					var t = tmp[i-1];
					tmp[i-1] = tmp[i];
					tmp[i] = t;
				}
			for (var i = dim-1; i > 0; i--)
				if (tmp[i-1] > tmp[i]) {
					sort_done = 0;
					this.sign *= -1;
					var t = tmp[i-1];
					tmp[i-1] = tmp[i];
					tmp[i] = t;
				}
		}

		for (var i = 0; i < dim; i++)
			if (tmp[i] != i)
				throw "NumJS.Matrix initdata not a permutation";
	}
};

NumJS.PM = function(dim, initdata) {
	return new NumJS.PMatrix(dim, initdata);
};

NumJS.PMatrix.prototype = new NumJS.GenericMatrix();

NumJS.PMatrix.prototype.get = function(i, j) {
	if (this.data[j] == i)
		return 1;
	return 0;
};

// The PMatrix .data array stores the row number of the '1' in each column.
// therefore column pivoting is trivial and row pivoting must be performed indirectly

NumJS.PMatrix.prototype.pivot_col = function(i, j) {
	if (i != j) {
		var tmp = this.data[i];
		this.data[i] = this.data[j];
		this.data[j] = tmp;
		this.sign *= -1;
		this.cache = new Object();
	}
};

NumJS.PMatrix.prototype.pivot_row = function(i, j) {
	if (i != j) {
		i = this.data.indexOf(i);
		j = this.data.indexOf(j);
		this.pivot_col(i, j);
	}
};

NumJS.PMatrix.prototype.clone = function() {
	var result = new NumJS.PMatrix(this.rows);
	for (var i = 0; i < this.rows; i++)
		result.data[i] = this.data[i];
	result.sign = this.sign;
	return result;
};

NumJS.PMatrix.prototype.op_transp = function(a) {
	if (a instanceof NumJS.PMatrix)
	{
		var result = new NumJS.PMatrix(a.rows);
		for (var i = 0; i < a.rows; i++) {
			var j = a.data[i];
			result.data[j] = i;
		}
		result.sign = a.sign;
		return result;
	}
	throw "NumJS.Matrix type error";
};

NumJS.PMatrix.prototype.op_mul = function(a, b) {
	if ((a instanceof NumJS.PMatrix) && (b instanceof NumJS.PMatrix))
	{
		if (a.cols != b.rows)
			throw "NumJS.Matrix dimension mismatch";
		var result = new NumJS.PMatrix(a.rows);
		for (var i = 0; i < a.rows; i++)
			result.data[i] = a.data[b.data[i]];
		result.sign = a.sign * b.sign;
		return result;
	}
	// Fallback to normal matrix-matrix multiplikation
	return NumJS.GenericMatrix.prototype.op_mul(a, b);
};

NumJS.PMatrix.prototype.op_det = function(a) {
	return a.sign;
};

NumJS.PMatrix.prototype.op_conj = NumJS.PMatrix.prototype.op_transp;
NumJS.PMatrix.prototype.op_inv = NumJS.PMatrix.prototype.op_transp;

