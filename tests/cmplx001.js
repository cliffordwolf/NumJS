
function test_cmplx001()
{
	var a = NumJS.C(2, 1);
	var b = NumJS.C(0, 2);
	var c = NumJS.ADD(a, b);
	var d = NumJS.MUL(a, b);
	// var e = NumJS.POW(b, 2);
	var e = NumJS.MUL(b, b);

	print("a = 2 + 1i;  b = 2i;  c = a + b;  d = a * b;  e = b^2;\n");
	printf("a = {1}; ", a);
	printf("b = {1}; ", b);
	printf("c = {1}; ", c);
	printf("d = {1}; ", d);
	printf("e = {1};\n", e);

	if (!NumJS.EQ(a, NumJS.C( 2, 1))) throw "Mismatch in value of 'a'";
	if (!NumJS.EQ(b, NumJS.C( 0, 2))) throw "Mismatch in value of 'b'";
	if (!NumJS.EQ(c, NumJS.C( 2, 3))) throw "Mismatch in value of 'c'";
	if (!NumJS.EQ(d, NumJS.C(-2, 4))) throw "Mismatch in value of 'd'";
	if (!NumJS.EQ(e, NumJS.C(-4, 0))) throw "Mismatch in value of 'e'";
}

