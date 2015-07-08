
function getRoot (el) {
  var root = el
  while (root.parentNode && (root.localName !== 'elasto-shadow')) { root = root.parentNode }
  return root
}

exports.select = {
  bind: function (el) { this.targetProp = this.args[0] },
  unbind: function (el) { this.targetProp = null },
  routine: function (el, selector) {
    el[this.targetProp] = getRoot(el).querySelector(selector || this.keypath)
  }
}

exports.selectall = {
  bind: function (el) { this.targetProp = this.args[0] },
  unbind: function (el) { this.targetProp = null },
  routine: function (el, selector) {
    el[this.targetProp] = getRoot(el).querySelectorAll(selector || this.keypath)
  }
}

exports.gselect = {
  bind: function (el) { this.targetProp = this.args[0] },
  unbind: function (el) { this.targetProp = null },
  routine: function (el, selector) {
    el[this.targetProp] = document.body.querySelector(selector || this.keypath)
  }
}

exports.gselectall = {
  bind: function (el) { this.targetProp = this.args[0] },
  unbind: function (el) { this.targetProp = null },
  routine: function (el, selector) {
    el[this.targetProp] = document.body.querySelectorAll(selector || this.keypath)
  }
}
