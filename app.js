var Twit = require('twit'),
	Shtroumpsify = require('./schtroumpsify'),
	config = require('./config');

var twitterClient = new Twit(config.twitter);
var schtroumpsifier = new Shtroumpsify();


var urlRegex = /(https?:\/\/[^\s]+)/g;
twitterClient.stream('statuses/filter', {follow: [24744541]}).on('tweet', function(tweet) {
	if(tweet.user.id === 24744541 && typeof tweet.retweeted_status === 'undefined') {
		console.log(tweet.text);

		var urls = tweet.text.match(urlRegex);
		var i = 0;
		urls.forEach(function(url) {
			tweet.text = tweet.text.replace(url, function() {
				return '#' + i++;
			});
		});


	    schtroumpsifier.transform(tweet.text).then(function(text) {
	    	
	    	// tweet
	    	console.log(text);
			var i = 0;
		 	urls.forEach(function(url) {
				text = text.replace('#'+i++, url);
			});
	    	twitterClient.post('statuses/update', { status: text }, function(err, data, response) {
				  // console.log(data)
			});
	    },
	    function() {
	    	console.log('Fail on ' + tweet.text);
	    });
	}
});
