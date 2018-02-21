# isDependency: A really dumb node module

### This module tells you wether or not if the name of a package is a dependency of another package.

```bash
npm i is-dependency -S
```

```js
const isDependency = require('is-dependency')

// this looks for the most relative node_modules path and check if axios exists
const dependent = await isDependency('axios')
```

```js
// returns a boolean value wether the pacakge 'is-buffer' is a dependency to 'express'
await isDependency('express', 'is-buffer')
```


```js
// This will return a object
await isDependency('rimraf', ['bar', 'foo', 'is-dumb'])
/*
{
    foo: false,
    bar: false,
    'is-dumb': false // more like this module itself
}
*/
```