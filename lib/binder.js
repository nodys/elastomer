var rivets = require('rivets')
var extend = require('extend')
var binders = require('./binders')
var formatters = require('./formatters')

module.exports = binder

// Common binder
function binder (base, scope, options) {
  options = options || {}
  return rivets.bind(base, scope, {
    adapters: extend({'.': binder.adapter }, options.adapters || {}),
    templateDelimiters: ['{{', '}}'],
    formatters: extend({}, formatters, options.formatters || {}),
    prefix: 'nv',
    binders: extend({}, binders, options.binders || {})
  })
}

// observe-js adapter for rivets
binder.adapter = require('./watchy')()
