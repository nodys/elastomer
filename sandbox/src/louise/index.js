
var elastomer = require('nova-elastomer')
var totemize = require('totemize')

require('./item')

module.exports = elastomer('x-louise', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  // scope.item = {id: 'foo'}
  scope.list = []

  this.updateList = function (count) {
    console.time('updateList')
    scope.list = []
    count = count === undefined ? 1 : count
    for (var i = 0; i < count; i++) {
      scope.list.push({
        id: totemize({
          separator: '-'
        })
      })
    }
    console.timeEnd('updateList')
  }

  this.updateList(10)

  var self = this
  this.test = function () {
    elasto.setTimeout(function() {
      self.updateList(100)
      elasto.setTimeout(function() {
        self.updateList(1)
      }, 1000)
    }, 1000)
  }

  this.watchyStat = function() {
    console.log(elastomer.watchy.WatchyObserver._count)
  }


  scope.handleReload = function (ev) {
    console.log('Reload', ev)
  }
}
