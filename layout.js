var transcribe = require('./transcribe.js');
var Renderer = require('./render.js');

function Layout(src) {

	if (typeof src === 'string') {
		this.phrase = transcribe.normalize(src);
		this.words = transcribe.words(src);
		this.words.forEach(word => {
			word.x = 4;
			word.y = 0;
		});
		this.words[0].x = 0;
		this.estimatedSize = {};

	} else {
		this.phrase = src.phrase;
		this.words = src.words.map(word => {
			return {
				text: word.text,
				x: word.x,
				y: word.y,
				stem: word.stem,
				form: word.form.map(l => l.slice()),
				runs: word.runs.map(l => l.slice())
			}
		});
		this.estimatedSize = {
			height: src.stats.height,
			width: src.stats.width
		}

	}

	this.renders = {};
	this.render = function(style) {
		if (!this.renders[style]) {
			var renderer = new Renderer(this, style);
			this.renders[style] = renderer.render();
			if (style === 'calc') this.stats = renderer.stats;
		}
		return this.renders[style];
	}

	this.print = function(style) {
		this.render(style).forEach(row => {
			console.log(row.join(''));
		})
	}

	this.prettyStats = function() {
		var stats = this.stats;
		return `${stats.width}x${stats.height} - ${stats.empty}/${stats.ink} - ${stats.conflicts}! ${stats.outOfBounds}#`;
	}

	this.tweak = function() {
		this.renders = {}

		if (oneIn(5) && this.words.length > 1) {
			var word = randFrom(this.words, true);
			if (oneIn(2)) {
				if (word.y >= 0) {
					jiggle(word, 'x', 0);
				} else {
					jiggle(word, 'x', 1);
				}
				// return word.text + '.x';
			} else {
				if (word.x === 0) {
					jiggle(word, 'y', 0);
				} else {
					jiggle(word, 'y');
				}
				// return word.text + '.y';
			}

		} else {
			var word = randFrom(this.words);
			var letter = randFrom(word.runs);
			var index = Math.floor(Math.random()*letter.length);

			if (index > 0 || word.runs.indexOf(letter) !== 0) {
				jiggle(letter, index, 1);
			} else {
				jiggle(letter, index, 0);
			}
			// return word.text + '.' + word.runs.indexOf(letter) + '.' + index;

		}
	}

}


function oneIn(num) {
	return Math.random() <= 1/num;
}

function jiggle(obj, prop, min = -16) {
	if (oneIn(10)) {
		obj[prop] = min===-16? 0:min;
		return;
	}

	if (oneIn(2)) {
		obj[prop] += 1;
		return;
	}

	obj[prop] = Math.max(min, obj[prop]-1);
}

function randFrom(arr, skipFirst) {
	if (skipFirst) {
		return arr[Math.floor(Math.random()*arr.length-1)+1];
	}
	return arr[Math.floor(Math.random()*arr.length)];
}

module.exports = Layout;
