var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();

var text = 'Malgré son retour, Nicolas Sarkozy poursuit ses conférences rémunérées'; 
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
