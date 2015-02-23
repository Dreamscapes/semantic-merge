By default, nested objects are copied by reference, i.e. the merged object's property will point to the same object in memory as the original source. To perform a recursive (deep) merge, do the following:

```js
merge(src).recursively.into(target)
```

Now, if `src` contained a property with another object, `target` will receive a completely independent copy of that object.
