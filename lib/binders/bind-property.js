var PathObserver = require('observe-js').PathObserver
var debug = require('debug')('nova-component:bind-property')

module.exports = {
  bind: function (el) {
    debug('bind (targetProp:%s)', this.args[0], el)

    this.targetProp = this.args[0]
    this.pobs = new PathObserver(el, this.targetProp)

    this.pobs.open(function (newValue, oldValue) {
      this.observer.setValue(newValue)
    }.bind(this))

  },

  unbind: function (el) {
    debug('unbind', el)
    this.targetProp = null
    this.pobs.close()
    this.pobs = null
  },

  routine: function (el, value) {
    if (value !== el[this.targetProp]) {
      debug('routine %s set:%s current:%s', this.targetProp, value, el[this.targetProp])
      el[this.targetProp] = value
    }
  }

}
