
function test_MatLU_001()
{
	var L = NumJS.RM(4, 4);
	var U = NumJS.RM(4, 4);

	for (var i = 0; i < 4; i++)
	for (var j = 0; j < 4; j++) {
		if (i > j)
			L.set(i, j, Math.floor(Math.random()*10));
		if (i < j)
			U.set(i, j, Math.floor(Math.random()*10));
		if (i == j) {
			L.set(i, j, 1);
			U.set(i, j, Math.floor(Math.random()*9) + 1);
		}
	}

	var A = NumJS.MUL(L, U);

	printf("A = {1}\n", A);
	printf("L = {1}\n", L);
	printf("U = {1}\n", U);

	var LU = A.LU();

	if (LU == null)
		throw "LU factorization failed.";

	if (!NumJS.EQ_ABS(LU.L, L, 0.1)) {
		printf("--\nL = {1}\nU = {2}\n", LU.L, LU.U);
		throw "Mismatch in L matrix.";
	}

	if (!NumJS.EQ_ABS(LU.U, U, 0.1)) {
		printf("--\nL = {1}\nU = {2}\n", LU.L, LU.U);
		throw "Mismatch in U matrix.";
	}
}

