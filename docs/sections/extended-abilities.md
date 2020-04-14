# Extended abilities

## Explicit flush
Lets say, for example, you want to send a metric before exiting process, you'll want to flush metrics immediately.
```js
stats.flush();
```

You can use this ability to make sure all pending metrics are being sent before your process exists
```js
process.on('SIGKILL', stats.flush);
```

## Generic function
An SDC instance's `generic` function accepts same arguments as specific metric emitters with a _leading argument_ of the metric type.

It was created for internal use but proved useful for dynamically sending different types of metrics.
```js
stats.generic('count', 'some.counter', 3);
stats.generic(SDC.TYPES.timer, 'some.timer', 200);
```

## Static `TYPES`
The static getter `TYPES` helps use types dynamically *and safely*.
