const defaults = [
    1337, // port
    '0.0.0.0', // host
    'udp4', // sockettype
    null, // errorHandler
    40 // timeout
];
const args = {};
const called = {};

describe('send-udp', () => {
    const {createSocket} = require('dgram');
    let sendUDP;

    beforeEach(() => {
        delete require.cache[require.resolve('.')];
        Object.keys(args).forEach((key) => {
            args[key] = null;
        });

        Object.keys(called).forEach((key) => {
            called[key] = false;
        });

        require('dgram').createSocket = (..._args) => {
            called.createSocket = true;
            args.createSocket = _args;

            return ['send', 'close'].reduce(
                (accumulator, fn) => Object.assign(accumulator, {
                    [fn]: (..._args) => {
                        called[fn] = true;
                        args[fn] = _args;
                    }
                }),
                {}
            );
        };
        sendUDP = require('.');
    });
    after(() => {
        require('dgram').createSocket = createSocket;
    });
    it('Should send a Buffer to a UDP socket', () => {
        sendUDP(defaults)('hello');
        const [result] = args.send;
        expect(result).to.be.an.instanceof(Buffer);
        expect(result.toString()).to.equal('hello');
    });
    it('Should send consecutive messages to the same socket', () => {
        const send = sendUDP(defaults);
        send('message');
        expect(called.createSocket).to.be.true;
        called.createSocket = false;
        expect(called.send).to.be.true;
        called.send = false;
        send('message');
        expect(called.send).to.be.true;
        expect(called.createSocket).to.be.false;
    });
});
