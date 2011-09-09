
function test_Parser_001()
{
	var text = "a + b * -(c / pow(-2i, a)) + b";
	var code = NumJS.Parse(text, "a, b, c", { pow: "NumJS.POW" });
	printf("Text: {1}\n", text);
	printf("Code: {1}\n", code);

	var f = eval(code);
	printf("f(1,2,3) = {1}\n", f(1, 2, 3).toFixed(4));
	printf("f(4,5,6) = {1}\n", f(4, 5, 6).toFixed(4));
	printf("f(7,8,9) = {1}\n", f(7, 8, 9).toFixed(4));

	checklog(0x90dc);
}

