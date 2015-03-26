/**
 * Dreamscapes\semantic-merge
 *
 * Licensed under the BSD-3-Clause license
 * For full copyright and license information, please see the LICENSE file
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2015 Robert Rossmann
 * @link       https://github.com/Dreamscapes/semantic-merge
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

  // Helper function
  var define = Object.defineProperty.bind(null, this)

  define('recurse', { value: false, writable: true })
  define('sources', { value: [] })
  define('exclusions', { value: [] })

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

  // Only allow objects
  if (type !== 'object')
    throw new TypeError('Object or array source is required for merging, ' + type + ' given')

  this.sources.push(source)

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

  var source
    , property
    , item

  // There may be multiple source objects to be merged into the target - start with the object which
  // has been added to the sources as last
  while (this.sources.length) {
    source = this.sources.pop()

    for (property in source) {
      item = source[property]    // Current item being merged

      // Do not copy properties defined up in the prototype chain
      if (! source.hasOwnProperty(property))
        continue

      // Is this property on the list of exclusions?
      if (~ this.exclusions.indexOf(property))
        continue

      // Is this an object? Should we perform recursive merge?
      if (this.recurse && typeOf(item) === 'object') {
        // "To understand recursion, you must first understand recursion."
        target[property] = new Merger(item)
          .recursively
          .excluding(this.exclusions)
          // Only create new target object (of the same type) if the target does not exist yet
          .into(typeOf(target[property]) === 'object' ? target[property] : new item.constructor())
        continue
      }

      target[property] = item
    }
  }

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
    this.exclusions.push(properties[i])

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
      this.recurse = true

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
