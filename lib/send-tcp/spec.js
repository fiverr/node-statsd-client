const defaults = [
    1337, // port
    '0.0.0.0', // host
    (..._args) => {
        called.errorHandler = true;
        args.errorHandler = _args;
    } // errorHandler
];
const args = {};
const called = {};

describe('send-tcp', () => {
    const { createConnection } = require('net');
    let sendTCP;
    beforeEach(() => {
        delete require.cache[require.resolve('.')];
        Object.keys(args).forEach((key) => {
            args[key] = null;
        });

        Object.keys(called).forEach((key) => {
            called[key] = false;
        });
        require('net').createConnection = (..._args) => {
            called.createConnection = true;
            args.createConnection = _args;

            return ['write', 'destroy', 'setKeepAlive', 'end'].reduce(
                (accumulator, fn) => Object.assign(accumulator, {
                    [fn]: (..._args) => {
                        called[fn] = true;
                        args[fn] = _args;

                        return accumulator;
                    }
                }),
                {}
            );
        };

        sendTCP = require('.');
    });

    after(() => {
        require('net').createConnection = createConnection;
    });

    it('Should write a Buffer to a TCP socket', () => {
        sendTCP(...defaults)('hello');
        const [result] = args.write;
        expect(result).to.be.an.instanceof(Buffer);
        expect(result.toString()).to.equal('hello');
    });
    it('Should send consecutive messages to the same socket', () => {
        const send = sendTCP(...defaults);
        send('message');
        expect(called.createConnection).to.be.true;
        called.createConnection = false;
        expect(called.write).to.be.true;
        called.write = false;
        send('message');
        expect(called.write).to.be.true;
        expect(called.createConnection).to.be.false;
    });
});
