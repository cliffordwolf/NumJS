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

