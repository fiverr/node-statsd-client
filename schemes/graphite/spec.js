const scheme = require('.');

describe('graphite scheme', () => {
    it('Should format basic metrics', () => {
        expect(scheme({
            key: 'k',
            value: 'b',
            type: 't'
        })).to.equal('k:b|t');
    });
    it('Should append formatted carbon tags before value', () => {
        expect(scheme({
            key: 'k',
            value: 'b',
            type: 't',
            tags: {
                a: 'A',
                b: 'B'
            }
        })).to.equal('k;a=A;b=B:b|t');
    });
    it('Should append rate after the value', () => {
        expect(scheme({
            key: 'k',
            value: 'b',
            type: 't',
            rate: 0.1
        })).to.equal('k:b|t@0.1');
    });
});
