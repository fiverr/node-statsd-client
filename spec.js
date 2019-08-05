const dependencies = [
    'formatter',
    'sender',
    'push',
    'flush'
];
const stubs = {};
const originals = {};
const parameters = {};
const results = {};
const contexts = {};
const called = {};

function piggyback(dependency, fn) {
    stubs[dependency] = function(...args) {
        const result = originals[dependency].apply(this, args);
        results[dependency] = fn(...args);
        contexts[dependency] = this;
        parameters[dependency] = args;
        called[dependency] = true;
        return result;
    };
}

describe('SDC', () => {
    let SDC;
    const {random} = Math;
    before(() => {
        require('sample-size');
        delete require.cache[require.resolve('.')];
        require.cache[require.resolve('sample-size')].exports = (...args) => stubs.sample(...args);
        dependencies.forEach((dependency) => {
            const route = `./lib/${dependency}`;
            originals[dependency] = require(route);
            piggyback(dependency, () => null);
            require.cache[require.resolve(route)].exports = function(...args) {
                return stubs[dependency].apply(this, args);
            };
        });

        SDC = require('.');
    });
    beforeEach(() => {
        dependencies.forEach((dependency) => {
            piggyback(dependency, () => null);
            stubs.sample = () => null;
            delete results[dependency];
            delete contexts[dependency];
            delete parameters[dependency];
            delete called[dependency];
        });
    });
    afterEach(() => {
        Math.random = random;
    });
    after(() => {
        dependencies.forEach((dependency) => {
            delete require.cache[require.resolve(`./lib/${dependency}`)];
        });
        delete require.cache[require.resolve('sample-size')];
        delete require.cache[require.resolve('.')];
    });

    it('Should have a static getter containing all send types', () => {
        expect(SDC.TYPES).to.deep.equal({
            count: 'count',
            time: 'time',
            gauge: 'gauge',
            set: 'set',
            histogram: 'histogram'
        });
    });
    it('Should not accept changes to the static types object (freeze)', () => {
        const {TYPES} = SDC;
        TYPES.counter = 'count';
        expect(TYPES.counter).to.be.undefined;
    });
    it('Should have properties passed by constructor options', () => {
        const options = {
            MTU: 1234,
            timeout: 1050,
            timer: null
        };
        const client = new SDC(options);
        expect(client).to.include({
            MTU: 1234,
            timeout: 1050,
            timer: null
        });
    });
    [
        'count',
        'time',
        'gauge',
        'set',
        'histogram',
        'generic'
    ].forEach(
        (method) => it(
            `Should expose method "${method}"`,
            () => expect(new SDC()[method]).to.be.a('function')
        )
    );
    it('Should have some (non prototype) functionality', () => {
        const client = new SDC();
        expect(client.bulk).to.deep.equal([]);
        expect(client.timer).to.equal(null);
        expect(client.send).to.be.a('function');
        expect(client.format).to.be.a('function');
        expect(client.flush).to.be.a('function');
    });
    it('Should have specific metrics functions to call on generic function', () => {
        const client = new SDC();
        const excepted = [];
        const sent = ['A', 2, {key: 'balue'}];
        client.generic = (...args) => excepted.push(...args);
        [
            'count',
            'time',
            'gauge',
            'set',
            'histogram'
        ].forEach((type) => {
            excepted.length = 0;
            client[type](...sent);
            expect(excepted).to.deep.equal([type, ...sent]);
        });
    });
    it('Should assign default tags to metrics', () => {
        const client = new SDC({tags: {environment: 'production'}});
        let _tags;
        client.format = (type, key, value, {tags} = {}) => {
            _tags = tags;
        };
        client.generic('count', 'a');
        expect(_tags).to.include({environment: 'production'});
    });
    it('Should accept options as last argument', () => {
        const client = new SDC();
        let _tags;
        client.format = (type, key, value, {tags} = {}) => {
            _tags = tags;
        };
        client.generic('count', 'a', {tags: {environment: 'development'}});
        expect(_tags).to.include({environment: 'development'});
    });
    it('Should override default tags', () => {
        const client = new SDC({tags: {environment: 'production'}});
        let _tags;
        client.format = (type, key, value, {tags} = {}) => {
            _tags = tags;
        };
        client.generic('count', 'a', 1, {tags: {environment: 'development'}});
        expect(_tags).to.include({environment: 'development'});
    });
    it('Should push when sample is true', () => {
        const client = new SDC();
        stubs.sample = () => true;
        client.generic('count', 'a', 1, {rate: 0.4});
        expect(called.push).to.be.true;
    });
    it('Should push when sample is false, but enforceRate is true', () => {
        const client = new SDC({enforceRate: true});
        stubs.sample = () => true;
        client.generic('count', 'a', 1, {rate: 0.4});
        expect(called.push).to.be.true;
    });
    it('Should skip when sample is false', () => {
        const client = new SDC();
        stubs.sample = () => false;
        client.generic('count', 'a', 1, {rate: 0.4});
        expect(called.push).to.be.undefined;
    });
    it('Should call push in context', () => {
        const client = new SDC();
        client.generic('count', 'a');
        expect(contexts.push).to.equal(client);
    });
    it('Should expose it\'s bulk size', () => {
        const client = new SDC();
        const before = client.size;
        client.generic('count', 'a');
        expect(client.size).to.be.above(before);
    });
    it('Should return a number (bulk size)', () => {
        const client = new SDC();
        const bulkSize = client.generic('count', 'a');
        expect(bulkSize).to.be.a('number');
        expect(bulkSize).to.equal(client.size);
    });
    it('Should follow functional pipeline', () => {
        const order = [];
        const client = new SDC();
        piggyback('push', () => order.push('push'));
        const format = client.format;
        client.format = function(...args) {
            order.push('format');
            return format.apply(this, args);
        };
        client.generic('count', 'a');
        expect(order).to.deep.equal(['format', 'push']);
    });
    it('Should push whatever is returned from format method', () => {
        const client = new SDC();
        client.format = () => 'some string';
        client.generic('count', 'a');
        expect(parameters.push).to.deep.equal(['some string']);
    });
});
