module.exports = {
  bind: function (el) {
    var observer = this.observer
    this.listener = function () {
      observer.setValue(!observer.value())
    }
    el.addEventListener('click', this.listener)
  },
  unbind: function (el) {
    el.removeEventListener('click', this.listener)
  },
  routine: function () {}
}
