var camel = require('../utils').miniCamelCase
module.exports = function (el, value) {
  var targetAttribute = this.args[0]
  var targetProperty = camel(this.args[0])
  if (value) {
    el.setAttribute(targetAttribute, '')
  } else {
    el.removeAttribute(targetAttribute)
  }
  el[targetProperty] = Boolean(value)
}
