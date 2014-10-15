var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();

var text = "L'actrice Marie Dubois est morte";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
