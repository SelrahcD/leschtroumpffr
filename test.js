var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();


var text = "Droit à l'oubli : Google a reçu environ 50 000 demandes en France";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
