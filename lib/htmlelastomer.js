var Elastomer = require('./elastomer')
var HTMLElement = window.HTMLElement

module.exports = HTMLElastomer

function HTMLElastomer () {}

var proto = HTMLElastomer.prototype = Object.create(HTMLElement.prototype)

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
