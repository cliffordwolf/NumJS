
function test_MatLU_002()
{
	var A = NumJS.RM(4, 4);

	for (var i = 0; i < 4; i++)
	for (var j = 0; j < 4; j++)
		A.set(i, j, Math.floor(Math.random()*100));

	printf("A = {1}\n", A);

	var PLU = A.PLU();

	if (PLU == null)
		throw "PLU factorization failed.";

	printf("P = {1}\n", PLU.P);
	printf("L = {1}\n", PLU.L);
	printf("U = {1}\n", PLU.U);

	var PA = NumJS.MUL(PLU.P, A);
	var LU = NumJS.MUL(PLU.L, PLU.U);

	printf("PA = {1}\n", PA);
	printf("LU = {1}\n", LU);

	if (!NumJS.EQ_ABS(PA, LU, 1e-6))
		throw "Mismatch in PA == LU.";
}

