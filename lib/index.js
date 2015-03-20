var Watchy    = require('./Watchy')
var Elastomer = require('./Elastomer')
var MapWay    = require('./MapWay')

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
      'isAttached',
      'getScope',
      'setScope',
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

    // standard init methods
    if(init.preLink) proto.preLink = init.preLink;
    if(init.link)    proto.link    = init.link;
    if(init.unlink)  proto.unlink  = init.unlink;

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


elastomer.Elastomer = Elastomer;
elastomer.Watchy    = Watchy;
elastomer.MapWay    = MapWay;
