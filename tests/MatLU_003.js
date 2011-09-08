
function test_MatLU_003()
{
	var n = 10;
	var A = NumJS.MAT(n, n);
	var Y = NumJS.MAT(n, 2*n);

	printf("Solving complex {1}x{1} system for {2} right hand side vectors.\n", n, n*2);

	for (var i = 0; i < n; i++)
	for (var j = 0; j < n*2; j++) {
		if (j < n)
			A.set(i, j, NumJS.C(Math.floor(Math.random()*100)-50, Math.floor(Math.random()*100)-50));
		Y.set(i, j, NumJS.C(Math.floor(Math.random()*100)-50, Math.floor(Math.random()*100)-50));
	}

	// printf("A = {1}\n", A);
	// printf("Y = {1}\n", Y);

	var PLU = A.PLU();

	if (PLU == null)
		throw "PLU factorization failed.";

	// printf("P = {1}\n", PLU.P);
	// printf("L = {1}\n", PLU.L);
	// printf("U = {1}\n", PLU.U);

	var X = PLU.solve(Y);

	// printf("X = {1}\n", X);

	var AX = NumJS.MUL(A, X);

	if (!NumJS.EQ_ABS(AX, Y, 1e-3))
		throw "Mismatch in AX == Y.";
}

