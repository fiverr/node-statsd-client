let sender;

const args = {};
const called = {};

function cleanup() {
    delete require.cache[require.resolve('.')];
    delete require.cache[require.resolve('../send-udp')];
    delete require.cache[require.resolve('../send-tcp')];
}

describe('sender', () => {
    before(cleanup);
    beforeEach(() => {
        cleanup();
        [
            'send-tcp',
            'send-udp'
        ].forEach((name) => {
            called[name] = false;
            args[name] = null;

            const route = `../${name}`;
            require(route);
            require.cache[require.resolve(route)].exports = (..._args) => {
                called[name] = true;
                args[name] = _args;
                return (data) => {
                    called.send = true;
                    args.send = data;
                };
            };
        });
        sender = require('.');
    });
    after(cleanup);
    it('Should create a TCP sender', () => {
        sender({ protocol: 'tcp' });
        expect(called['send-tcp']).to.be.true;
    });
    it('Should create a TCP sender with host and port', () => {
        sender({ host: '10.200.0.1', port: 2004, protocol: 'tcp' });
        const [port, host] = args['send-tcp'];
        expect(host).to.equal('10.200.0.1');
        expect(port).to.equal(2004);
    });
    [
        'ipv6',
        'IPV6'
    ].forEach((protocol_version) => {
        it(`Should create an IPv6 UDP socket when ${protocol_version} specified`, () => {
            sender({ protocol_version });
            const [, , sockettype] = args['send-udp'];
            expect(sockettype).to.equal('udp6');
        });
    });
    [
        'ipv4',
        undefined,
        null
    ].forEach((protocol_version) => {
        it(`Should create an IPv4 UDP socket when ${protocol_version} specified`, () => {
            sender({ protocol_version });
            const [, , sockettype] = args['send-udp'];
            expect(sockettype).to.equal('udp4');
        });
    });
});
