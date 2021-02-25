const scheme = require('.');

describe('graphite scheme', () => {
    it('Should format basic metrics', () => {
        expect(scheme({
            key: 'k',
            value: 'b',
            type: 'ms'
        })).to.equal('k:b|ms');
    });
    it('Should append formatted carbon tags before value', () => {
        expect(scheme({
            key: 'k',
            value: 'b',
            type: 'ms',
            tags: {
                a: 'A',
                b: 'B'
            }
        })).to.equal('k;a=A;b=B:b|ms');
    });
    it('Should append rate after the value', () => {
        expect(scheme({
            key: 'k',
            value: 'b',
            type: 'ms',
            rate: 0.1
        })).to.equal('k:b|ms|@0.1');
    });
});
