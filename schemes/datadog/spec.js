const scheme = require('.');

describe('datadog scheme', () => {
	it('Should format basic metrics', () => {
		expect(scheme({
			key: 'k',
			value: 'b',
			type: 't',
		})).to.equal('k:b|t');
	});
	it('Should append formatted carbon tags after value', () => {
		expect(scheme({
			key: 'k',
			value: 'b',
			type: 't',
			tags: {
				a: 'A',
				b: 'B',
			},
		})).to.equal('k:b|t#a:A,b:B');
	});
	it('Should append rate after the value', () => {
		expect(scheme({
			key: 'k',
			value: 'b',
			type: 't',
			rate: .1,
		})).to.equal('k:b|t@0.1');
	});
	it('Should append formatted carbon tags after rate', () => {
		expect(scheme({
			key: 'k',
			value: 'b',
			type: 't',
			rate: .1,
			tags: {
				a: 'A',
				b: 'B',
			},
		})).to.equal('k:b|t@0.1#a:A,b:B');
	});
});
