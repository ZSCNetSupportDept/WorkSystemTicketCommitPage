const DATA_FROM = `${__dirname}/data_real`,
	SPLIT_REGEXP = /\s*={5,}\s*/;

let fs = require('fs');

let { analyze } = require('../src/scripts/ticket_info_analyzer');

let files = fs.readdirSync(DATA_FROM)
	.filter(name => name.endsWith('.txt'));

describe('Ticket info analyzer', () => {
	files.map(name => ({
		name,
		data: fs.readFileSync(`${DATA_FROM}/${name}`, 'utf8')
			.split(/[\n\r]+/)
			.map(line => line.trim())
			.filter(line => line && !line.startsWith('#'))
			.join('\n')
			.split(SPLIT_REGEXP)
			.filter(v => v.trim())
			.map((v, i, arr) => i % 2 ? null : ({ input: v, output: arr[(i - 0) + 1] }))
			.filter(v => v)
	})).map(obj => it(`# analyze ${obj.name}`, () => {
		obj.data.map(it => {
			let data = analyze(it.input);
			let output = [].join(' ');
			// it.output.replace(/\s+/g, ' ').should.be.startWith(output);
		})
	}));
	
});