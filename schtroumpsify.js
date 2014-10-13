var	Parseur = require("./alpi").RemoteParseur;

var Schtroumpsifier = function() {
	this.language = require('./language');
	this.parseur = new Parseur;
}

Schtroumpsifier.prototype.transform = function(text) {
	var self = this;
	return this.parseur.parse(text).then(function(tokens) {
		if(tokens === false) {
			return false;
		}

		var replacements = self.schtroumpfThis(tokens);

		replacements.forEach(function(replacement) {
			text = text.replace(replacement.oldWord, replacement.newWord); 
		});

		return text;
	});
};

Schtroumpsifier.prototype.schtroumpfThis = function(tokens) {
	var self = this,
		replacements = [],
		maxReplacements = 1,
		allowed = {
			V: 0.2,
			VPP: 0.3,
			VPR: 0.4,
			ADV: 0.6,
			NC: 0.9,
			ADJ: 1
		},
		tokenCount = tokens.length;

	tokens = classTokens(tokens);

	var testedTokenCount = 0;
	while(replacements.length < maxReplacements && testedTokenCount < tokenCount) {
		var type = getType(allowed);

		if(typeof tokens[type] !== 'undefined') {
			var index = Math.floor(Math.random() * (tokens[type].length)),
				token = tokens[type][index],
				wasReplaced = false;
				
			testedTokenCount++;


			if(token.subtype === 'ADV') { // Adverbe
				wasReplaced = handleAdverbe(token, replacements);
			}
			else if(token.subtype === 'V' || token.subtype === 'VPP' || token.subtype === 'VPR') { // Verbe
				wasReplaced = handleVerb(token, replacements, token.previousToken, token.nextToken);
			}
			else if(token.subtype === 'ADJ') { //Adjectif
				wasReplaced = handleAdjective(token, replacements);
			}
			else if(token.subtype === 'NC') { // Nom commun

				wasReplaced = handleNoun(token, replacements, token.previousToken, token.antepToken);
			}

			if(wasReplaced) {
				tokens[type].splice(index, 1);
			}

		}
	}

	if(replacements.length === 0) {
		throw new Error("No replacements");
	}

	return replacements;

	function classTokens(tokens)
	{
		var dico = {};
		for(var i = 0; i < tokens.length; i++) {
			if(tokens[i].base !== '_URL') {	
				if(typeof dico[tokens[i].subtype] === 'undefined') {
					dico[tokens[i].subtype] = [];
				}

				var previousToken,
					nextToken,
					antepToken;

				if(i > 0) {
					previousToken = tokens[i - 1];
				}
				else {
					previousToken = null;
				}

				if(i > 1) {
					antepToken = tokens[i - 2];
				}
				else {
					antepToken = null;
				}

				if(i < tokens.length - 1) {
					nextToken = tokens[i+1];
				}
				else {
					nextToken = null;
				}

				tokens[i].previousToken = previousToken;
				tokens[i].antepToken = antepToken;
				tokens[i].nextToken = nextToken;

				dico[tokens[i].subtype].push(tokens[i]);
			}
		}

		return dico;
	}

	function getType()
	{
		var types = ['V', 'VPP', 'VPR', 'ADV', 'NC', 'ADJ'];
		var i = Math.floor(Math.random() * (types.length));

		return types[i];
	}

	// function getType(distribution)
	// {
	// 	rand = Math.random();
	// 	for(var key in distribution) {
	// 		if(rand < distribution[key]) {
	// 			return key;
	// 		}
	// 	}
	// }

	function handleVerb(verb, replacements, previousToken, nextToken) {
		var mode,
			time,
			person;

		// If next verb is VPP use it instead of current one.
		if(nextToken && nextToken.subtype === 'VPP') {
			return false;
		}

		// If previous token is j' change it to je
		if(previousToken && previousToken.text.toLowerCase() === "j'") {
			replacements.push(createReplacement(previousToken.text, previousToken.text[0] + 'e '));
		}

		if(verb.subtype === 'VPP') {
			var g = 'm',
				n = 's';

			if(verb.text[verb.text.length - 1] === 's') {
				n = 'p';
				if(verb.text[verb.text.length - 2] === 'e') {
					g = 'f';
				}
			}
			else if(verb.text[verb.text.length - 1] === 'e') {
				g = 'f';
			}

			replacements.push(createReplacement(verb.text, self.language['vpp_' + n + '_' + g]));
			return true;
		}

		if(verb.subtype === 'VPR') {
			replacements.push(createReplacement(verb.text, self.language.pp));
			return true;
		}

		if(previousToken.text.toLowerCase() === "c'") {
			return false;
		}

		if(typeof self.language[verb.data.m] !== 'undefined' 
			&& typeof self.language[verb.data.m][verb.data.t] !== 'undefined' 
			&& typeof self.language[verb.data.m][verb.data.t][verb.data.p] !== 'undefined') {
			var p = verb.data.p;
			if(verb.data.n === 'p') {
				p += 3;
			}
			replacements.push(createReplacement(verb.text, self.language[verb.data.m][verb.data.t][p]));
			return true;
		}
	}

	function handleNoun(noun, replacements, previousToken, antepToken) {

		if(!isNaN(noun.text)) {
			return false;
		}

		// De l' => Du
		if(previousToken && antepToken && previousToken.text.toLowerCase() === "l\'" && antepToken.text.toLowerCase() === 'de') {
			replacements.push(createReplacement(antepToken.text, antepToken.text[0] + 'u'));
			replacements.push(createReplacement(previousToken.text, ''));
		}
		// l' => le / la
		else if(previousToken && previousToken.text.toLowerCase() === "l'") {
			replacements.push(createReplacement(previousToken.text, previousToken.base + ' ')); // Not bullet proof for genre detection...
		}
		// d' => de
		else if(previousToken && previousToken.text.toLowerCase() === "d'")
		{
			replacements.push(createReplacement(previousToken.text, previousToken.base + ' '));
		}

		var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
		replacements.push(createReplacement(noun.text, newWord));
		return true;
	}

	function handleAdjective(adjective, replacements) {
		var newWord = adjective.data.n === 'p' ? self.language.ap : self.language.as;
		replacements.push(createReplacement(adjective.text, newWord));
		return true;
	}

	function handleAdverbe(adverbe, replacements) {
		replacements.push(createReplacement(adverbe.text, self.language.adv));
		return true;
	}

	function createReplacement(oldWord, newWord) {
		return {
			oldWord: oldWord,
			newWord: newWord
		}
	}
};

module.exports = Schtroumpsifier