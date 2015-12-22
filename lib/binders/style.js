var utils = require('../utils')
module.exports = function (el, value) {
  var property = this.args[0]
  utils.requestAnimationFrame(function () {
    el.style.setProperty(property, value)
  })
}
