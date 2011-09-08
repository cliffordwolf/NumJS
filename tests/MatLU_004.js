
function test_MatLU_004()
{
	var A = NumJS.MAT(5, 5, [
		53,  93,  47,  74,  18,
		41,  37,  78,  83,  72,
		59,   8,  99,  75,   7,
		59,  61,  95,  62,   6,
		21,  46,  14,  51,  40
	]);

	var Y = NumJS.MAT(5, 1, [766, 1041, 707, 744, 559]);

	printf("A = {1}\n", A);
	printf("Y = {1}\n", Y);

	var X = NumJS.ROUND(NumJS.SOLVE(A, Y));
	printf("X = {1}\n", X);

	if (!NumJS.EQ_ABS(X, NumJS.MAT(5, 1, [1, 2, 3, 4, 5]), 1e-3))
		throw "Invalid result for solve(A, Y).";

	var det = A.PLU().det();
	printf("A.PLU().det() = {1}\n", det);

	if (!NumJS.EQ_ABS(det, -6370, 100))
		throw "Invalid result for det(A).";

	var B = NumJS.MAT(3, 3, [
		NumJS.C(2, 6), NumJS.C(1, 2), NumJS.C( 8, 2),
		NumJS.C(8, 1), NumJS.C(2, 3), NumJS.C(10, 4),
		NumJS.C(5, 7), NumJS.C(7, 9), NumJS.C( 5, 5)
	]);

	printf("B = {1}\n", B);

	var det = B.PLU().det();
	printf("B.PLU().det() = {1}\n", det);

	if (!NumJS.EQ_ABS(det, NumJS.C(741, 115), 10))
		throw "Invalid result for det(B).";
}

