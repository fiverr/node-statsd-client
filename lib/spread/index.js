
module.exports = function spread(args) {
	let type, key, value, rate, tags;
	const lastArg = args.pop();

	if (typeof lastArg === 'object') {
		({rate, tags} = lastArg);
		([type, key, value] = args);
	} else {
		([type, key, value] = [...args, lastArg]);
	}
	return [type, key, value, rate, tags];
};
