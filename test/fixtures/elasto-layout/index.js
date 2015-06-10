var elastomer = require('../../..')

require('../elasto-foo')
require('../elasto-qux')
require('../elasto-button')

module.exports = elastomer('elasto-layout', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {

}
