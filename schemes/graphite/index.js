const DELIMETER_KEY_VALUE = ':';
const DELIMETER_METRIC_TYPE = '|';
const DELIMETER_RATE = '@';
const DELIMETER_TAGS = ';';
const DELIMETER_TAGS_K_V = '=';
const DELIMETER_TAGS_LIST = ';';

module.exports = function scheme({type, key, value, rate, tags}) {
	const parts = [key];
	tags && parts.push(DELIMETER_TAGS, tagsString(tags));

	parts.push(
		DELIMETER_KEY_VALUE,
		value,
		DELIMETER_METRIC_TYPE,
		type
	);

	rate && parts.push(DELIMETER_RATE, rate);

	return parts.join('');
};

const tagsString = tags => Object.entries(tags).map(
	([key, value]) => [key, value].join(DELIMETER_TAGS_K_V)
).join(DELIMETER_TAGS_LIST);
