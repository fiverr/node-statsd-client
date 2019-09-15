# Additional information

## Bulk output example
```
my_application_name.response_time:157|ms@0.05#method:get,route:users__user_id,status_code:200
my_application_name.response_time:182|ms@0.05#method:get,route:users__user_id,status_code:200
my_application_name.response_time:355|ms@0.05#method:post,route:users_change_email,status_code:201
my_application_name.response_time:30|ms#method:get,route:users__user_id,status_code:500
my_application_name.response_time:157|ms@0.05#method:get,route:users__user_id,status_code:200
```

## Throwing errors
The client tries to **throw errors** as early on in the process as possible. To try and prevent mysterious disruption in metrics later in the process, which is harder to discover.

The client aims to perform in an asynchronous and non disruptive manner. That's why the actual sending of the metrics will fail silently, unless instance is supplied with a `errorHandler` option.

The `errorHandler` function will accept two arguments: first is the error and the second is the bulk failed to be sent - for failure analysis.
```js
{
  errorHandler: (error, bulk) => console.error(error, bulk)
}
```

## Create a custom scheme
Scheme functions can create different formats for the stats service. It accepts named parameters:

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

## Recommended MTU buffer sizes
- **By protocol**
  - IPV4: 576
  - IPV6: 1500
- **By speed**
  - Commodity Internet: 512
  - Fast Ethernet: 1432
  - Gigabit Ethernet: 8932
