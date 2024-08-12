const isNumber = (num) => (typeof num === "number" && num - num === 0) || (typeof num === "string" && Number.isFinite(+num) && num.trim() !== "");
const betterror = require('../betterror');
const sanitiser = require('../sanitiser');
const types = require('../types');

const letterLeading = (string) => /^[a-zA-Z]/.test(string);
const schemes = require('../../schemes');

/**
 * Creates a configured format function
 * @param  {String}          [options.prefix]           Optional prefix to prepend to all instance metric
 * @param  {String}          [options.sanitise]         Alternative sanitiser to the default one
 * @param  {Function|String} [options.scheme='datadog'] Style of tag formatting
 * @return {Function}
 */
module.exports = function formatter({ prefix, sanitise = sanitiser, scheme = 'datadog' } = {}) {
    if (prefix) {
        if (typeof prefix !== 'string') {
            throw new TypeError(`Expected 'prefix' to be a string, instead got ${prefix} (${typeof prefix})`);
        }
        if (!letterLeading(prefix)) {
            throw new Error(`Prefix must start with an alphabetical character (${prefix}).`);
        }
    }

    // If "sanitise" is falsy, it should do nothing to the input
    sanitise = sanitise || ((string) => string);
    if (typeof sanitise !== 'function') {
        throw new TypeError(`Expected 'sanitise' to be a function, instead got ${sanitise} (${typeof sanitise})`);
    }

    if (typeof scheme === 'string') {
        if (scheme in schemes) {
            scheme = schemes[scheme];
        } else {
            throw new Error(`Could not find scheme "${scheme}". Available schemes are ${Object.keys(schemes)}.`);
        }
    }

    if (typeof scheme !== 'function') {
        throw new Error(`Requiring scheme function (${scheme}).`);
    }

    const sanitiseKeys = (object) => Object.entries(object)
        .reduce(
            (accumulator, [key, value]) => Object.assign(
                accumulator,
                { [sanitise(key)]: sanitise(value) }
            ),
            {}
        );

    /**
	 * Format a StatsD metric
	 * @param  {String} type           The type of metric to report
	 * @param  {String} key            The metric name (key)
	 * @param  {Number|Date} value     The value to report
	 * @param  {Number} options.rate   Sample rate - a fraction of 1 (.01 is one percent)
	 * @param  {Object} options.tags   Key-value pairs of tags set as object literal
	 * @return {String}                Formatted StatsD metric
	 */
    return function format(type = 'count', key, value = 1, { rate, tags } = {}) {
        if (type in types) {
            type = types[type];
        } else {
            throw betterror(new RangeError(`Expected 'type' to be one of ${Object.keys(types).join(', ')}, instead got ${type}`), { type, key, value, rate, tags });
        }
        if (typeof key !== 'string') {
            throw betterror(new TypeError(`Expected 'key' to be a string, instead got ${key} (${typeof key})`), { type, key, value, rate, tags });
        }
        if (!key) {
            throw betterror(
                new RangeError(`Expected 'key' to be a non empty string, instead found ${key} (${typeof key})`),
                { type, key, value, rate, tags }
            );
        }
        if (!prefix && !letterLeading(key)) {
            throw betterror(new Error(`Expected 'key' to start with an alphabetical character (${key}).`), { type, key, value, rate, tags });
        }
        if (value instanceof Date) {
            value = new Date() - value;
        }
        if (typeof value === 'bigint') {
            value = Number(process.hrtime.bigint() - value) / 1e6;
        }
        if (typeof value !== 'number' || !isNumber(value)) {
            throw betterror(new TypeError(`Expected 'value' to be a number, instead got ${value} (${typeof value})`), { type, key, value, rate, tags });
        }

        if (prefix) {
            key = [prefix, key].join('.');
        }

        key = sanitise(key);

        if (tags) {
            tags = sanitiseKeys(tags);
        }

        return scheme({ type, key, value, rate, tags });
    };
};
