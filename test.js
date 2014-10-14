var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();

var text = 'Le tigre de Poutine s’est fait la belle en Chine'; 
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
