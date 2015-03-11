module.exports = function(el, value) {
  if(value) {
    el.style.setProperty('background-image', 'url(' + value + ')')
  } else {
    el.style.setProperty('background-image', null)
  }
}
