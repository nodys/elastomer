var watchy = require('./watchy')
var Elastomer = require('./elastomer')
var HTMLElastomer = require('./htmlelastomer')
var ElastoCss = require('./elastocss')
var ElastoDom = require('./elastodom')
var ElastoShadow = require('./elastoshadow')
var MapWay = require('./mapway')
var utils = require('./utils')
var HTMLElement = window.HTMLElement

module.exports = elastomer

function elastomer (name, init) {
  var registeredElement
  init = init || {}
  init.elementName = name

  if (init.prototype) {
    registeredElement = document.registerElement(name, init)
  } else {
    var base = init.extends ? Object.getPrototypeOf(document.createElement(init.extends)) : HTMLElement.prototype
    var proto = Object.create(base)

    // Decorate with polymer handler methods on web component's standard methods
    proto.createdCallback = function () {
      this.elastomer = new Elastomer(this, init)
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

    // Linking method defined in the init object
    // this is only an easy way to define them. But they can be
    // defined on the element prototype returned too
    if (init.created) proto.created = init.created
    if (init.preLink) proto.preLink = init.preLink
    if (init.link) proto.link = init.link
    if (init.unlink) proto.unlink = init.unlink

    // Extend prototype with elastomer public api
    // This can be disabled to prevent exposition of those methods on the
    // element prototype

    // NOTICE : populateProto === false could become the default in v1
    if (init.populateProto !== false) {
      var publicMethods = [
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
      ]

      publicMethods.forEach(function (method) {
        proto[method] = function () {
          return this.elastomer[method].apply(this.elastomer, arguments)
        }
      })
      try {
        registeredElement = document.registerElement(name, {
          prototype: proto,
          extends: init.extends
        })
      } catch (err) {
        console.warn('Unable to register this element %s. Try to export currently registered element (slow).', name, e.message)
        try {
          registeredElement = document.createElement(name).constructor.prototype
        } catch (err) {
          console.error('Unable to export currently registered element %s', name, err)
        }
      }
    }
  }
  registeredElement.localName = name
  return registeredElement
}

elastomer.Elastomer = Elastomer
elastomer.ElastoCss = ElastoCss
elastomer.ElastoDom = ElastoDom
elastomer.ElastoShadow = ElastoShadow
elastomer.HTMLElastomer = HTMLElastomer
elastomer.watchy = watchy
elastomer.MapWay = MapWay
elastomer.utils = utils
