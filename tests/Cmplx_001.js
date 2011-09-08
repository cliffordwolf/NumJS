
function test_Cmplx_001()
{
	var a = NumJS.C(2, 1);
	var b = NumJS.C(0, 2);
	var c = NumJS.ADD(a, b);
	var d = NumJS.MUL(a, b);
	var e = NumJS.POW(b, 2);

	print("a = 2 + 1i;  b = 2i;  c = a + b;  d = a * b;  e = b^2;\n");
	printf("a = {1}; ", a);
	printf("b = {1}; ", b);
	printf("c = {1}; ", c);
	printf("d = {1}; ", d);
	printf("e = {1};\n", NumJS.ROUND(e, 3));

	if (!NumJS.EQ_ABS(a, NumJS.C( 2, 1), 1e-6)) throw "Mismatch in value of 'a'";
	if (!NumJS.EQ_ABS(b, NumJS.C( 0, 2), 1e-6)) throw "Mismatch in value of 'b'";
	if (!NumJS.EQ_ABS(c, NumJS.C( 2, 3), 1e-6)) throw "Mismatch in value of 'c'";
	if (!NumJS.EQ_ABS(d, NumJS.C(-2, 4), 1e-6)) throw "Mismatch in value of 'd'";
	if (!NumJS.EQ_ABS(e, NumJS.C(-4, 0), 1e-6)) throw "Mismatch in value of 'e'";

	checklog(0xb772);
}

