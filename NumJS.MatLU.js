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
	var A, P, L, U;
	var n = this.rows;

	if (this.rows != this.cols)
		throw "NumJS.MatLU dimension mismatch";

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
		L.set(k, k, 1);
		for (var i = k+1; i < n; i++) {
			var pivot = U.get(k, k);
			if (pivot == 0)
				return null;
			L.set(i, k, NumJS.DIV(U.get(i, k), pivot));
			for (var j = k+1; j < n; j++)
				U.set(i, j, NumJS.SUB(U.get(i, j), NumJS.MUL(L.get(i, k), U.get(k, j))));
		}
	}

	for (var i = 1; i < n; i++)
	for (var j = 0; j < i; j++)
		U.set(i, j, 0);

	return new NumJS.GenericPLU(P, L, U);
};

