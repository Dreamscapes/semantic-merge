/**
 * semantic-merge
 *
 * @author     Robert Rossmann <rr.rossmann@me.com>
 * @copyright  2015 Robert Rossmann
 * @license    http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License
 */

'use strict'

const Benchmark = require('benchmark')
const merge = require('../lib/merger')

let source
let target

/*
 * Merging two objects
 */
new Benchmark.Suite()

.add('Object shallow merge', () => {
  merge(source).and(target).into({})
})

.add('Object deep merge', () => {
  merge(source).and(target).recursively.into({})
})

.on('start cycle', () => {
  source = { key: 'svalue', key2: 'svalue2', key3: { rkey1: 'rsvalue', rkey2: 'rsvalue2' } }
  target = { key: 'tvalue', key2: 'tvalue2', key3: { rkey1: 'rtvalue', rkey2: 'rtvalue2' } }
})

.on('cycle', logResult)

.run()

/*
 * Merging two arrays
 */
new Benchmark.Suite()

.add('Array shallow merge', () => {
  merge(source).and(target).into([])
})
.on('start cycle', () => {
  const shared = {}

  source = ['svalue', 'svalue2', { rkey1: 'rsvalue' }, shared]
  target = ['tvalue', 'tvalue2', { rkey1: 'rtvalue' }, shared]
})
.on('cycle', logResult)
.run()


/**
 * Log the benchmark result to console
 *
 * @private
 * @param     {Object}    res    Result data
 * @return    {void}
 */
function logResult(res) {
  // eslint-disable-next-line no-console
  console.log(res.target.toString())
}
