
function loadTable(key = 'english') {
	return require(`./data/table-${key}.json`);
}

function normalize(str, key) {
	var table = loadTable(key);
	var allowed = Object.keys(table);
	allowed.push(' ');

	var chars = str.toLowerCase().split('');
	var good = chars.filter(char => allowed.includes(char));
	var bad = chars.filter(char => !allowed.includes(char));

	// console.log('filtered chars: "' + bad.join('') + '"');
	return good.join('');
}

function transcribe(str, key) {
	var table = loadTable(key);

	return str.toLowerCase().split(' ').map(word => {
		return word.split('').map(char => table[char]).join('.');
	}).join(' ');


	return str.toLowerCase().split(' ').map(word => {
		return word.split('').map(char => {
			return table[char].split('').map(bit => bit=='1');
		});
	});
}

function words(str, key) {
	var table = loadTable(key);

	return str.toLowerCase().split(' ').map(word => {
		var form = word.split('').map(char => {
			return table[char].split('').map(bit => bit=='1');
		});

		var runs = form.map((char, i) => {
			var ones = char.slice().fill(1);
			ones.unshift(i===0? 0:1)
			return ones;
		});

		return {
			text: word,
			form: form,
			runs: runs,
			stem: 0
		}
	});
}

module.exports = {
	normalize: normalize,
	transcribe: transcribe,
	words: words
};
