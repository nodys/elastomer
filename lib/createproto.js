var Elastomer = require('./elastomer')

module.exports = function (BaseConstructor) {
  var HTMLElastomerBase = function () {}

  var proto = HTMLElastomerBase.prototype = Object.create(BaseConstructor.prototype)

  proto.createdCallback = function () {
    this.elastomer = new Elastomer(this)
    this.elastomer.createdCallback()
  }

  proto.attributeChangedCallback = function () {
    this.elastomer.attributeChangedCallback.apply(this.elastomer, arguments)
  }

  proto.attachedCallback = function () {
    this.elastomer.attachedCallback.apply(this.elastomer, arguments)
  }

  proto.detachedCallback = function () {
    this.elastomer.detachedCallback.apply(this.elastomer, arguments)
  }

  return HTMLElastomerBase
}
