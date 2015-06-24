/**
 * semantic-merge
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2015 Robert Rossmann
 * @license    http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License
 */

'use strict'

/**
 * The semantic-merge module. It merges stuff. Semantically.
 *
 * **Usage:**
 *
 * ```js
 * var merge = require('semantic-merge')
 *   , source = { prop: 'I am in the source!' }
 *   , target = { prop: 'I am in the target, and will be overwritten :(' }
 *   , result
 *
 * result = merge(source).into(target)
 * // Note that result is the same object as target. To perform a clone, do:
 * result = merge(source).and(target).into({})
 * ```
 *
 * @module    semantic-merge
 * @type      {Function}
 * @tutorial  basics
 */
module.exports = Merger

/**
 * @classdesc This is the Merger. It is implemented as a class, but you do not need to use it as
 *            one - simply call the constructor function as you would call any other function and
 *            you get the results you would expect.
 *
 * @summary   Create a new merger
 *
 * @desc      If called without `new`, it will create a new instance anyway.
 *
 * @class
 * @param     {Object}      source      The object to be merged
 */
function Merger (source) {

  // Allow calling me without the `new` keyword
  if (! this)
    return new Merger(source)

  var local =
      { recurse: false
      , sources: []
      , exclusions: []
      }

  Object.defineProperty(this, 'local', { value: local })

  // Push the source into the sources array
  this.and(source)
}

/**
 * @summary   Add another source object to be merged
 *
 * @param     {Object}      source      The object to be merged
 * @return    {this}
 */
Merger.prototype.and = function and (source) {

  var type = typeOf(source)

  // Only allow objects as sources
  if (type !== 'object')
    throw new TypeError('Object or array source is required for merging, ' + type + ' given')

  this.local.sources.push(source)

  return this
}

/**
 * @summary   Set the target object to merge into and perform the actual merge
 *
 * @desc      This should be the last method called.
 *
 * @param     {Object}      target      The object to start merging into
 * @return    {Object}                  Returns the merged object
 */
Merger.prototype.into = function into (target) {

  var type = typeOf(target)

  // Only allow objects as targets
  if (type !== 'object')
    throw new TypeError('Object or array target is required for merging, ' + type + ' given')

  // There may be multiple source objects to be merged into the target - start with the object which
  // has been added to the sources as last
  while (this.local.sources.length)
    merge(this.local.sources.pop(), target, this.local.exclusions, this.local.recurse)

  return target
}

/**
 * @summary   While merging, ignore properties with this name
 *
 * @tutorial  ignoring-properties
 * @param     {String|Array}  properties  A single property or an array of properties to be ignored.
 *                                        This will be used on all recursive levels of merging.
 * @return    {this}
 */
Merger.prototype.excluding = function excluding (properties) {

  if (! (properties instanceof Array))
    properties = [properties]

  for (var i in properties)
    this.local.exclusions.push(properties[i])

  return this
}

/**
 * @summary   Alias of {@link module:semantic-merge~Merger#excluding excluding()}
 *
 * @tutorial  ignoring-properties
 * @method    module:semantic-merge~Merger#except
 * @return    {this}
 */
Merger.prototype.except = Merger.prototype.excluding

/**
 * @summary   Semantic getter to enable recursive merge
 *
 * @desc      By default, only shallow merge is performed. That means, if an object's property is
 *            also an object, it will be copied by reference. To avoid this, call this getter
 *            somewhere in your call chain (before you call
 *            {@link module:semantic-merge~Merger#into into()})
 * @tutorial  recursive-merge
 * @member    module:semantic-merge~Merger#recursively
 * @default   this
 */
Object.defineProperty(Merger.prototype, 'recursively'
, { enumerable: true
  , get: function recursively () {
      this.local.recurse = true

      return this
    }
  }
)


/**
 * @summary   null-safe typeof
 *
 * @private
 * @param     {mixed}       obj       The item to get type of
 * @return    {String}                The type of the item. Returns 'null' if item is null
 */
function typeOf (obj) {

  return obj === null ? 'null' : typeof obj
}

function isObject (obj) {

  return typeOf(obj) === 'object'
}

function merge (source, target, exclusions, recurse) {

  if (target instanceof Array)
    mergeArrays(source, target)
  else
    mergeObjects(source, target, exclusions, recurse)

  return target
}

function mergeObjects (source, target, exclusions, recurse) {

  var property
    , item
    , receiver

  for (property in source) {
    if (! source.hasOwnProperty(property))
      continue

    // Is this property on the list of exclusions?
    if (~ exclusions.indexOf(property))
      continue

    item = source[property]

    // Is this an object? Should we perform recursive merge?
    if (recurse && isObject(item)) {
      // If the item on the source is object, we must have such object on the target as well
      // So we either reuse any such existing "receiving" object or we create a new one
      receiver = isObject(target[property]) ? target[property] : new item.constructor()
      // "To understand recursion, you must first understand recursion."
      item = merge(item, receiver, exclusions, recurse)
    }

    target[property] = item
  }

  return target
}

function mergeArrays (source, target) {

  var item
    , i

  for (i in source) {
    item = source[i]
    // If the item is not yet in the target array, add it
    if (! ~ target.indexOf(item))
      target.push(item)
  }

  return target
}
