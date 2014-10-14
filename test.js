var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();

var text = '[Journal de Damas 2/6] Une réconciliation en trompe-l’œil '; 
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
