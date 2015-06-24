var sprintf = require('sprintf-js').sprintf

exports.notempty = function (value) {
  return !exports.empty(value)
}

exports.empty = function (value) {
  if (!value) return true
  return value.length === 0
}

exports.not = function (value) {
  return !value
}

exports.and = function (value, andValue) {
  return value && andValue
}

exports.or = function (value, orValue) {
  return value && orValue
}

exports.xor = function (value, xorValue) {
  return (value && !xorValue) || (!value && xorValue)
}

exports.eq = function (value, equalTo) {
  return value === equalTo
}

exports.concat = function (value) {
  if (value === undefined) { return }
  return Array.prototype.slice.call(arguments).join('')
}

exports.multiply = function (value, multiply) {
  if (value === undefined) { return }
  return parseFloat(value, 10) * parseFloat(multiply, 10)
}

exports.add = function (value, add) {
  if (value === undefined) { return }
  return parseFloat(value, 10) + parseFloat(add, 10)
}

exports.divide = function (value, add) {
  if (value === undefined) { return }
  return parseFloat(value, 10) + parseFloat(add, 10)
}

exports.sprintf = function (value, format) {
  if (value === undefined) { return }
  if (!format) { return value }
  var args = Array.prototype.slice.call(arguments)
  args[0] = format
  args[1] = value
  return sprintf.apply(null, args)
}
