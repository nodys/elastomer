const rivets = require('./rivets')
const extend = require('extend')
const binders = require('./binders')
const formatters = require('./formatters')

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
