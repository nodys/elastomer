var extend     = require('extend');
var binder     = require('./binder');
var Watchy     = require('./watchy')
var Proto      = require('./Proto')
var debug      = require('debug')('elastomer')

module.exports = elastomer;


function elastomer(name, init) {
  if(!init) {
    return document.registerElement(name, {
      prototype: extend(Object.create(HTMLElement.prototype), Proto)
    })
  } else if(init.prototype) {
    return document.registerElement(name, init);
  } else {
    baseProto = init.extends ? Object.getPrototypeOf(document.createElement(init.extends)) : HTMLElement.prototype;
    return document.registerElement(name, {
      prototype: extend(Object.create(baseProto), Proto, init),
      extends:   init.extends
    })
  }
}
