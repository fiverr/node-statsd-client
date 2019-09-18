# Create a custom scheme
Scheme functions can create different formats for the stats service, other that the popular dogstatsd and graphite schemes which are built in.

To the instantiation parameter `scheme`, pass a function instead of a string. This function accepts named parameters:

| Param | Meaning | Example
| - | - | -
| type | Metric Type | `'c'`, `'ms'`, `'g'`, `'s'`, `'h'`
| key | Metric | `'service.name'`
| value | Value | `10`
| rate | decimal fraction | `.1`
| tags | Object | `{method: 'POST', route: 'user/:user_id'}`

```js
const stats = new SDC({
  ...
  // Simplistic example custom scheme function
  scheme: ({type, key, value, rate, tags}) => `${key}:${value}|${type}@${rate}#${Object.entries(tags).map(tag => tag.join(':')).join(',')}`
});
```
