// var PathObserver = require('observe-js').PathObserver
var watchy = require('../watchy')
var debug = require('debug')('nova-component:bind-property')

module.exports = {
  bind: function (el) {
    this.targetProp = this.args[0]
    var self = this
    this.pobs = watchy.observe(el, this.targetProp, function (newValue) {
      self.observer.setValue(newValue)
    })
  },

  unbind: function (el) {
    this.targetProp = null
    this.pobs.close()
    this.pobs = null
  },

  routine: function (el, value) {
    if (value !== el[this.targetProp]) {
      el[this.targetProp] = value
    }
  }

}
