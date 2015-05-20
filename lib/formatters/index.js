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
