const { createSocket } = require('dgram');

/**
 * Private socket instance
 * @type {Socket}
 */
let socket = null;

/**
 * Private timer ID
 * @type {Timeout}
 */
let timer = null;

/**
 * Return socket instance or create one when missing
 * @param  {String} port
 * @param  {String} host
 * @return {Socket}
 */
function getSocket(sockettype, timeout) {
    socket = socket || createSocket(sockettype);

    clearTimeout(timer);
    timer = setTimeout(endSocket, timeout);

    return socket;
}

/**
 * Destroy socket instance and unlink it for garbage collection
 * @return {undefined}
 */
function endSocket() {
    socket && socket.close();
    socket = null;
}

/**
 * @typedef Send
 * @type {Function}
 * @description Send a message over a UDP socket. Return nothing
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
module.exports = (port, host, sockettype, errorHandler, timeout) => (data) => {
    const buffer = Buffer.from(data);

    getSocket(sockettype, timeout).send(
        buffer,
        0,
        buffer.length,
        port,
        host,
        (error) => {
            endSocket();
            error && errorHandler(error, data);
        }
    );
};
