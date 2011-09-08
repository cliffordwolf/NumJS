
function test_Matrix_003()
{
	var A = NumJS.MAT(3, 3, [
		1, 2, 3,
		4, 5, 6,
		7, 8, 9
	]);

	var B = NumJS.MAT(3, 3);
	B.paste_cm(0, 0, 3, 1, A.cut(0, 0, 1, 3))
	B.paste(0, 1, 2, 2, A.cut_cm(1, 0, 2, 2));
	B.paste(2, 1, 1, 2, NumJS.TRANSP(A).cut(2, 1, 1, 2));

	printf("A = {1}\n", A);
	printf("B = {1}\n", B);

	checklog(0xa3f7);
}

