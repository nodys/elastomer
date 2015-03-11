exports.notempty = function(value) {
  return !exports.empty(value)
}

exports.empty = function(value) {
  if(!value) return true;
  return value.length == 0;
}
