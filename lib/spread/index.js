/**
 * Extract all required arguments from dynamic structure
 * @param  {String}  args[0]             type
 * @param  {String}  args[1]             key
 * @param  {Number}  args[2]             value
 * @param  {Number}  args[3].rate        rate
 * @param  {Object}  args[3].tags        tags
 * @param  {Boolean} args[3].enforceRate enforceRate
 * @return {Array}
 *
 * @example spread('count', 'metric', 3, {rate: .1, tags: {...tags}}) ['count', 'metric', 3, .1, {...tags}]
 * @example spread('count', 'metric', 3, {tags: {...tags}}) ['count', 'metric', 3, undefined, {...tags}]
 * @example spread('count', 'metric', {rate: .1, tags: {...tags}}) ['count', 'metric', undefined, .1, {...tags}]
 */
module.exports = function spread(args) {
    let type, key, value, rate, tags, enforceRate;
    const lastArg = args.pop();

    if (typeof lastArg === 'object') {
        ({ rate, tags, enforceRate } = lastArg);
        ([type, key, value] = args);
    } else {
        ([type, key, value] = [...args, lastArg]);
    }
    return [type, key, value, rate, tags, enforceRate];
};
