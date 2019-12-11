/**
 * Mutate: enrich error with details
 * @param  {Error}    error
 * @param  {...any} arguments
 * @return {void}
 */
module.exports = function betterror(error, details) {
    if (details && typeof details === 'object') {
        error.details = Object.assign(
            error.details || {},
            details
        );
    }
    return error;
};
