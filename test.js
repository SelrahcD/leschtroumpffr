var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();


var text = "Toujours sur la comète Tchouri, le robot Philae devrait se réveiller en mars";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
