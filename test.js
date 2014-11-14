var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();


var text = "Un sous-marin étranger a bien violé les eaux territoriales suédoises ";
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
