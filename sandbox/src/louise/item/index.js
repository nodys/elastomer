
var elastomer = require('nova-elastomer')
var totemize = require('totemize')

module.exports = elastomer('x-item', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  elasto.mapProperty('item')
}
