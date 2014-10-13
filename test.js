var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();

var text = 'Les radicaux de gauche ont-ils les moyens de leur ultimatum au gouvernement ?'; 
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
