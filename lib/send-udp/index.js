const { createSocket } = require('dgram');

/**
 * Private socket instance
 * @type {Socket}
 */
let socket = null;

/**
 * Socket is closing
 * @type {Boolean}
 */
let closing = false;

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
function getSocket(sockettype) {
    socket = socket || createSocket(sockettype);

    return socket;
}

/**
 * Destroy socket instance and unlink it for garbage collection
 * @return {undefined}
 */
function endSocket() {
    if (closing) {
        return;
    }
    closing = true;
    socket && socket.close(derefSocket);
    process.off('exit', endSocket);
}

/**
 * De ref socket. Set "closing" to false
 * @return {undefined}
 */
function derefSocket() {
    closing = false;
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
 * createSender: Create a socket send method
 * @param  {String}   port
 * @param  {String}   host
 * @param  {Function} [errorHandler]
 * @return {Send}
 */
module.exports = function createSender(port, host, sockettype, errorHandler) {


    /**
     * Send data to UDP socket
     * @param {string} data
     */
    function sender(data) {
        const buffer = Buffer.from(data);

        if (!teardown) {
            process.on('exit', endSocket);
            teardown = true;
        }

        return getSocket(sockettype).send(
            buffer,
            0,
            buffer.length,
            port,
            host,
            (error) => {
                if (error) {
                    endSocket();
                    errorHandler(error, data);
                }
            }
        );
    }

    sender.destroy = endSocket;
    return sender;
};
