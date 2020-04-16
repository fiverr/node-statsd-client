const args = {};
const called = {};
const defaults = [
    1337, // port
    '0.0.0.0', // host
    'udp4', // sockettype
    (..._args) => {
        called.errorHandler = true;
        args.errorHandler = _args;
    } // errorHandler
];

describe('send-udp', () => {
    const { createSocket } = require('dgram');
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
    afterEach(() => {
        [called, args].forEach(
            (collection) => Object.keys(collection).forEach((key) => {
                delete collection[key];
            })
        );
    });
    after(() => {
        require('dgram').createSocket = createSocket;
    });
    it('Should send a Buffer to a UDP socket', () => {
        sendUDP(...defaults)('hello');
        const [result] = args.send;
        expect(result).to.be.an.instanceof(Buffer);
        expect(result.toString()).to.equal('hello');
    });
    it('Should terminate socket on error', () => {
        sendUDP(...defaults)('hello');
        const error = new Error('Something must have gonne terribly wrong');
        const callback = args.send.pop();
        callback(error);
        expect(called.close).to.be.true;
        expect(called.errorHandler).to.be.true;
        const [ handlerError, handlerData] = args.errorHandler;

        expect(handlerError).to.equal(error);
        expect(handlerData).to.equal('hello');
    });
    it('Should not terminate socket on callback', () => {
        sendUDP(...defaults)('hello');
        const callback = args.send.pop();
        callback();
        expect(called.close).to.be.undefined;
    });
    it('Should send consecutive messages to the same socket', () => {
        const send = sendUDP(...defaults);
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
