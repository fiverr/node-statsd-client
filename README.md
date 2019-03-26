# @fiverr/statsd-client [![](https://img.shields.io/npm/v/@fiverr/statsd-client.svg)](https://www.npmjs.com/package/@fiverr/statsd-client) [![](https://img.shields.io/badge/source--000000.svg?logo=github&style=social)](https://github.com/fiverr/node-statsd-client)

## 📈 A feature packed, highly customisable StatsD client

### Get started quickly
```js
const SDC = require('@fiverr/statsd-client');

const client = new SDC({host: '127.0.0.1', port: '8125'});
client.count('my_application_name.visit_count'); // 31 (pending bulk size)
```

### Out-of-the box features and customisations

| | Features
| - | -
| 🛍 | StatsD metric types: `count`, `time`, `gauge`, `set`, `histogram`
| 🎩 | Instance sticky prefix (optional)
| 🔧 | Custom schemes support
| 🎁 | Preconfigured schemes: [DataDog](https://docs.datadoghq.com/tagging/#defining-tags), [Graphite](https://grafana.com/blog/2018/01/11/graphite-1.1-teaching-an-old-dog-new-tricks/) ([Carbon tags 🎉](https://graphite.readthedocs.io/en/latest/tags.html#carbon))
| 🏷 | Instance tags - pre-set tags for an instance or set tags when sending
| 🔮 | Sampling (sample rate)
| 🕸 | Protocols: `UDP`, `TCP`
| 🌎 | Protocol versions: `ipv4`, `ipv6`
| ⏲ | Custom time aggregation (Cutoff time for packets allows controlled traffic)
| 📦 | Custom MTU limit (maximum transmission unit)
| 🚨 | Error handling
| 🎈 | And then some

### SDC instance creation options
| Argument | Type | Default | Meaning
| - | - | - | -
| `host` | String | `'127.0.0.1'` | StatsD host
| `port` | Number | `8125` | StatsD port
| `protocol` | String | `'UDP'` | Internet Protocol (UDP/TCP)
| `protocol_version` | String | `'ipv4'` | Internet Protocol version (ipv4/ipv6)
| `MTU` | Number | `576` | Maximum transmission size
| `timeout` | Number | `1000` | Maximum cutoff time (ms) until flush current metric packet
| `tags` | Object | _optional_ | Default tags to be sent with every metric
| `scheme` | String/Function | `'datadog'` | Format stats metric as: `'datadog'`, `'graphite'` (CarbonCache), or using a custom function
| `prefix` | String | _optional_ | Optional prefix to attach to all metrics
| `sanitise` | Function | † Default sanitisation | Sanitise metrics (including prefix) and tags' keys and values
| `errorHandler` | Function | _optional_ | Handle message sending errors (see section 'Throwing errors')

† **Default sanitisation**: Allow characters, numbers, underscores and dots. Replace everything else with underscore. Lowercase everything

#### All the options:
```js
const client = new SDC({
	host: '127.0.0.1',
	port: 8125,
	protocol: 'UDP',
	protocol_version: 'ipv6',
	MTU: 1432,
	timeout: 2000,
	tags: {environment: 'production'},
	scheme: 'datadog',
	prefix: 'my_application_name',
	sanitise: string => `${string}`.replace(/(?!\.)\W/g, '_').toLowerCase(),
	errorHandler: (error, data) => console.error(error, data),
});
```

### Metric types
Exposes a client with the functions: `count`, `time`, `gauge`, `set`, `histogram`.

### Function arguments
| Argument | Type | Default | Meaning
| - | - | - | -
| metric | String | [Mandatory] | The metric name (key)
| value | Number|Date | 1 | The value to report (A date instance will send the time diff)
| options.rate | Number | - | Sample rate - a fraction of 1 (.01 is one percent)
| options.tags | Object | - | Key-value pairs of tags set as object literal

#### Count
```js
client.count('some.counter');   // Increment by one.
client.count('some.counter', 10);   // Increment by ten.
```

#### Time
```js
client.time('some.timer', 200); // Send time value in milliseconds
client.time('some.timer', date); // If you send a date instance - it'll report the time diff
```

#### Gauge
```js
client.gauge('some.gauge', 10); // Set gauge to 10
```

#### Set
```js
client.set('your.set', 200);
```

#### Histogram
```js
client.histogram('some.histogram', 10, {foo: 'bar'}); // Histogram with tags
```

### Options

#### Tags
```js
client.count('some.counter', 10, {tags: {service: 'my-service'}});
```

#### Sample rate
```js
client.time('some.timer', 200, {rate: .05});
```

Since value is omissible, the options can skip ahead one argument:
```js
client.count('some.counter', {rate: .1, tags: {tagname: 'my-tag'}});
```

### Use all of the features!
```js
client.time(
	'response_time',
	157,
	{
		rate: .05,
		tags: {
			method: 'GET',
			route: 'users/:user_id',
			status_code: 200,
		},
	}
);
```

## Extended abilities

### Explicit flush
Lets say, for example, you want to send a metric before exiting process, you'll want to flush metrics immediately.
```js
client.flush();
```

### Generic function
An SDC instance's `generic` function accepts same arguments as specific metric emitters with a _leading argument_ of the metric type. This is useful for dynamically sending different types of metrics.
```js
client.generic('count', 'some.counter', 3);
client.generic(SDC.TYPES.timer, 'some.timer', 200);
```

### Static `TYPES`
The static getter `TYPES` helps use types dynamically *and safely*.

## Additional information

### Bulk output example
```
my_application_name.response_time:157|ms@0.05#method:get,route:users__user_id,status_code:200
my_application_name.response_time:182|ms@0.05#method:get,route:users__user_id,status_code:200
my_application_name.response_time:355|ms@0.05#method:post,route:users_change_email,status_code:201
my_application_name.response_time:30|ms#method:get,route:users__user_id,status_code:500
my_application_name.response_time:157|ms@0.05#method:get,route:users__user_id,status_code:200
```

### Throwing errors
The client tries to **throw errors** as early on in the process as possible. To try and prevent mysterious disruption in metrics later in the process, which is harder to discover.

The client aims to perform in an asynchronous and non disruptive manner. That's why the actual sending of the metrics will fail silently, unless instance is supplied with a `errorHandler` option.

The `errorHandler` function will accept two arguments: first is the error and the second is the bulk failed to be sent - for failure analysis.
```js
{
	errorHandler: (error, bulk) => console.error(error, bulk)
}
```

### Create a custom scheme
Scheme functions can create different formats for the stats service. It accepts named parameters:

| Param | Meaning | Example
| - | - | -
| type | Metric Type | `'c'`, `'ms'`, `'g'`, `'s'`, `'h'`
| key | Metric | `'service.name'`
| value | Value | `10`
| rate | decimal fraction | `.1`
| tags | Object | `{method: 'POST', route: 'user/:user_id'}`

```js
const client = new SDC({
	...
	// Simplistic example custom scheme function
	scheme: ({type, key, value, rate, tags}) => `${key}:${value}|${type}@${rate}#${Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',')}`
});
```

### Recommended MTU buffer sizes
- **By protocol**
	- IPV4: 576
	- IPV6: 1500
- **By speed**
	- Commodity Internet: 512
	- Fast Ethernet: 1432
	- Gigabit Ethernet: 8932
