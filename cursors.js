function Cursor(x=0, y=0, style) {
	this.style = style;
	this.step = style.step || 1;

	this.go = function(x, y) {
		this.x = x*this.step;
		this.y = y*this.step;
	}
	this.move = function(x, y) {
		this.x += x*this.step;
		this.y += y*this.step;
	}
	this.nudge = function(x, y) {
		this.x += x;
		this.y += y;
	}
	this.go(x, y);

	this.direction = 0;
	this.point = function(dir = 0) {
		this.direction = dir;
	}
	this.turn = function(clockwise) {
		if (clockwise) {
			this.direction = (this.direction + 1) % 4;
		} else {
			this.direction = (this.direction + 3) % 4;
		}
	}
	this.coords = [
	[0, 1],
	[-1, 0],
	[0, -1],
	[1, 0]
	];

	this.look = function(x = 0, y = 0) {
		try {
			return this.canvas[this.y+y][this.x+x];
		} catch (err) {
			return false;
		}
	}
	this.spaceHere = function() {
		var looked = this.look();
		return looked === this.style.empty || looked === this.style.trim;
	}
	this.spaceAhead = function() {
		var coord = this.coords[this.direction];
		var looked = this.look(coord[0], coord[1]);
		return looked === this.style.empty || looked === this.style.trim;
	}

	this.pen = '#';
	this.draw = function(len) {
		// this.stamp();
		var coord = this.coords[this.direction];
		for (var i=0; i<len*this.step; i++) {
			this.nudge(coord[0], coord[1]);
			this.stamp();
		}
	}
	this.stamp = function() {
		try {
			if (this.conflict && this.canvas[this.y][this.x] !== this.style.empty) {
				this.conflict();
				this.canvas[this.y][this.x] = this.style.conflict;
			} else {
				this.canvas[this.y][this.x] = this.pen;
			}
		} catch (err) {
			if (this.outOfBounds) this.outOfBounds();
		}
	}

	this.locs = {};
	this.save = function(name) {
		this.locs[name] = {
			x: this.x,
			y: this.y
		}
	}
	this.load = function(name) {
		if (!this.locs[name]) return;
		this.x = this.locs[name].x;
		this.y = this.locs[name].y;
	}
}


function CursorLinear(x=0, y=0, style) {
	this.style = style;
	this.step = style.step || 1;

	this.go = function(x, y) {
		this.x = x*this.step;
		this.y = y*this.step;
	}
	this.move = function(x, y) {
		this.x += x*this.step;
		this.y += y*this.step;
	}
	this.nudge = function(x, y) {
		this.x += x;
		this.y += y;
	}
	this.go(x, y);

	this.direction = 0;
	this.point = function(dir = 0) {
		this.direction = dir;
	}
	this.turn = function(clockwise) {
		if (clockwise) {
			this.direction = (this.direction + 1) % 4;
		} else {
			this.direction = (this.direction + 3) % 4;
		}
	}
	this.coords = [
	[0, 1],
	[-1, 0],
	[0, -1],
	[1, 0]
	];

	this.draw = function(len) {
		for (var i=0; i<len*this.step; i++) {
			this.stamp();
			var coord = this.coords[this.direction];
			this.nudge(coord[0], coord[1]);
			this.stamp(true);
		}
	}
	this.stamp = function(rev) {
		try {
			var lookup = this.style.lines[rev? (this.direction+2)%4 : this.direction];
			this.canvas[this.y][this.x] = lookup[this.canvas[this.y][this.x]] || lookup[this.style.empty];
		} catch (err) {
			console.log('drawing error');
		}
	}

	this.locs = {};
	this.save = function(name) {
		this.locs[name] = {
			x: this.x,
			y: this.y
		}
	}
	this.load = function(name) {
		if (!this.locs[name]) return;
		this.x = this.locs[name].x;
		this.y = this.locs[name].y;
	}
}



module.exports = {
	Cursor: Cursor,
	Linear: CursorLinear
}