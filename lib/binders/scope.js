
var debug        = require('debug')('hub-component:scope')
module.exports = {
  bind: function(el) {
    debug('bind')
    // this.targetKey = this.args[0];
    if(!el.scope) el.scope = {}
  },

  unbind: function(el) {
    debug('unbind')
    // this.targetKey = null;
  },

  routine: function(el, value) {
    debug('routine')
    el.scope = value;
  }
}
