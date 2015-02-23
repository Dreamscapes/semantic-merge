Sometimes it may be useful to skip certain properties from being merged.

```js
var src = { prop1: 'a property', prop2: 'I will be ignored :(' }
  , target = {}

// prop2 will be skipped and will not appear in the target
merge(src).except('prop2').into(target)
// You can also use .excluding() - they are aliases
```

Note that when doing recursive merge, this would skip any property named `prop2` on any object encountered during the merge.

The method also accepts an array of strings so you do not have to call it more than once.

```js
merge(src).except(['prop1', 'prop2']).into(target)
```
