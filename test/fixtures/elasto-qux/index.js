var elastomer = require('../../..')

module.exports = elastomer('elasto-qux', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  scope.hello = 'Hello'
  elasto.mapAttribute('val')
  setTimeout(function () {
    scope.hello = 'Qux'
    elasto.update()
  }, 1000)
}
