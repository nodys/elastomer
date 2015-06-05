var elastomer = require('../../..')

module.exports = elastomer('elasto-foo', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  scope.size = 100
  scope.hello = 'Hello'
  elasto.mapAttribute('val')
  setTimeout(function () {
    scope.hello = 'Foob'
    elasto.update()
  }, 1000)
}
