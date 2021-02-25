const DELIMETER_KEY_VALUE = ':';
const DELIMETER = '|';
const DELIMETER_RATE = '@';
const DELIMETER_TAGS = '#';
const DELIMETER_TAGS_K_V = ':';
const DELIMETER_TAGS_LIST = ',';

module.exports = function scheme({ type, key, value, rate, tags }) {
    const parts = [
        key,
        DELIMETER_KEY_VALUE,
        value,
        DELIMETER,
        type
    ];

    rate && parts.push(DELIMETER, DELIMETER_RATE, rate);
    tags && parts.push(DELIMETER, DELIMETER_TAGS, tagsString(tags));

    return parts.join('');
};

const tagsString = (tags) => Object.entries(tags).map(
    ([key, value]) => [key, value].join(DELIMETER_TAGS_K_V)
).join(DELIMETER_TAGS_LIST);
