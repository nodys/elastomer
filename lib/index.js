var extend    = require('extend');
var binder    = require('./binder');
var Watchy    = require('./watchy')
var Elastomer = require('./Elastomer')
var debug     = require('debug')('elastomer')

module.exports = elastomer;


function elastomer(name, init) {
  init = init || {};

  if(init.prototype) {
    return document.registerElement(name, init);
  } else {
    var base  = init.extends ? Object.getPrototypeOf(document.createElement(init.extends)) : HTMLElement.prototype;
    var proto = Object.create(base)

    // Decorate
    proto.createdCallback = function() {
      this.elastomer = new Elastomer(this, init)
      this.elastomer.createdCallback();
    }

    // Extend prototype with elastomer public api
    var methods = [
      'attributeChangedCallback',
      'attachedCallback',
      'detachedCallback',
      'getScope',
      'watch',
      'watchAttribute',
      'mapAttribute',
      'mapAttributes',
      'watchProperty',
      'mapProperty',
      'mapProperties',
      'addClosable',
      'removeClosable',
      'closeAll'
    ];

    methods.forEach(function(method) {
      proto[method] = function() {
        return this.elastomer[method].apply(this.elastomer, arguments)
      }
    })

    return document.registerElement(name, {
      prototype : proto,
      extends   : init.extends
    })

  }
}
