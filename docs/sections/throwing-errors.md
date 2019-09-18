# Throwing errors
The client tries to **throw errors** as early on in the process as possible. To try and prevent mysterious disruption in metrics later in the process, which is harder to discover.

The client aims to perform in an asynchronous and non disruptive manner. That's why the actual sending of the metrics will fail silently, unless instance is supplied with a `errorHandler` option.

The `errorHandler` function will accept two arguments: first is the error and the second is the bulk failed to be sent - for failure analysis.
```js
{
  errorHandler: (error, bulk) => console.error(error, bulk)
}
```
