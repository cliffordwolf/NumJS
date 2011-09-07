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

NumJS.GenericPLU = function(P, L, U)
{
	this.P = P;
	this.L = L;
	this.U = U;
};

NumJS.GenericMatrix.prototype.LU = function()
{
	if (this.rows != this.cols)
		throw "NumJS.MatLU dimension mismatch";

	if ("LU" in this.cache)
		return this.cache["LU"];

	var A, P, L, U;
	var n = this.rows;

	// in this LU solver P is just the identity
	P = NumJS.PM(n);

	if (this instanceof NumJS.CMatrix)
		L = NumJS.CM(n, n);
	else
		L = NumJS.RM(n, n);

	A = this.copy();
	U = this.copy();

	for (var k = 0; k < n; k++)
	{
		var pivot = U.get(k, k);
		if (NumJS.ABS(pivot) == 0)
			return null;

		L.set(k, k, 1);
		for (var i = k+1; i < n; i++) {
			L.set(i, k, NumJS.DIV(U.get(i, k), pivot));
			for (var j = k+1; j < n; j++)
				U.set(i, j, NumJS.SUB(U.get(i, j), NumJS.MUL(L.get(i, k), U.get(k, j))));
			U.set(i, k, 0);
		}
	}

	this.cache["LU"] = new NumJS.GenericPLU(P, L, U);
	return this.cache["LU"];
};

NumJS.GenericMatrix.prototype.PLU = function()
{
	if (this.rows != this.cols)
		throw "NumJS.MatLU dimension mismatch";

	if ("PLU" in this.cache)
		return this.cache["PLU"];

	var A, P, L, U;
	var n = this.rows;

	P = NumJS.PM(n);

	if (this instanceof NumJS.CMatrix)
		L = NumJS.CM(n, n);
	else
		L = NumJS.RM(n, n);

	A = this.copy();
	U = this.copy();

	for (var k = 0; k < n; k++)
	{
		// find the correct row
		var pivot = U.get(k, k);
		var pivot_i = k;
		var pivot_abs = NumJS.ABS(pivot);
		for (var i = k+1; i < n; i++) {
			var pv = U.get(i, k)
			var pa = NumJS.ABS(pv);
			if (pa > pivot_abs) {
				pivot = pv;
				pivot_i = i;
				pivot_abs = pa;
			}
		}

		if (pivot_i != k) {
			// perform row pivoting in L
			for (var j = 0; j < k; j++) {
				var t1 = L.get(k, j);
				var t2 = L.get(pivot_i, j);
				L.set(k, j, t2);
				L.set(pivot_i, j, t1);
			}
			// perform row pivoting in U
			for (var j = k; j < n; j++) {
				var t1 = U.get(k, j);
				var t2 = U.get(pivot_i, j);
				U.set(k, j, t2);
				U.set(pivot_i, j, t1);
			}
			P.pivot_row(pivot_i, k);
		}

		if (NumJS.ABS(pivot) == 0)
			return null;

		L.set(k, k, 1);
		for (var i = k+1; i < n; i++) {
			L.set(i, k, NumJS.DIV(U.get(i, k), pivot));
			for (var j = k+1; j < n; j++)
				U.set(i, j, NumJS.SUB(U.get(i, j), NumJS.MUL(L.get(i, k), U.get(k, j))));
			U.set(i, k, 0);
		}
	}

	this.cache["PLU"] = new NumJS.GenericPLU(P, L, U);
	return this.cache["PLU"];
};

