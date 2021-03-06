/**
 * Send metrics collected in the bulk
 * @return {undefined}
 */
module.exports = function flush() {
    clearTimeout(this.timer);
    this.timer = null;
    this.send(this.bulk.join('\n'));
    this.bulk.length = 0;
};
