module.exports = {
  bind: function(el) {
    var observer = this.observer;
    this.listener = function () {
      observer.setValue(!observer.value())
    }
    el.addEventListener('tap', this.listener)
  },
  unbind: function(el) {
    el.removeEventListener('tap', this.listener)
  },
  routine: function() {}
}
