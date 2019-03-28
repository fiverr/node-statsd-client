const sample = require('sample-size');
const flush = require('./lib/flush');
const formatter = require('./lib/formatter');
const push = require('./lib/push');
const sender = require('./lib/sender');
const spread = require('./lib/spread');
const types = require('./lib/types');
const TYPES_LIST = Object.keys(types);
const TYPES = Object.freeze(
	TYPES_LIST.reduce(
		(accumulator, type) => Object.assign(
			accumulator,
			{[type]: type}
		),
		{}
	)
);

/**
 * SDC
 * @property {Number}          MTU
 * @property {Number}          timeout
 * @property {Object}          tags
 * @property {Array}           bulk
 * @property {Number}          timer
 * @property {Function}        send
 * @property {Function}        format
 * @property {Function(bound)} flush
 *
 * @property {Number}   size
 * @property {Function} generic
 * @property {Function} count
 * @property {Function} time
 * @property {Function} gauge
 * @property {Function} set
 * @property {Function} histogram
 */
class SDC {
	/**
	 * @static
	 * @getter
	 * @type {Object}
	 * @property {String} count     'count'
	 * @property {String} time      'time'
	 * @property {String} gauge     'gauge'
	 * @property {String} set       'set'
	 * @property {String} histogram 'histogram'
	 */
	static get TYPES() {
		return TYPES;
	}

	/**
	 * SDC constructor
	 * @param {String}   [options.host='127.0.0.1']
	 * @param {String}   [options.port=8125]
	 * @param {String}   [options.protocol='UDP']
	 * @param {String}   [options.protocol_version='ipv4']
	 * @param {Number}   [options.MTU=576]
	 * @param {Number}   [options.timeout=1000]
	 * @param {Object}   [options.tags]
	 * @param {String}   [options.scheme='datadog']
	 * @param {String}   [options.prefix]
	 * @param {Function} [options.sanitise=(default sanitiser)]
	 * @param {Function} [options.errorHandler]
	 * @param {Boolean}  [options.enforceRate=true]
	 */
	constructor(
		{
			host = '127.0.0.1',
			port = 8125,
			protocol = 'UDP',
			protocol_version = 'ipv4',
			MTU = 576,
			timeout = 1000,
			tags,
			scheme,
			prefix,
			sanitise,
			errorHandler,
			enforceRate = true,
		} = {}
	) {
		Object.assign(
			this,
			{
				MTU, // Maximum Transmission Unit
				timeout,
				tags,
				errorHandler,
				enforceRate,
				bulk: [],
				timer: null,
				send: sender({host, port, protocol, protocol_version, errorHandler, timeout}),
				format: formatter({sanitise, prefix, scheme}),
				flush: flush.bind(this),
			}
		);

		[...TYPES_LIST, 'generic'].forEach(fn => {
			this[fn] = this[fn].bind(this);
		});
	}

	/**
	 * The size of current bulk
	 * @return {Number}
	 */
	get size() {
		return this.bulk.join('\n').length;
	}

	/**
	 * Generic metric send method
	 * @param  {String} type           Metric type
	 * @param  {String} key            The metric name (key)
	 * @param  {Number} [value=1]      The value to report
	 * @param  {Number} [options.rate] Sample rate - a fraction of 1 (.01 is one percent)
	 * @param  {Object} [options.tags] Key-value pairs of tags set as object literal
	 * @return {Number}                current size of the bulk
	 */
	generic(...args) {
		let [
			type,
			key,
			value = 1,
			rate,
			tags,
		] = spread(args);

		if (rate) {
			if (typeof rate !== 'number') {
				throw new TypeError(`Expected 'rate' to be a number, instead got a ${typeof rate}`);
			}
			if (rate > 1) {
				throw new TypeError(`Expected 'rate' to be a number between 0 and 1, instead got ${rate}`);
			}

			if (this.enforceRate && !sample(rate)) {
				return this.size;
			}
		}

		if (this.tags) {
			tags = Object.assign({}, this.tags, tags || {});
		}
		return push.call(
			this,
			this.format(
				type,
				key,
				value,
				{ rate, tags }
			)
		);
	}
}

Object.defineProperties(
	SDC.prototype,
	TYPES_LIST.reduce(
		(accumulator, type) => Object.assign(
			accumulator,
			{
				[type]: {
					/**
					 * Specific metric type send method
					 * @param  {String} key            The metric name (key)
					 * @param  {Number} [value]        The value to report
					 * @param  {Number} [options.rate] Sample rate - a fraction of 1 (.01 is one percent)
					 * @param  {Object} [options.tags] Key-value pairs of tags set as object literal
					 * @return {Number}                current size of the bulk
					 */
					value: function(...args) {
						return this.generic(type, ...args);
					},
					configurable: true,
					enumerable: true,
					writable: true,
				},
			}
		),
		{}
	)
);

module.exports = SDC;
