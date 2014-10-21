var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();


var text = "La prison « inhumaine » de Ducos, en Martinique http://t.co/nd0QJVDPQv (par @FrJohannes) http://t.co/LnwWAEtx5C";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
