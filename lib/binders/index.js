exports['bind-*'] = require('./bind-property')
exports['addclass'] = require('./addclass')
exports['toggle'] = require('./toggle')
exports['toggle-class-*'] = require('./toggle-class')
exports['style-*'] = require('./style')
exports['flag-*'] = require('./flag')
exports['background-image'] = require('./background-image')
exports['ignore'] = require('./ignore')

exports['select-*'] = require('./queryselector').select
exports['selectall-*'] = require('./queryselector').selectall
exports['gselect-*'] = require('./queryselector').gselect
exports['gselectall-*'] = require('./queryselector').gselectall

exports.register = function (key, binder) {
  if (exports.has(key)) {
    console.warn('Override global elastomer binder "%s"', key)
  }
  exports[key] = binder
  return exports
}

exports.has = function (key) {
  return Boolean(exports[key])
}
