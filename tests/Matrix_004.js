
function test_Matrix_004()
{
	var X = NumJS.MAT(2, 2, [
		0, 1,
		1, 0
	]),
		H = NumJS.MUL(1/Math.sqrt(2), NumJS.MAT(2, 2, [
		1, 1,
		1, -1
	]));

	var u = NumJS.MAT(2, 1, [ 1, 0 ]),
		v = NumJS.MAT(2, 1, [ 0, 1 ]),
		z = NumJS.MUL(1.0/Math.sqrt(2.0), NumJS.MAT(2, 1, [ NumJS.C(0,1), NumJS.C(1,0) ]));

	printf("X = {1}\n", X);
	printf("H = {1}\n", H);
	printf("u = {1}\n", u);
	printf("v = {1}\n", v);
	printf("z = {1}\n", z);
	printf("X*u == {1}\n", NumJS.MUL(X, u));
	printf("X*v == {1}\n", NumJS.MUL(X, v));
	printf("X*z == {1}\n", NumJS.MUL(X, z));
	printf("H*u == {1}\n", NumJS.MUL(H, u));
	printf("H*v == {1}\n", NumJS.MUL(H, v));
	printf("H*z == {1}\n", NumJS.MUL(H, z));
	printf("H*z*H == {1}\n", NumJS.MUL(H, NumJS.MUL(H, z)));
	
	printf("|u| == {1}\n", NumJS.NORM(u));
	printf("|v| == {1}\n", NumJS.NORM(v));
	printf("|z| == {1}\n", NumJS.NORM(z));
	
	printf("|X| == {1}\n", NumJS.DET(X));
	printf("|H| == {1}\n", NumJS.DET(H));

	checklog(0xdebd);
}

