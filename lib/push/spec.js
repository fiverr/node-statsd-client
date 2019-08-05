const wait = require('@lets/wait');
const push = require('.');

let called = false;

/**
 * Create a context object (apply defaults)
 * @param  {Array}    [options.bulk]
 * @param  {Number}   [options.timer]
 * @param  {Function} [options.flush]
 * @param  {Number}   [options.MTU]
 * @param  {Number}   [options.timeout]
 * @return {Object}
 */
const context = ({
    bulk = [],
    timer = 0,
    flush = function() {
        called = true;
        this.bulk.length = 0;
    },
    MTU = 576,
    timeout = 1000
}) => {
    const instance = {
        bulk,
        timer,
        flush,
        MTU,
        timeout
    };
    instance.flush = instance.flush.bind(instance);
    Object.defineProperty(
        instance, 'size', {
            get: function() {
                return this.bulk.join('\n').length;
            }
        }
    );
    return instance;
};

describe('push', () => {
    beforeEach(() => {
        called = false;
    });
    it('Should not flush immediately when metric is smaller than MTU', () => {
        push.call(context({MTU: 10}), '123456789');
        expect(called).to.be.false;
    });
    it('Should flush immediately when metric is larger than MTU', () => {
        push.call(context({MTU: 10}), '1234567890a');
        expect(called).to.be.true;
    });
    it('Should flush when bulk size matches MTU', () => {
        const ctx = context({MTU: 10});
        expect(ctx.bulk).to.have.lengthOf(0);
        push.call(ctx, '12345');
        expect(called).to.be.false;
        expect(ctx.bulk).to.have.lengthOf(1);
        push.call(ctx, '1234');
        expect(called).to.be.true;
        expect(ctx.bulk).to.have.lengthOf(0);
    });
    it('Should flush when bulk size "will pass" MTU', () => {
        const ctx = context({MTU: 10});
        expect(ctx.bulk).to.have.lengthOf(0);
        push.call(ctx, '1234');
        expect(called).to.be.false;
        expect(ctx.bulk).to.have.lengthOf(1);
        push.call(ctx, '1234');
        expect(called).to.be.false;
        expect(ctx.bulk).to.have.lengthOf(2);
        push.call(ctx, '1234');
        expect(called).to.be.true;
        expect(ctx.bulk).to.have.lengthOf(1);
    });
    it('Should send metrics after timeout has ended', async() => {
        const ctx = context({timeout: 10});
        expect(ctx.bulk).to.have.lengthOf(0);
        push.call(ctx, '1234');
        expect(called).to.be.false;
        expect(ctx.bulk).to.have.lengthOf(1);
        await wait(5);
        push.call(ctx, '1234');
        expect(called).to.be.false;
        expect(ctx.bulk).to.have.lengthOf(2);
        await wait(6);
        expect(called).to.be.true;
        expect(ctx.bulk).to.have.lengthOf(0);
        called = false; // eslint-disable-line require-atomic-updates
        push.call(ctx, '1234');
        expect(called).to.be.false;
        expect(ctx.bulk).to.have.lengthOf(1);
    });
});
