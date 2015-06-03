var elastomer = require('../../..')

module.exports = elastomer('elasto-cssyhtmly', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  scope.hello = 'Hello'
  setTimeout(function () {
    scope.hello = 'Foob'
    elasto.update()
  }, 1000)
}
