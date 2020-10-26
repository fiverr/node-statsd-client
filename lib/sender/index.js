const sendTCP = require('../send-tcp');
const sendUDP = require('../send-udp');

const PATTERN_PROTOCOL = /tcp|udp/i;
const PATTERN_PROTOCOL_VERSION = /ipv[4|6]/i;

/**
 * Get the proper send method
 * @param  {String}   options.host
 * @param  {Number}   options.port
 * @param  {String}   [options.protocol='UDP']
 * @param  {String}   [options.protocol_version='ipv4']
 * @param  {Function} [options.errorHandler]
 * @return {Function} send method
 */
module.exports = function sender({ host, port, protocol, protocol_version, errorHandler } = {}) {
    if (protocol) {
        if (!PATTERN_PROTOCOL.test(protocol)) {
            throw new Error(`Protocol must match ${PATTERN_PROTOCOL}. Instead got ${protocol}.`);
        }
    }

    errorHandler = typeof errorHandler === 'function'
        ? errorHandler
        : () => null
    ;

    if ((/tcp/i).test(protocol)) {
        return sendTCP(port, host, errorHandler);
    }

    if (protocol_version) {
        if (!PATTERN_PROTOCOL_VERSION.test(protocol_version)) {
            throw new Error(`Protocol version must match ${PATTERN_PROTOCOL_VERSION}. Instead got ${protocol_version}.`);
        }
    }

    const sockettype = (/ipv6/i).test(protocol_version)
        ? 'udp6'
        : 'udp4'
	;

    return sendUDP(port, host, sockettype, errorHandler);
};
