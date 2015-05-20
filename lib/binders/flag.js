module.exports = function (el, value) {
  if (value) {
    el.setAttribute(this.args[0], '')
  } else {
    el.removeAttribute(this.args[0])
  }
}
