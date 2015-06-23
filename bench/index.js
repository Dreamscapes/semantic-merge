/**
 * semantic-merge
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2015 Robert Rossmann
 * @license    http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License
 */

'use strict'

var Benchmark = require('benchmark')
  , merge = require('../lib/merger')
  , source
  , target

/*
 * Merging two objects
 */
new Benchmark.Suite()

.add('Object shallow merge', function () {
  merge(source).and(target).into({})
})

.add('Object deep merge', function () {
  merge(source).and(target).recursively.into({})
})

.on('start cycle', function () {
  source = { key: 'svalue', key2: 'svalue2', key3: { rkey1: 'rsvalue', rkey2: 'rsvalue2' } }
  target = { key: 'tvalue', key2: 'tvalue2', key3: { rkey1: 'rtvalue', rkey2: 'rtvalue2' } }
})

.on('cycle', logResult)

.run()

/*
 * Merging two arrays
 */
new Benchmark.Suite()

.add('Array shallow merge', function () {
  merge(source).and(target).into([])
})

.on('start cycle', function () {
  var shared = {}
  source = [ 'svalue', 'svalue2', { rkey1: 'rsvalue' }, shared ]
  target = [ 'tvalue', 'tvalue2', { rkey1: 'rtvalue' }, shared ]
})

.on('cycle', logResult)

.run()


function logResult (res) {
  console.log(res.target.toString())
}
