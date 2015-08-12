var elastomer = require('../../../..')

module.exports = elastomer('elasto-qux', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  scope.val = 'Qux'
  elasto.mapAttribute('val')
  scope.size = 42

  elasto.mapProperty('foo-bar', function (val) {
    console.log('foo-bar change', val)
  })

  elasto.mapProperty('fooBar', function (val) {
    console.log('fooBar change', val)
  })

  elasto.setTimeout(function () {
    scope.val = 'QuxUpdated'
  }, 1000)

  var inc = 1

  elasto.setInterval(function () {
    scope.size = inc + parseInt(scope.size, 10)
    if(scope.size > 100 || scope.size < 0) {
      inc = -inc
    }
  }, 50)

}
