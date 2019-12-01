var inquirer   = require('inquirer');
var anneal     = require('./anneal.js');
var transcribe = require('./transcribe.js');

inquirer.prompt([
{
	name: 'phrase',
	message: 'Phrase to draw:',
	filter: answer => transcribe.normalize(answer)
}, {
	type: 'number',
	name: 'temp',
	message: 'Starting temp:',
	default: answers => answers.phrase.split(' ').length/2+1
}, {
	type: 'list',
	name: 'ratio',
	message: 'Aspect ratio:',
	choices: [
	{ name: 'Vertical', value: 0.5 },
	{ name: 'Square', value: 1 },
	{ name: 'Horizontal', value: 2 }
	],
	default: 1,
	filter: a => a.toLowerCase()
}
// empty space weighting: even, centered
// ink cost: none, normal, avoid runs
]).then(answers => {
	// console.log(transcribe.normalize(phrase));
	console.log(transcribe.transcribe(answers.phrase));

	var result = anneal(answers.phrase, answers);
	console.log(result.prettyStats());
	result.print('linearWide');

	result.words.forEach(word => console.log(word.text, JSON.stringify(word.runs)));
}).catch(err => { throw err });







/*
var temp;
if (parseInt(process.argv[2])) {
	temp = parseInt(process.argv.splice(2, 1));
}

var phrase = process.argv.slice(2).join(' ');

if (!phrase) return console.error('Please enter a phrase');

console.log(transcribe.normalize(phrase));
console.log(transcribe.transcribe(phrase));

var result = anneal(phrase, temp);
console.log(result.prettyStats());
result.print('linearLight');

result.words.forEach(word => console.log(word.text, JSON.stringify(word.runs)));
*/
