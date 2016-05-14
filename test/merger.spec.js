/**
 * semantic-merge
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2015 Robert Rossmann
 * @license    http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License
 */

'use strict'

var Merger = require('../lib/merger')
  , parent
  , source
  , target
  , merge


// Prepare a base merger instance and reset parent, source and target objects
beforeEach(function () {
  parent = { parentProp: 'I am in parent', 'test-prop': 'test' }

  source = Object.create(parent)
  source.a = 'string'
  source.b = 5
  source[3] = 'numeric key'
  source.c = null   // typeof null === 'object', an ideal test case for recursive object merge
  source.nested = { nestedProp: 'I am in a nested object' }
  source.arr = [ 'a', 'b', 'c' ]

  target = {}

  merge = new Merger(source)
})


describe('Basics', function () {

  it('should be a function', function () {
    Merger.should.be.Function()
  })

  it('should return a new instance when called without \'new\'', function () {
    Merger(source).should.be.instanceof(Merger.Merger)   // eslint-disable-line new-cap
  })

  it('should throw when source is null or not typeof \'object\'', function () {
    // Invalid source in constructor
    void function () {
      new Merger('a string').into({})
    }.should.throw(TypeError)
    // Invalid source in .and() call
    void function () {
      merge.and('a string').into({})
    }.should.throw(TypeError)
    // null is also typeof object, unfortunately...
    void function () {
      merge.and(null).into({})
    }.should.throw(TypeError)
  })

  it('should throw when target is null or not typeof \'object\'', function () {
    // No target given
    void function () {
      new Merger({}).into()
    }.should.throw(TypeError)
    // Target is null (which is typeof object...)
    void function () {
      new Merger({}).into(null)
    }.should.throw(TypeError)
  })
})


describe('Merging', function () {

  it('should merge two objects', function () {
    merge.into(target)

    // Deliberately not using `should.have.keys` because the presence or absence of other keys is
    // tested in a separate test case
    target.should.have.properties('a', 'b', 3)
  })

  it('should return the target object', function () {
    merge.into(target).should.be.exactly(target)
  })

  it('should only copy enumerable properties', function () {
    Object.defineProperty(source, 'hiddenProp', { value: 'I shall be ignored' })

    merge.into(target)

    source.should.have.property('hiddenProp')   // Sanity check
    target.should.not.have.property('hiddenProp')
  })

  it('should only copy own properties', function () {
    merge.into(target)

    source.should.have.property('parentProp')   // Sanity check
    target.should.not.have.property('parentProp')
  })

  it('should work with a null property', function () {
    source.nullProp = null
    merge.into(target)

    target.should.have.property('nullProp', null)
  })

  it('should work with an undefined property', function () {
    source.undefProp = undefined
    merge.into(target)

    target.should.have.property('undefProp', undefined)
  })

  it('should work with arrays as source', function () {
    merge = new Merger([ 'a', 'b', 'c' ])
    merge.into(target)
    target.should.have.keys(0, 1, 2)
  })

  it('should work with arrays as target', function () {
    merge = new Merger([ 'a', 'b', 'c' ])
    target = []
    merge.into(target)

    target.should.have.keys(0, 1, 2)
  })
})


describe('Merging multiple sources', function () {

  it('should support merging multiple source objects', function () {
    merge.and({ anotherProp: 'from another source' }).into(target)

    target.should.have.property('anotherProp')
  })

  it('should merge last specified object as first, thus giving it lowest priority', function () {
    merge.and({ nested: { nestedProp: 'I should not override the source' } }).into(target)

    target.nested.should.have.property('nestedProp', 'I am in a nested object')
  })
})


describe('Merging - recursion', function () {

  it('should perform only shallow merge by default', function () {
    merge.into(target)

    target.nested.should.be.exactly(source.nested)
  })

  it('should perform recursive merge when enabled', function () {
    merge.recursively.into(target)

    target.nested.should.not.equal(source.nested, 'The object instances must not be identical')
    target.nested.should.have.keys(Object.keys(source.nested))
  })

  it('should not create new objects if the target already exists during recursion', function () {
    var nested = { nestedProp: 'I shall be overwritten' }
    target.nested = nested

    merge.recursively.into(target)

    target.nested.should.equal(nested, 'The object instances must be identical')
  })

  it('should merge into the same object type when target object does not exist', function () {
    merge.recursively.into(target)

    target.nested.should.be.Object()
    target.arr.should.be.Array()
  })

  it('should preserve properties already present on nested objects during recursion', function () {
    var nested = { anotherProp: 'I shall remain' }
    target.nested = nested

    merge.recursively.into(target)

    target.nested.should.have.property('anotherProp', 'I shall remain')
  })

  xit('should properly handle cyclic recursions', function () {
    source.source = source    // Create a backreference on itself

    merge.recursively.into(target)

    target.source.should.be.exactly(target)
  })
})


describe('Merging - exclusions', function () {

  it('should ignore excluded properties', function () {
    merge.excluding('a').into(target)

    target.should.not.have.property('a')
  })

  it('should allow excluded properties to be specified as array', function () {
    merge.excluding(['a']).into(target)

    target.should.not.have.property('a')
  })

  it('should ignore excluded properties on nested objects when merging recursively', function () {
    merge.excluding('nestedProp').recursively.into(target)

    target.nested.should.not.have.property('nestedProp')
  })
})

describe('Merging - arrays', function () {

  it('should merge arrays by value, not by key', function () {
    merge.and({ arr: [ 1, 2, 3 ] }).recursively.into(target)

    target.arr.should.have.length(6)
    target.arr.should.containDeep([ 'a', 'b', 'c', 1, 2, 3 ])
  })

  it('should skip primitives already present in source array', function () {
    merge.and({ arr: [ 1, 'a' ] }).recursively.into(target)

    target.arr.should.have.length(4)
    target.arr.should.containDeep([ 'a', 'b', 'c', 1 ])
  })

  it('should skip objects already present in source array', function () {
    var obj = { test: 'prop' }
    source.arr.push(obj)
    merge.and({ arr: [obj] }).recursively.into(target)

    target.arr.should.have.length(4)
    target.arr.should.containDeep([ 'a', 'b', 'c', obj ])
  })
})
