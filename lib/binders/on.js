var Rivets = require('rivets')._

module.exports = {
  'function': true,
  priority: 1000,
  unbind: function (el) {
    if (this.handler) {
      return Rivets.Util.unbindEvent(el, this.args[0], this.handler)
    }
  },
  routine: function (el, value) {
    if (this.handler) {
      Rivets.Util.unbindEvent(el, this.args[0], this.handler)
    }
    function wrapper () {
      var result = value.apply(this, arguments)
      if (window.Plateform && window.Platform.performMicrotaskCheckpoint) {
        window.Platform.performMicrotaskCheckpoint()
      }
      return result
    }
    return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(wrapper))
  }
}
