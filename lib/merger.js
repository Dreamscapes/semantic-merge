/**
 * semantic-merge
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2015 Robert Rossmann
 * @license    http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License
 */

'use strict'

const scope = Symbol('semantic-merge internal')

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
class Merger {

  constructor(source) {
    const opts = {
      recurse: false,
      sources: [],
      exclusions: []
    }

    this[scope] = { opts }

    // Push the source into the sources array
    this.and(source)
  }

  /**
   * @summary   Add another source object to be merged
   *
   * @param     {Object}      source      The object to be merged
   * @return    {this}
   */
  and(source) {
    // Only allow objects as sources
    if (!(source instanceof Object)) {
      throw new TypeError(`Object or array source is required for merging, ${typeof source} given`)
    }

    this[scope].opts.sources.push(source)

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
  into(target) {
    // Only allow objects as targets
    if (!(target instanceof Object)) {
      throw new TypeError(`Object or array target is required for merging, ${typeof target} given`)
    }

    // There may be multiple source objects to be merged into the target - start with the object
    // which has been added to the sources as last
    while (this[scope].opts.sources.length) {
      doMerge(this[scope].opts.sources.pop(), target, this[scope].opts)
    }

    return target
  }

  /**
   * @summary   While merging, ignore properties with this name
   *
   * @tutorial  ignoring-properties
   * @param     {String|Array}  properties  A single property or array of properties to be ignored.
   *                                        This will be used on all recursive levels of merging.
   * @return    {this}
   */
  excluding(properties) {
    if (!(properties instanceof Array)) {
      properties = [properties]
    }

    for (const property of properties) {
      this[scope].opts.exclusions.push(property)
    }

    return this
  }

  /**
   * @summary   Alias of {@link module:semantic-merge~Merger#excluding excluding()}
   *
   * @tutorial  ignoring-properties
   * @method    module:semantic-merge~Merger#except
   * @param     {String|Array}    properties    Property names which should be ignored when merging
   * @return    {this}
   */
  except(properties) {
    return this.excluding(properties)
  }

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
  get recursively() {
    this[scope].opts.recurse = true

    return this
  }
}


/**
 * Determine whether we should do an array or object merge
 *
 * @private
 * @param     {Object}    source    Source to merge
 * @param     {Object}    target    Target to merge into
 * @param     {Object}    opts      Options for the merge
 * @return    {Object}
 */
function doMerge(source, target, opts) {
  return target instanceof Array
    ? mergeArrays(source, target)
    : mergeObjects(source, target, opts)
}

/**
 * Merge two objects
 *
 * @private
 * @param     {Object}    source    Source to merge
 * @param     {Object}    target    Target to merge into
 * @param     {Object}    opts      Options for the merge
 * @return    {Object}
 */
function mergeObjects(source, target, opts) {
  const properties = Object.keys(source)

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]

    // Is this property on the list of exclusions?
    if (opts.exclusions.indexOf(property) !== -1) {
      continue
    }

    let item = source[property]

    // Is this an object? Should we perform recursive merge?
    if (opts.recurse && item instanceof Object && !(item instanceof Function)) {
      // If the item on the source is object, we must have such object on the target as well
      // So we either reuse any such existing "receiving" object or we create a new one
      const receiver = target[property] instanceof Object ? target[property]
                                                          : new item.constructor()

      // "To understand recursion, you must first understand recursion."
      item = doMerge(item, receiver, opts)
    }

    target[property] = item
  }

  return target
}

/**
 * Merge two arrays
 *
 * @private
 * @param     {Array}    source     Source to merge
 * @param     {Array}    target     Target to merge into
 * @param     {Object}   opts       Options for the merge
 * @return    {Array}
 */
function mergeArrays(source, target) {
  for (let i = 0; i < source.length; i++) {
    // If the item is not yet in the target array, add it
    if (target.indexOf(source[i]) === -1) {
      target.push(source[i])
    }
  }

  return target
}


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
 * @param     {Object}      source    The source object to be merged
 * @return    {Merger}
 * @tutorial  basics
 */
module.exports = function merge(source) {
  return new Merger(source)
}

// Also export the class itself
module.exports.Merger = Merger
