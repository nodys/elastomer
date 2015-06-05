var elastomer = require('../../..')

require('../elasto-foo')
require('../elasto-qux')

module.exports = elastomer('elasto-layout', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {

}
