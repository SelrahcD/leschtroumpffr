var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();


var text = "Des dirigeants d'Aube dorée devant la justice grecque ";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
