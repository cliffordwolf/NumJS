
function test_Parser_001()
{
	var text = "a + b * -(c / pow(-0.2e+1i, a)) + b";
	var code = NumJS.Parse(text, "a, b, c", { pow: "NumJS.POW" });
	printf("Text: {1}\n", text);
	// printf("Code: {1}\n", code);

	var f = eval(code);
	printf("f(1,2,3) = {1}\n", f(1, 2, 3).toFixed(4));
	printf("f(4,5,6) = {1}\n", f(4, 5, 6).toFixed(4));
	printf("f(7,8,9) = {1}\n", f(7, 8, 9).toFixed(4));

	var text = "[ 0, 1; 2, 3 ] * [ 4i, 5i, 6i; 7+7i, 8-8i, -9+9i ]";
	var code = NumJS.Parse(text);
	printf("Text: {1}\n", text);
	// printf("Code: {1}\n", code);

	var f = eval(code);
	printf("f() = {1}\n", f());

	checklog(0xe536);
}

