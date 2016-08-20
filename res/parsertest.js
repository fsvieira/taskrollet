var parser = require("./task");

var result = parser.parse(
	"my test #tag as\nasdas #t1 #t2"
);

console.log(JSON.stringify(result));
