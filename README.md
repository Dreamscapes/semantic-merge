# Semantic Merge

[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Documentation Status][inch-badge]][inch-url]
![Built with GNU Make][make-badge]

> A merging utility that is self-descriptive and makes sense.

## Description

Code should be self-descriptive - you should not need to go hunting for API docs just to understand how a particular function or method works. Ever seen this?

```js
var result = merge({prop: 'some value' }, { prop: 'another value' })
```

It's obvious the `merge` function merges two objects, but in what order? And does it modify one of the original objects or does it create new one? You cannot really tell unless you go check the utility's API documentation. And even then you are likely to forget in a matter of days.

#### What about this?

```js
var result = merge({prop: 'some value' }).into({ prop: 'another value' })
```

Now it's obvious - the properties of the first object get merged into the second object, overwriting existing values. No need to check the docs and no need to remember anything.

## Detailed examples

As usual, you start by requiring the module:

```js
var merge = require('semantic-merge')
```

To perform a shallow merge of one object into another:

```js
// src and target are objects defined somewhere in the current scope
var result = merge(src).into(target)
// Since we are merging into target, we do not need to capture
// the return value:
merge(src).into(target)
```

To perform a recursive (deep) merge of one object into another:

```js
merge(src).recursively.into(target)
```

To merge src into target and create a new object without modifying target:

```js
// You are always explicit about what should be the merge target
// You can chain as many .and() calls as you like - they will be merged
// into the target from right to left, so target first, then src.
var result = merge(src).and(target).into({})
```

## Documentation

Documentation, including several tutorials, is available [here][api-docs].

To generate documentation locally, run `make docs` from the repository's root.

## License

This software is licensed under the **BSD-3-Clause License**. See the [LICENSE](LICENSE) file for more information.

[npm-badge]: https://badge.fury.io/js/semantic-merge.svg
[npm-url]: https://npmjs.org/package/semantic-merge
[travis-badge]: https://travis-ci.org/Dreamscapes/semantic-merge.svg
[travis-url]: https://travis-ci.org/Dreamscapes/semantic-merge
[coveralls-badge]: https://img.shields.io/coveralls/Dreamscapes/semantic-merge.svg
[coveralls-url]: https://coveralls.io/r/Dreamscapes/semantic-merge
[inch-badge]: http://inch-ci.org/github/dreamscapes/semantic-merge.svg
[inch-url]: http://inch-ci.org/github/dreamscapes/semantic-merge
[make-badge]: https://img.shields.io/badge/built%20with-GNU%20Make-brightgreen.svg
[api-docs]: http://dreamscapes.github.io/semantic-merge
