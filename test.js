var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();


var text = "Les enseignes veulent acclimater la France au « Black Friday » américain http://t.co/EOWxF6hkxB";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
