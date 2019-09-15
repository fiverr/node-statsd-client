# SDC instance creation options
| Argument | Type | Default | Meaning
| - | - | - | -
| `host` | String | `'127.0.0.1'` | StatsD host
| `port` | Number | `8125` | StatsD port
| `protocol` | String | `'UDP'` | Internet Protocol (UDP/TCP)
| `protocol_version` | String | `'ipv4'` | Internet Protocol version (ipv4/ipv6)
| `MTU` | Number | `576` | Maximum transmission size
| `timeout` | Number | `1000` | Maximum cutoff time (ms) until flush current metric bulk
| `tags` | Object | _optional_ | Default tags to be sent with every metric
| `scheme` | String/Function | `'datadog'` | Format stats metric as: `'datadog'`, `'graphite'` (CarbonCache), or using a custom function
| `prefix` | String | _optional_ | Optional prefix to attach to all metrics
| `sanitise` | Function | † Default sanitisation | Sanitise metrics (including prefix) and tags' keys and values
| `errorHandler` | Function | _optional_ | Handle message sending errors (see section 'Throwing errors')
| `enforceRate` | Boolean | true | Should I enforce rate (mark as false is rate was already enforced)

† **Default sanitisation**: Allow characters, numbers, underscores and dots. Replace everything else with underscore. Lowercase everything

## All the options: {docsify-ignore}
```js
const stats = new SDC({
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
