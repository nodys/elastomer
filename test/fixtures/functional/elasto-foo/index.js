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
  scope.list = ['foo', 'bar']
  elasto.mapAttribute('val')
  elasto.setTimeout(function () {
    scope.hello = 'Foob'
  }, 1000)

  // window.scope = scope

  var _foo
  Object.defineProperty(scope, 'foo', {
    set: function (value) {
      _foo = value
    },
    get: function () {
      return _foo
    },
    configurable: true
  })

  var inc = 1

  elasto.watch('app.ctx.path', function (v) {
    // console.log('Change on path A', v)
  })

  // elasto.watch('app.ctx.path', function (v) {
  //   console.log('Change on path B', v)
  // })
  //
  // elasto.watch('app.ctx', function () {
  //   console.log('Change on path C', arguments)
  // })
  //
  // elasto.watch('app.ctx', function () {
  //   console.log('Change on path D', arguments)
  // })
  elasto.watch('list', function (val, old, splice) {
    // console.log('Change on list', val, splice)
  })

  elasto.setInterval(function () {
    scope.size = inc + parseInt(scope.size, 10)
    if (scope.size > 100 || scope.size < 0) {
      inc = -inc
    }
  }, 50)

  elasto.setInterval(function () {
    scope.list.set(0, '_' + Math.round(Math.random() * 1000000000))
    scope.list.set(1, '_' + Math.round(Math.random() * 1000000000))
    if(Math.random() > .5) {
      // scope.list[2] = '_' + Math.round(Math.random() * 1000000000)
      scope.list.set(2, '_' + Math.round(Math.random() * 1000000000))
    } else if(scope.list[2]) {
      // scope.list.pop()
    }
    // scope.list.change()
    scope.list.splice(3,1, 'FOO_'  + Math.round(Math.random() * 1000000000))
    scope.list = scope.list

    // elasto.update()
  }, 500)

  setInterval(function () {
    scope.app.ctx = createContext()
  }, 1000)
}

function createContext() {
  return  {
    path: '/' + Math.round(Math.random() * 1000000000)
  }
}
