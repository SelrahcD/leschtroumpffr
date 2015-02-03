var Twit = require('twit'),
	Shtroumpsify = require('./schtroumpsify'),
	config = require('./config');

var twitterClient = new Twit(config.twitter);
var schtroumpsifier = new Shtroumpsify();

twitterClient.stream('statuses/filter', {follow: [24744541]}).on('tweet', function(tweet) {
	if(tweet.user.id === 24744541 && typeof tweet.retweeted_status === 'undefined') {
		console.log(tweet.text);

		try {
			schtroumpsifier.transform(tweet.text).then(function(text) {
	    	
		    	// tweet
		    	console.log(text);
		    	if(text.indexOf('schtrou') > -1) {
		    		console.log('Twitted');
		    		twitterClient.post('statuses/update', { status: text }, function(err, data, response) {
						});
		    	}
		    	else {
		    		console.log('No schtrou');
		    	}
		    },
		    function(a) {
		    	console.log(a);
		    	console.log('Fail on ' + tweet.text);
		    });
		}
		catch(e) {
			console.log(e.message);
		}
	    
	}
});
