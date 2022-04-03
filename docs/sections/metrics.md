
# Metric types
Exposes a client with the functions: `count`, `time`, `gauge`, `set`, `histogram`.

## Function arguments
| Argument | Type | Default | Meaning
| - | - | - | -
| metric | String | [Mandatory] | The metric name (key)
| value | Number\|Date\|BigInt | 1 | The value to report †
| options.rate | Number | - | Sample rate - a fraction of 1 (.01 is one percent)
| options.tags | Object | - | Key-value pairs of tags set as object literal
| options.enforceRate | Boolean | true | Override instance enforceRate option with this value

> † If `value` if a Date - instance will send the time diff (`Date.now()`)
>
> † If `value` if a BigInt - instance will send the time diff (`process.hrtime.bigint()`) **in milliseconds** with nanoseconds accuracy

### Count
```js
stats.count('some.counter');   // Increment by one.
stats.count('some.counter', 10);   // Increment by ten.
```

### Time (number|date|bigint)
```js
stats.time('some.timer', 200); // Send time value in milliseconds

// Send date
const start = new Date();
...
stats.time('some.timer', start); // instance will send the time diff (`Date.now()`)

// Send high resolution time
const start = process.hrtime.bigint();
...
stats.time('some.timer', start); // instance will send the time diff (`process.hrtime.bigint()`) in milliseconds with nanoseconds accuracy
```

### Gauge
```js
stats.gauge('some.gauge', 10); // Set gauge to 10
```

### Set
```js
stats.set('your.set', 200);
```

### Histogram
```js
stats.histogram('some.histogram', 10, {foo: 'bar'}); // Histogram with tags
```

## Options

### Tags
```js
stats.count('some.counter', 10, {tags: {service: 'my-service'}});
```

### Sample rate
```js
stats.time('some.timer', 200, {rate: .05});
```

Since value is omissible, the options can skip ahead one argument:
```js
stats.count('some.counter', {rate: .1, tags: {tagname: 'my-tag'}});
```

The `enforceRate` instance option comes in useful if you want to enforce the sample rate before sending metric here but still sand the rate named argument.

## Use all of the features!
```js
stats.time(
  'response_time',
  157,
  {
    rate: .05,
    tags: {
      method: 'GET',
      route: 'users/:user_id',
      status_code: 200,
    },
    enforceRate: true,
  }
);
```
