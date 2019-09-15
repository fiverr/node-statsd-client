# @fiverr/statsd-client

## 📈 A feature packed, highly customisable StatsD client {docsify-ignore}

### Get started quickly
```js
const SDC = require('@fiverr/statsd-client');

const stats = new SDC({host: '127.0.0.1', port: '8125'});
stats.count('my_application_name.visit_count'); // 31 (pending bulk size)
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
| ⏲ | Custom flush period (Cutoff time for packets allows controlled traffic)
| 📦 | Custom MTU limit (maximum transmission unit)
| 🚨 | Error handling
| 🎈 | And then some
