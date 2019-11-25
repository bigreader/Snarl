var cursors = require('./cursors.js');
var styles  = require('./styles.js');

function Renderer(layout, style) {
	this.layout = layout;
	this.style = styles[style] || styles.calc;
	this.stats = {
		conflicts: 0,
		empty: 0,
		outOfBounds: 0
	}

	this.render = function() {
		// var width = layout.words.length * 6 * this.style.step + 16;
		var width = this.layout.estimatedSize.width + 12 || 512;
		var height = this.layout.estimatedSize.height + 12 || 32;

		var row = Array(width).fill(this.style.empty);
		this.canvas = Array(height).fill(row).map(row => row.slice());

		scribe(this.layout, this.canvas, this.style, this.stats);
		crop(this.canvas, this.style);

		this.stats.height = this.canvas.length;
		this.stats.width = this.canvas[0].length;
		this.canvas.forEach(row => {
			row.forEach(cell => {
				if (cell === this.style.empty) this.stats.empty++;
			})
		});

		return this.canvas;
	}
}



function scribe(layout, canvas, style, stats, stemsOnly) {
	var cursor;
	if (style.linear) {
		cursor = new cursors.Linear(8, 8, style);
	} else {
		cursor = new cursors.Cursor(8, 8, style);
	}
	cursor.canvas = canvas;
	cursor.pen = style.pen;
	cursor.conflict = () => stats.conflicts++;
	cursor.outOfBounds = () => stats.outOfBounds++;

	layout.words.forEach(word => {
		cursor.move(word.x, word.y);
		cursor.stamp();
		cursor.save('word');
		/*cursor.outOfBounds = function() {
			if (Math.random() < 0.0001) {
				console.log(cursor.x, cursor.y);
				console.log(word.x, word.y, word.runs);
			}
		}*/

		word.runs.forEach((letterRuns, i) => {
			var letterRuns = letterRuns.slice();
			var letterForm = word.form[i];
			cursor.point(0);
			cursor.draw(letterRuns.shift());
			cursor.save('letter');

			if (stemsOnly) return;

			letterRuns.forEach((len, i) => {
				cursor.turn(letterForm[i]);
				cursor.draw(len);
			});

			cursor.load('letter');
		});
		cursor.point(0);
		cursor.draw(word.stem);

		cursor.load('word');
	});

	if (style.stems) {
		scribe(layout, canvas, styles[style.stems], stats, true);
	}

	return canvas;
}


function crop(canvas, style) {

	var empty = style.empty;

	while (isBlank(empty, canvas[0])) {
		canvas.splice(0, 1);
	}

	while (isBlank(empty, canvas[canvas.length-1])) {
		canvas.splice(-1, 1);
	}

	var col = canvas.map(row => row[0]);
	while (isBlank(empty, col)) {
		canvas.forEach(row => row.shift());
		col = canvas.map(row => row[0]);
	}

	col = canvas.map(row => row[row.length-1]);
	while (isBlank(empty, col)) {
		canvas.forEach(row => row.pop());
		col = canvas.map(row => row[row.length-1]);
	}

	return canvas;
}

function isBlank(empty, line) {
	// line has no cells that aren't empty
	return !(line.find(cell => cell!==empty));
}


/*
function trimCorners(canvas, style) {
	var cursor = new Cursor(0, 0, style);
	cursor.canvas = canvas;
	cursor.pen = style.trim;

	cursor.save('corner');
	cursor.point(0);
	if (cursor.spaceHere()) {

		while (cursor.spaceAhead()) {
			cursor.draw(1);
		}
	}
	cursor.load('corner');

	cursor.turn(false);
	while (cursor.spaceAhead()) {
		cursor.draw(1);
	}





	while (cursor.spaceHere()) {
		cursor.save('corner');
		while (cursor.spaceAhead()) {
			cursor.draw(1);
		}
		cursor.load('corner');
		cursor.turn(false);
		if (cursor.)
	}

}
*/

/*

,,,,#
, ###
,####
####

*/



function print(canvas) {
	canvas.forEach(row => {
		console.log(row.join(''));
	});
}


module.exports = Renderer;
