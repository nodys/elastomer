module.exports = function(el, value) {
  if(!el.classList) {
    console.warn('nova-component binder "addclass" for rivet require element.classList');
    return;
  }
  if(!value) {
    return;
  }

  if('string' === typeof(value)) {
    value = [value]
  }

  value.forEach(function(c) {
    if(el.classList.contains(c)) {
      el.classList.remove(c);
    } else {
      el.classList.add(c);
    }
  })


}
