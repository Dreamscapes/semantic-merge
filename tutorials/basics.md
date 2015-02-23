First, you need to require the module:

```js
var merge = require('semantic-merge')
```

This gives you a single function that you can call to start merging stuff. The function accepts a single argument, an object, which you would like to merge into some other object.

### Merging into existing object

```js
var src = { prop1: 'a prop', prop2: 'a second prop' }
  , target = { prop1: 'a prop with different value', anotherProp: 'some value' }

// Since we are merging into target, we do not need to capture
// the return value - result and target now point to the same object
// (i.e. result === target)
var result = merge(src).into(target)
// So this is equivalent to the above
merge(src).into(target)
```

This will take all properties on `src` and put them into `target`. `src` is never modified.

```js
console.log(target)
{ prop1: 'a prop'   // Overwritten from src
, anotherProp: 'some value' // Preserved from target
, prop2: 'a second prop'    // Copied over from src
}
```

### Merging into new object

To merge two objects into a completely new object, without affecting any of the two originals, use the following pattern:

```js
// Notice that we now need to capture the result
var result = merge(src).and(target).into({})
```

This will cause `target` to be merged first into the new, empty object, and then `src` will be merged on top of that. In practice, this means that the object passed to the `merge` function as first will take highest precedence, while objects added using the `.and()` method will take lower precedence.

This way, you can merge as many objects as you want.

> Properties that contain objects are copied over as a reference to the same object - nested objects are not cloned. To perform a deep merge, see {@tutorial recursive-merge}.
