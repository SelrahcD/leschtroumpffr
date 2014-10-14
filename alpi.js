var Promise = require("node-promise").Promise,
	spawn = require('child_process').spawn,
	FormData = require('form-data'),
	http = require('http'),
	request = require('request'),
	cheerio = require('cheerio'),
	iconv = require('iconv-lite'),
	charsetDetector = require("node-icu-charset-detector");

function LocalParseur() {

}

LocalParseur.prototype.parse = function(text) {
	var promise = new Promise(),
		callParser = spawn('echo ' + text );

	callParser.stdout.on('data', function (data, err) {
  		Promise.resolve(data);
	});

	return promise;
};

function RemoteParseur() {
	this.domain = 'alpage.inria.fr';
	this.path = '/alpes/parser.pl';
}

RemoteParseur.prototype.parse = function(text) {
	var promise = new Promise(),
		form = new FormData();

	console.log('#############################');
	console.log(text);
	console.log('#############################');
		
	var r = request({
		method: 'post',
	 	uri: 'http://alpage.inria.fr/alpes/parser.pl',
	 	headers: form.getHeaders(),
	 	encoding: null
	},
	function(error, response, body) {
		var utf8String = iconv.decode(new Buffer(body), "ISO-8859-1");
    	var $ = cheerio.load(utf8String)
			analyse = $('pre').text();

			if(analyse === '') {
				throw new Error("Wrong text", analyse);
			}

			var lines = analyse.match(/[^\n]+/g);
			var firstLine = lines.shift();
			var elements = firstLine.match(/[^\t]+/g);
			var data = [];
			elements.forEach(function(d) {
				var splitted = d.split('=');
				data[splitted[0]] = splitted[1];
			});

			if(data.best === 'no') {
				throw new Error("Data best : no");
			}

			var tokens = [];
			lines.forEach(function(line) {
				var token = {};

				var elements = line.match(/[^\t]+/g);

				token.text = elements[1];
				token.base = elements[2];
				token.type = elements[3];
				token.subtype = elements[4];

				if(elements[5]) {
					var allData = elements[5].split('|');
				var data = {};
					allData.forEach(function(d) {
						var splitted = d.split('=');
						data[splitted[0]] = splitted[1];
					});
				}

				token.data = data;

				tokens.push(token);
			});

			promise.resolve(tokens);
	});

	var urlRegex = /(https?:\/\/[^\s]+)/g;
	text = text.replace(urlRegex, '');

	var crochayRegex = /\[.+\]/g;
	text = text.replace(crochayRegex, '');

	form = r.form();
	form.append('grammar', 'frmgtel');
	form.append('forest', 'conll'); 
	form.append('sentence', text);

	return promise;
};

exports.LocalParseur = LocalParseur;
exports.RemoteParseur = RemoteParseur;