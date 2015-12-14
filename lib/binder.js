// var rivets = require('rivets/dist/rivets.bundled.js')
// var rivets = require('rivets')
var rivets = require('./rivets/export.js')
var extend = require('extend')
var binders = require('./binders')
var formatters = require('./formatters')
module.exports = binder

// Common binder
function binder (base, scope, options) {
  options = options || {}
  return rivets.bind(base, scope, {
    adapters: extend({'.': binder.adapter}, options.adapters || {}),
    templateDelimiters: ['{{', '}}'],
    formatters: extend({}, formatters, options.formatters || {}),
    prefix: 'nv',
    binders: extend({}, binders, options.binders || {})
  })
}

binder.adapter = require('./watchy')
