const wait = require('@lets/wait');

const stubs = {};
let formatter;

function clean() {
    delete require.cache[require.resolve('../../schemes/datadog')];
    delete require.cache[require.resolve('../../schemes/graphite')];
    delete require.cache[require.resolve('../../schemes')];
}

describe('formatter', () => {
    let format;
    let schemas;
    before(() => {
        schemas = require('../../schemes');
        require.cache[require.resolve('../../schemes')].exports = {
            datadog: (...args) => stubs.datadog(...args),
            graphite: (...args) => stubs.graphite(...args)
        };
        formatter = require('.');
        format = formatter();
    });
    beforeEach(() => Object.assign(stubs, schemas));
    after(clean);
    it(
        'Should throw error when metric name is not a string',
        () => [
            1,
            null,
            {},
            [],
            /\w/,
            undefined
        ].forEach(
            (metric) => expect(() => format(undefined, metric)).to.throw()
        )
    );
    it(
        'Should throw error when metric value is not a number',
        () => [
            '1',
            NaN,
            Infinity,
            null,
            {},
            [],
            /\w/
        ].forEach(
            (value) => expect(() => format(undefined, 'Hello', value)).to.throw()
        )
    );
    it(
        'Should throw error when type is not one of pre defined types',
        () => [
            'counter',
            'Count',
            'timing',
            'Set',
            null,
            {},
            [],
            /\w/
        ].forEach(
            (type) => expect(() => format(type, 'Hello', undefined)).to.throw()
        )
    );
    it(
        'Should add details to errors',
        () => {
            let error;
            try {
                format('time', 'Hello', NaN);
            } catch (e) {
                error = e;
            }
            console.log(error);
            expect(error.details).to.deep.equal({ type: 'ms', key: 'Hello', value: NaN, rate: undefined, tags: undefined });
        }
    );
    it(
        'Should default type to counter',
        () => {
            let t;
            const format = formatter({
                scheme: ({type}) => {
                    t = type;
                }
            });
            format(undefined, 'hello');
            expect(t).to.equal('c');
        }
    );
    it(
        'Should default value to one',
        () => expect(format(undefined, 'hello')).to.contain(':1|')
    );
    [
        ['count', 'c'],
        ['time', 'ms'],
        ['gauge', 'g'],
        ['set', 's'],
        ['histogram', 'h']
    ].forEach(
        ([full, symbol]) => {
            it(
                `Should map type ${full} to symbol ${symbol}`,
                () => {
                    let t;
                    const format = formatter({
                        scheme: ({type}) => {
                            t = type;
                        }
                    });

                    t = null;
                    format(full, 'hello', undefined);
                    expect(t).to.equal(symbol);
                }
            );
        }
    );
    it('Should pass variables to scheme method', () => {
        let args;
        const format = formatter({
            scheme: (object) => {
                args = object;
            }
        });

        format('count', 'metric', 10, {rate: 0.1, tags: {a: 1, b: 2}});
        expect(args).to.deep.equal({
            type: 'c',
            key: 'metric',
            value: 10,
            rate: 0.1,
            tags: {a: '1', b: '2'}
        });
    });
    it('Should use a date in order to get time diff', async() => {
        let time;
        const format = formatter({scheme: ({value}) => {
            time = value;
        }});
        const date = new Date();
        await wait(10);
        format('time', 'metric', date);
        expect(time).to.be.a('number');
        expect(time).to.be.at.least(9);
    });
    it('Should use a BigInt in order to get the time diff', async function() {
        this.retries(3);
        let time;
        const format = formatter({scheme: ({value}) => {
            time = value;
        }});
        const start = process.hrtime.bigint();
        await wait(10);
        format('time', 'metric', start);
        expect(time).to.be.a('number');
        expect(time).to.be.at.least(9);
        expect(time.toString()).to.include('.');
        expect(time).to.be.at.below(17);
    });
    it('Should call datadog scheme module by default', () => {
        let called = false;
        const format = formatter();
        stubs.datadog = () => { called = true; };
        format('count', 'metric');
        expect(called).to.be.true;
    });
    it('Should call custom scheme function', () => {
        let called = false;
        const format = formatter({scheme: () => { called = true; }});
        format('count', 'metric');
        expect(called).to.be.true;
    });
    it('Should call datadog scheme module', () => {
        let called = false;
        const format = formatter({scheme: 'datadog'});
        stubs.datadog = () => { called = true; };
        format('count', 'metric');
        expect(called).to.be.true;
    });
    it('Should call graphite scheme module', () => {
        let called = false;
        const format = formatter({scheme: 'graphite'});
        stubs.graphite = () => { called = true; };
        format('count', 'metric');
        expect(called).to.be.true;
    });
    it('Should add a prefix', () => {
        let metric;
        const format = formatter({prefix: 'some_prefix', scheme: ({key}) => {
            metric = key;
        }});
        format('count', 'metric');
        expect(metric).to.equal('some_prefix.metric');
        format('time', 'something.else');
        expect(metric).to.equal('some_prefix.something.else');
    });
    it('Should sanitise tags\' keys', () => {
        let keys;
        const format = formatter({scheme: ({tags}) => {
            keys = Object.keys(tags);
        }});
        format('count', 'metric', 10, {tags: {'name ': 'SHlomo', Age: 4, 'ano@@er': 'det4$il'}});
        expect(keys).to.deep.equal(['name_', 'age', 'ano__er']);
    });
    it('Should sanitise tags\' values', () => {
        let values;
        const format = formatter({scheme: ({tags}) => {
            values = Object.values(tags);
        }});
        format('count', 'metric', 10, {tags: {'name ': 'SHlomo', Age: 4, 'ano@@er': 'det4$il'}});
        expect(values).to.deep.equal(['shlomo', '4', 'det4_il']);
    });
    it('Should sanitise the prefix as well', () => {
        let metric;
        stubs.datadog = ({key}) => { metric = key; };
        const format = formatter({prefix: 'some-prefix$'});
        format('count', 'metric');
        expect(metric).to.equal('some_prefix_.metric');
    });
});
