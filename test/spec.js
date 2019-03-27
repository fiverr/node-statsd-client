const { resolve } = require('path');

let results = [];

describe('Integration', () => {
	let SDC;
	before(() => {
		cacheCleanup();
		require('../lib/sender');
		require.cache[require.resolve('../lib/sender')].exports = () => (...args) => results.push(...args);
		SDC = require('..');
	});
	beforeEach(() => {
		results.length = 0;
	});
	after(cacheCleanup);
	it('Should sanitise key', () => {
		const client = new SDC({MTU: 0});
		client.count('Hello1-there$.');
		expect(results[0]).to.contain('hello1_there_.');
	});
	it('Should only fire when the bulk gets full', () => {
		const client = new SDC({MTU: 100});
		client.count(new Array(46).join('a'));
		expect(results).to.have.lengthOf(0);
		client.count(new Array(46).join('a'));
		expect(results).to.have.lengthOf(0);
		client.count(new Array(2).join('a'));
		expect(results).to.have.lengthOf(1);
	});
	it('Should allow for no MTU by setting it to 0 (or anything lower that 5)', () => {
		const client = new SDC({MTU: 0});
		expect(results).to.have.lengthOf(0);
		client.count(new Array(2).join('a'));
		expect(results).to.have.lengthOf(1);
	});
	it('Should fire after ttl has expired', async() => {
		const client = new SDC({timeout: 50});
		client.count(new Array(10).join('a'));
		expect(results, 'Expected not to fire immediately').to.have.lengthOf(0);
		await wait(21);
		expect(results, 'Expected not to fire before timeout has expired').to.have.lengthOf(0);
		await wait(32);
		expect(results, 'Expected to fire once timeout has expired').to.have.lengthOf(1);
	});
	it('Should maintain ttl after adding to bulk', async() => {
		const client = new SDC({timeout: 50});
		client.count(new Array(10).join('a'));
		expect(results, 'Expected not to fire immediately').to.have.lengthOf(0);
		await wait(21);
		client.count(new Array(10).join('a'));
		expect(results, 'Expected not to fire before timeout has expired').to.have.lengthOf(0);
		await wait(30);
		expect(results, 'Expected to fire once timeout has expired').to.have.lengthOf(1);
	});
	it('Should flush immaterially explicitly', async() => {
		const client = new SDC({timeout: 50});
		client.count('a');
		client.flush();
		expect(results, 'Expected to fire immaterially').to.have.lengthOf(1);
	});
});

describe('Integration: bulk sending', () => {
	const { Socket: { prototype: UDPsocket } } = require('dgram');
	const { Socket: { prototype: TCPsocket } } = require('net');

	const { send } = UDPsocket;
	const { write } = TCPsocket;
	function mock(fn) {
		UDPsocket.send = function(...args) {
			fn(...args);
		};
		TCPsocket.write = function(...args) {
			if (`${args[0]}`.startsWith('  ')) {
				write.apply(this, args); // required for test suite to communicate
			} else {
				fn(...args);
			}
		};
	}
	before(cacheCleanup);
	beforeEach(() => {
		mock(() => null);
	});
	afterEach(() => {
		UDPsocket.send = send;
		TCPsocket.write = write;
	});
	after(cacheCleanup);

	[
		{protocol: 'TCP', port: 80},
		{protocol: 'UDP', port: 2003},
	].forEach(({protocol, port}) => {
		if (process.env.CI && protocol === 'TCP') {
			it('Problems testing TCP connections on CI machines');
			return;
		}

		it(`Should flush metrics to ${protocol} socket in bulk`, async() => {
			let metrics;
			mock(buffer => {
				metrics = buffer;
			});
			const SDC = require('..');
			const client = new SDC({protocol, port});

			new Array(4).fill('a').forEach(client.count);
			expect(metrics).to.be.undefined;

			client.flush();
			expect(metrics).to.be.instanceof(Buffer);
			expect(metrics.toString()).to.have.entriesCount('\n', 3);
		});

		it(`Should send metrics to ${protocol} socket in bulk`, async() => {
			let metrics;
			mock(buffer => {
				metrics = buffer;
			});
			const SDC = require('..');
			const client = new SDC({protocol, port, timeout: 1});

			new Array(4).fill('a').forEach(client.count);
			expect(metrics).to.be.undefined;
			await wait(5);
			expect(metrics).to.be.instanceof(Buffer);
			expect(metrics.toString()).to.have.entriesCount('\n', 3);
		});
	});
});

function cacheCleanup() {
	delete require.cache[require.resolve('..')];
	const lib = resolve(__dirname, '..', 'lib');

	Object.keys(require.cache)
		.filter(key => key.startsWith(lib))
		.forEach(key => {
			delete require.cache[key];
		})
	;
}
