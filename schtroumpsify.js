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
		// allowed = {
		// 	V: 0.2,
		// 	VPP: 0.3,
		// 	VPR: 0.4,
		// 	ADV: 0.6,
		// 	NC: 0.9,
		// 	ADJ: 1,
		// },
		allowed = ['V', 'VPP', 'VPR', 'VINF', 'ADV', 'NC', 'ADJ'],
		tokenCount = tokens.length;

	tokens = classTokens(tokens);

	var testedTokenCount = 0;
	while(replacements.length < maxReplacements && testedTokenCount < tokenCount) {
		var type = getType(allowed);

		console.log(type);

		if(typeof tokens[type] !== 'undefined') {
			var index = Math.floor(Math.random() * (tokens[type].length)),
				token = tokens[type][index],
				wasReplaced = false;
				
			testedTokenCount++;

			if(token.subtype === 'ADV') { // Adverbe
				wasReplaced = handleAdverbe(token, replacements);
			}
			else if(token.subtype === 'V' || token.subtype === 'VPP' || token.subtype === 'VPR' || token.subtype === 'VINF') { // Verbe
				wasReplaced = handleVerb(token, replacements, token.previousToken, token.nextToken);
			}
			else if(token.subtype === 'ADJ') { //Adjectif
				wasReplaced = handleAdjective(token, replacements);
			}
			else if(token.subtype === 'NC' || token.subtype === 'NPP') { // Nom commun

				wasReplaced = handleNoun(token, replacements, token.previousToken, token.antepToken);
			}
			
			tokens[type].splice(index, 1);
		}
	}

	if(replacements.length === 0) {
		console.log('No replacements');
		throw new Error("No replacements");
	}

	console.log(replacements);

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

	function getType(types)
	{
		if(types.length === 0) {
			console.log('Tested all types');
			throw new Error("Tested all types...");
		}

		var i = Math.floor(Math.random() * (types.length));
		var t = types[i];
		types.splice(i, 1);

		return t;
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

			console.log(verb);
		// If next verb is VPP use it instead of current one.
		if(nextToken && (nextToken.subtype === 'VPP' || nextToken.subtype === 'VINF')) {
			return false;
		}

		if(previousToken.text.toLowerCase() === "c'") {
			return false;
		}

		
		var newWord = null;
		if(verb.subtype === 'VINF') {
			newWord = self.language.inf;
		}

		if(!newWord && verb.subtype === 'VPP') {
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

			newWord =  self.language['vpp_' + n + '_' + g];
		}

		if(!newWord && verb.subtype === 'VPR') {
			newWord = self.language.pp;
		}

		if(!newWord) {

			var p = parseInt(verb.data.p);
			if(verb.data.n === 'p') {
				p += 3;
			}

			if(verb.data.t === 'imp' || verb.data.t === 'cond') {
				var selector = verb.data.m;
				if(!selector) {
					selector = verb.data.t;
				}

				newWord = self.language[selector][p];
			}
			else {
				newWord = self.language[verb.data.m][verb.data.t][p];
			}
		}

		// If previous token is j' change it to je
		if(previousToken && previousToken.text.toLowerCase() === "j'") {
			addReplacement(replacements, previousToken.text + verb.text, preTreatment(previousToken.text,  + 'je ') + preTreatment(verb.text, newWord));
		}
		else if(previousToken && previousToken.text.toLowerCase() === "s'") {
			addReplacement(replacements, previousToken.text + verb.text, preTreatment(previousToken.text, 'se ') + preTreatment(verb.text, newWord));
		}
		else if(previousToken && previousToken.text.toLowerCase() === "n'") {
			addReplacement(replacements, previousToken.text + verb.text, preTreatment(previousToken.text, 'ne ') + preTreatment(verb.text, newWord));
		}
		else {
			addReplacement(replacements, verb.text, preTreatment(verb.text, newWord));
		}

		return true;
	}

	function handleNoun(noun, replacements, previousToken, antepToken) {

		if(!isNaN(noun.text)) {
			return false;
		}

		if(noun.text[0] === '#') {
			return false;
		}

		// De l' => Du
		if(previousToken && antepToken && previousToken.text.toLowerCase() === "l\'" && antepToken.text.toLowerCase() === 'de') {
			var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
			addReplacement(replacements, antepToken.text + ' ' + previousToken.text + noun.text, preTreatment(antepToken.text, 'du ') + preTreatment(noun.text, newWord));
			return true;
		}
		// à le/la => au
		else if(previousToken && antepToken && (previousToken.text.toLowerCase() === "l\'") && antepToken.text.toLowerCase() === 'à') {
			var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
			addReplacement(replacements, antepToken.text + ' ' + previousToken.text + noun.text, preTreatment(antepToken.text, 'au ') + preTreatment(noun.text, newWord));
			return true;
		}
		// à les => aux
		else if(previousToken && antepToken && previousToken.text.toLowerCase() === "les" && antepToken.text.toLowerCase() === 'à') {
			var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
			addReplacement(replacements, antepToken.text + ' ' + previousToken.text + ' ' + noun.text, preTreatment(antepToken.text, 'aux ') + preTreatment(noun.text, newWord));
			return true;
		}
		// l' => le / la
		else if(previousToken && previousToken.text.toLowerCase() === "l\'") {
			var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
			addReplacement(replacements, previousToken.text + noun.text, preTreatment(previousToken.text, previousToken.base) + ' ' + preTreatment(noun.text, newWord));
			return true;
		}
		// d' => de
		else if(previousToken && previousToken.text.toLowerCase() === "d\'")
		{
			var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
			addReplacement(replacements, previousToken.text  + noun.text, preTreatment(previousToken.text, previousToken.base) + ' ' + preTreatment(noun.text, newWord));
			return true;
		}

		var newWord = noun.data.n === 'p' ? self.language.np : self.language.ns;
		addReplacement(replacements, noun.text, preTreatment(noun.text, newWord));
		return true;
	}

	function handleAdjective(adjective, replacements, previousToken) {
		
		if(!isNaN(adjective.text)) {
			return false;
		}

		var newWord = null;
		if(adjective.text[adjective.text.length - 1] === 's' 
			&& adjective.text[adjective.text.length - 2] === 'e' 
			&& adjective.text[adjective.text.length - 3] === 'é') {
			newWord = self.language.a_ées;
		}
		else if(adjective.text[adjective.text.length - 1] === 's' 
			&& adjective.text[adjective.text.length - 2] === 'é')
		{
			newWord = self.language.a_és;
		}
		else if(adjective.text[adjective.text.length - 1] === 'e' 
			&& adjective.text[adjective.text.length - 2] === 'é')
		{
			newWord = self.language.a_ée;
		}
		else if(adjective.text[adjective.text.length - 1] === 'é')
		{
			newWord = self.language.a_é;
		}
		else {
			newWord = adjective.data.n === 'p' ? self.language.ap : self.language.as;
		}

		if(previousToken && previousToken.text.toLowerCase() === "l\'") {
			addReplacement(replacements, previousToken.text + noun.text, preTreatment(previousToken.text, previousToken.base) + ' ' + preTreatment(noun.text, newWord));
			return true;
		}
		// d' => de
		else if(previousToken && previousToken.text.toLowerCase() === "d\'")
		{
			addReplacement(replacements, previousToken.text  + noun.text, preTreatment(previousToken.text, previousToken.base) + ' ' + preTreatment(noun.text, newWord));
			return true;
		}

		addReplacement(replacements, adjective.text, preTreatment(adjective.text, newWord));
		return true;
	}

	function handleAdverbe(adverbe, replacements) {
		if(adverbe.text.indexOf('ement') > -1) {	
			addReplacement(replacements, adverbe.text, preTreatment(adverbe.text , self.language.adv));
			return true;
		}
	}

	function addReplacement(replacements, oldWord, newWord) {
		if(oldWord[0] === oldWord[0].toUpperCase()) {
			newWord = newWord.charAt(0).toUpperCase() + newWord.substring(1);
		}

		replacements.push({
			oldWord: oldWord,
			newWord: newWord
		});

		if(oldWord.indexOf("'") > -1) {
			oldWord = oldWord.replace("'", "’");

			replacements.push({
				oldWord: oldWord,
				newWord: newWord
			});
		}

		if(oldWord.indexOf("’") > -1) {
			oldWord = oldWord.replace("’", "'");

			replacements.push({
				oldWord: oldWord,
				newWord: newWord
			});
		}

	}

	function preTreatment(oldWord, newWord) {
		if(oldWord[0] === oldWord[0].toUpperCase()) {
			return newWord.charAt(0).toUpperCase() + newWord.substring(1)
		}

		return newWord;
	}
};

module.exports = Schtroumpsifier