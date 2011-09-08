
function test_Parser_001()
{
	var args = "a, b, c";
	var text = "a + b * (c / a) + b";
	var code = NumJS.Parse(args, text);
	printf("Args: {1}\n", args);
	printf("Text: {1}\n", text);
	printf("Code: {1}\n", code);
}
