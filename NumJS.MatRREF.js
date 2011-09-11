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

"use strict";

NumJS.GenericMatrix.prototype.rref = function()
{
	if ("rref" in this.cache)
		return this.cache["rref"];

	var R = this.copy();
	var pivcols = new Array();

	var rank = 0;
	for (var j = 0; j < R.cols && rank < R.rows; j++)
	{
		var i = rank;
		var i_abs = NumJS.ABS(R.get(i, j));
		for (var k = rank+1; k < R.rows; k++) {
			var k_abs = NumJS.ABS(R.get(k, j));
			if (k_abs < i_abs)
				i = k, i_abs = k_abs;
		}

		if (i_abs == 0)
			continue;

		var pivot = R.get(i, j);
		for (var l = j; l < R.cols; l++) {
			var val = l != j ? NumJS.DIV(R.get(i, l), pivot) : 1;
			if (i != rank)
				R.set(i, l, R.get(rank, l));
			R.set(rank, l, val);
		}

		for (i = 0; i < R.rows; i++)
		{
			if (i == rank)
				continue;
			var factor = R.get(i, j);
			for (var l = j+1; l < R.cols; l++)
				R.set(i, l, NumJS.SUB(R.get(i, l), NumJS.MUL(R.get(rank, l), factor)));
			R.set(i, j, 0);
		}

		pivcols.push(j);
		rank++;
	}

	R.pivcols = pivcols;
	this.cache["rref"] = R;
	return this.cache["rref"];
};

NumJS.GenericMatrix.prototype.rank = function()
{
	return this.rref().pivcols.length;
};

// invert generic matrices using rref()
NumJS.GenericMatrix.prototype.op_inv = function(a)
{
	if (a.rows != a.cols)
		throw "NumJS.RREF dimension mismatch";

	var work = NumJS.MAT(a.rows, 2*a.rows);
	work.paste(0, 0, a.rows, a.rows, a.cut(0, 0, a.rows, a.rows));
	for (var i = 0; i < a.rows; i++)
		work.set(i, a.rows+i, 1);

	work = work.rref();

	if (work.pivcols.length != a.rows)
		return null;

	var result = NumJS.MAT(a.rows, a.rows);
	result.paste(0, 0, a.rows, a.rows, work.cut(0, a.rows, a.rows, a.rows));
	return result;
};

