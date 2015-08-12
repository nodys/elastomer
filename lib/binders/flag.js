module.exports = function (el, value) {
  var targetProp = this.args[0]
  if (value) {
    el.setAttribute(targetProp, '')
  } else {
    el.removeAttribute(targetProp)
  }
}
