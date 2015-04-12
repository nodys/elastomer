module.exports = function(el, value) {
  if(!el.classList) {
    console.warn('"toggle-class" for rivet require element.classList');
    return;
  }

  var className = this.args[0];

  if(!value) {
    el.classList.remove(className)
  } else if(!el.classList.contains(className)) {
    el.classList.add(className)
  }


}
