var simulatedAnnealing = require('simulated-annealing');
var differ = require('ansi-diff-stream');
var Layout = require('./layout.js');

var diff = differ();
diff.pipe(process.stdout);

var tempStart;

function anneal(phrase, options) {

	var initial = new Layout(phrase);

	var result = simulatedAnnealing({
		initialState: initial,
		tempMax: options.temp || initial.words.length/2+1,
		tempMin: 0.001,
		newState: neighbor,
		getEnergy: energy,
		getTemp: cool
	});

	diff.clear();

	return result;

}

function energy(layout) { //TODO: add temp
	layout.render('calc');

	var energy = 0;
	var stats = layout.stats;
	energy += stats.outOfBounds * 50;
	energy += stats.conflicts * 10;
	energy += stats.empty * 1;
	// energy += stats.height + stats.width * 10;
	energy += Math.abs(stats.height - stats.width/2) * 1;

	if (!stats.ink) {
		stats.ink = 0;
		layout.words.forEach(word => {
			stats.ink += word.stem * 3;
			word.runs.forEach(letter => {
				letter.forEach((run, i) => {
					stats.ink += run * i;
				});
			});
		});
	}
	energy += stats.ink * 0.1;

	return energy;
}

function neighbor(layout) {
	var next = new Layout(layout);
	next.tweak();
	return next;
}

var mark = 1000;
function cool(temp, snap, best) {
	if (temp < mark) {
		diff.write(
			best.render('linearLight').map(row => row.join('')).join('\n') + '\n' +
			round(energy(best)) + ' - ' + best.prettyStats() + '\n\n' +
			`${mark} - ${round(energy(snap))}\n` +
			`${snap.prettyStats()}\n` +
			snap.render('calc').slice(0, 16).map(row => row.join('')).join('\n') + 
			'');
		mark = round(temp-0.01);
	}
	return temp - 0.00001;
}

function round(num) {
	return Math.round(num*100)/100;
}

module.exports = anneal;
