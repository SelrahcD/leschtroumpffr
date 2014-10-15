var Shtroumpsify = require('./schtroumpsify');

var schtroumpsifier = new Shtroumpsify();

var text = "j'aime les chats"; 
schtroumpsifier.transform(text).then(function(text) {
	console.log(text);
});
