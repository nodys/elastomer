var elastomer = require('../../../..')

require('../elasto-bindtest')

module.exports = elastomer('elasto-foo', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  scope.size = 0
  scope.val = 'Foobar'
  scope.app = {}
  scope.app.ctx = createContext()
  elasto.mapAttribute('val')
  elasto.setTimeout(function () {
    scope.hello = 'Foob'
    elasto.update()
  }, 1000)

  var inc = 1

  elasto.setInterval(function () {
    scope.size = inc + parseInt(scope.size, 10)
    if (scope.size > 100 || scope.size < 0) {
      inc = -inc
    }
    elasto.update()
  }, 50)

  setInterval(function () {
    scope.app.ctx = createContext()
  }, 1000)
}

function createContext() {
  return  {
      path: '/' + Math.round(Math.random() * 1000000000)
  }
}
