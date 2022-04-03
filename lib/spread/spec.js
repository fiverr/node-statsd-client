const spread = require('.');

describe('spread', () => {
    it('Should extract args structure into an array', () => {
        expect(
            spread(['type', 'key', 'value', { rate: 'rate', tags: 'tags', enforceRate: true }])
        ).to.deep.equal(
            ['type', 'key', 'value', 'rate', 'tags', true]
        );
    });
    it('Should retrieve options', () => {
        expect(
            spread(['type', 'key', 'value'])
        ).to.deep.equal(
            ['type', 'key', 'value', undefined, undefined, undefined]
        );
    });
    it('Should treat last arg as options', () => {
        expect(
            spread(['type', 'key', { rate: 'rate', tags: 'tags', enforceRate: false }])
        ).to.deep.equal(
            ['type', 'key', undefined, 'rate', 'tags', false]
        );
    });
    it('Should fill in everything else as undefined', () => {
        expect(
            spread(['type', 'key'])
        ).to.deep.equal(
            ['type', 'key', undefined, undefined, undefined, undefined]
        );
    });
});
