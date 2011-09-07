
function test_Matrix_002()
{
	var M = NumJS.RM(4, 4, [
		1, 2, 3, 4,
		5, 6, 7, 8,
		9, 0, 1, 2,
		3, 4, 5, 6
	]);

	var v = NumJS.RM(4, 1, [ 10, 20, 30, 40 ]);

	printf("M = {1}\n", M);
	printf("v = {1}\n", v);
	printf("M*v == {1}\n", NumJS.MUL(M, v));

	var P = NumJS.PM(4);

	P.pivot_col(0, 1);
	P.pivot_col(1, 2);
	P.pivot_col(2, 3);

	printf("P = {1}\n", P);
	printf("P*v == {1}\n", NumJS.MUL(P, v));

	var Pinv = NumJS.INV(P);
	var w = NumJS.MUL(P, v);

	printf("P' == {1}\n", Pinv);
	printf("P'*(P*v) == {1}\n", NumJS.MUL(Pinv, w));
	printf("(P')*P == {1}\n", NumJS.MUL(Pinv, P));

	var P1 = NumJS.PM(4);
	var P2 = NumJS.PM(4);

	P1.pivot_col(0, 1);
	P2.pivot_col(1, 2);
	P2.pivot_col(2, 3);

	printf("P1 = {1}\n", P1);
	printf("P2 = {1}\n", P2);
	printf("P1*P2 == {1}\n", NumJS.MUL(P1, P2));

	checklog(0xb4de);
}

