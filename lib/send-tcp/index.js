const { createConnection } = require('net');

const ENCODING = 'ascii';

/**
 * Private socket instance
 * @type {Socket}
 */
let socket = null;

/**
 * Tear-down operation registered
 * @type {Boolean}
 */
let teardown = false;

/**
 * Return socket instance or create one when missing
 * @param  {String} port
 * @param  {String} host
 * @return {Socket}
 */
function getSocket(port, host) {
    socket = socket || createConnection(port, host).setKeepAlive(true);

    return socket;
}

/**
 * Destroy socket instance and unlink it for garbage collection
 * @return {undefined}
 */
function endSocket() {
    socket && socket.destroy();
    socket = null;
}


/**
 * @typedef Send
 * @type {Function}
 * @description Send a message over a TCP socket. Return nothing
 * @param  {String} data
 * @return {Socket}
 */

/**
 * Create a socket send method
 * @param  {String}   port
 * @param  {String}   host
 * @param  {Function} [errorHandler]
 * @return {Send}
 */
module.exports = (port, host, errorHandler) => (data) => {
    if (!teardown) {
        process.on('exit', endSocket);
        teardown = true;
    }

    return getSocket(port, host)
        .write(
            Buffer.from(data),
            ENCODING,
            (error) => {
                endSocket();
                error && errorHandler(error, data);
            }
        );
};
