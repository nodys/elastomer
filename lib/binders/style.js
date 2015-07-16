module.exports = function (el, value) {
  try {
    el.style.setProperty(this.args[0], value)
  } catch(_) { }
}
