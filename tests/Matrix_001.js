
function test_Matrix_001()
{
	var A = NumJS.MAT(2, 2, [1, 2, 3, 4]);

	var B_re = NumJS.MAT(2, 2, [5, 6, 7, 8]);
	var B_im = NumJS.MAT(2, 2, [9, 0, 1, 2]);
	var B = NumJS.ADD(B_re, NumJS.MUL(B_im, NumJS.C(0,1)));

	var Z = NumJS.MUL(A, B);

	printf("A: {1}\n", A);
	printf("B_re: {1}\n", B_re);
	printf("B_im: {1}\n", B_im);
	printf("B: {1}\n", B);
	printf("Z: {1}\n", Z);

	checklog(0xf177);
}

