var binder = require('./binder')
var extend = require('extend')
var watchy = require('./watchy')
var MapWay = require('./MapWay')
var debug = require('debug')('elastomer')
var elastoshadow = require('./elastoshadow.js')
var elastodom = require('./elastodom')
var utils = require('./utils')
var evenity = require('evenity')

var CustomEvent = window.CustomEvent

module.exports = Elastomer

function Elastomer (host, init) {
  init = init || {}

  this.host = host

  this.binder = init.binder || binder
  this.prefix = init.prefix || 'nv'
  this.adapters = init.adapters || { }
  this.formatters = init.formatters || { }
  this.binders = init.binders || { }
  this.html = init.html || null
  this.css = init.css || null
  this.scope = init.scope || { }
  this.mappingKey = null
  this.elementName = init.elementName
  this.utils = utils

  this.useNative = Elastomer.config.native

  if (typeof (init.native) === 'boolean') {
    this.useNative = init.native
  }

  if (typeof (Elastomer.config.forceNative) === 'boolean') {
    this.useNative = Elastomer.config.forceNative
  }

  this._view = null
  this._attached = false
  this._closable = []
  this._unlink = null
  this._linked = false
  this._attrWatcher = []
  this._styleAndLayoutAttached = false

}

Elastomer.config = {
  native: false,
  forceNative: null
}

Elastomer.prototype.createdCallback = function () {
  var host = this.host
  debug('createdCallback', this.host)

  if (host.initialize) {
    host.initialize(this)
  }

  this.elementName = this.elementName || this.host.tagName.toLowerCase()

  if (host.created) {
    host.created(this.scope, this)
  }

}

Elastomer.prototype.attributeChangedCallback = function (attribute, oldVal, newVal) {
  debug('attributeChangedCallback', this.host, attribute, oldVal, newVal)
  this._attrWatcher.forEach(function (w) {
    if (w.attribute === attribute) {
      w.callback(newVal, oldVal, attribute)
    }
  })
}

Elastomer.prototype.attachedCallback = function () {
  debug('attachedCallback', this.host)
  this._attached = true
  this._bindView()
}

Elastomer.prototype.detachedCallback = function () {
  debug('attachedCallback', this.host)
  this._unbindView()
  this._attached = false
}

Elastomer.prototype.isAttached = function () {
  return this._attached
}

Elastomer.prototype.getScope = function () {
  return this.scope
}

/**
 * Shortcut for setMappingModel('model', {})
 * @param {object} [model]      The model object (default {})
 * @returns {object} The model
 */
Elastomer.prototype.useModel = function (model) {
  return this.setMappingModel('model', model)
}

/**
 * Define the mapping model on scope
 *
 * Caution: the model instance should be change after linking
 *
 * The mapping model is the model that will receive the mapping (#map*()) in place
 * of the root scope (usefull to isolate the model from the view model and
 * resolve binding scope errors - see nv-if)
 *
 * @param {string} [mappingKey] The key on the scope (default to 'model')
 * @param {object} [model]      The model object (default to current model, else new object)
 * @returns {object} The model
 */
Elastomer.prototype.setMappingModel = function (mappingKey, model) {
  var self = this
  var currentKey = this.mappingKey ? this.mappingKey : null
  var currentModel = currentKey ? this.scope[this.mappingKey] : null

  function warn () {
    if (self._linked) {
      console.warn('Mapping model should remain immutable while element is attached to the dom to prevent unexpected binding behaviors')
    }
  }
  if (currentModel !== model) {
    warn()
  }

  this.mappingKey = mappingKey || currentKey || 'model'
  model = model || currentModel || Object.create({})
  if (currentKey !== this.mappingKey || currentModel !== model) {
    this.scope[this.mappingKey] = model
    if (this._mappingModelObserver) {
      this._mappingModelObserver.close()
    }
    this._mappingModelObserver = this.addClosable(watchy.observe(this.scope, this.mappingKey, warn))
  }
  return model
}

Elastomer.prototype.getModel = function () {
  if (this.mappingKey) {
    return this.scope[this.mappingKey]
  } else {
    return this.scope
  }
}

Elastomer.prototype.setScope = function (scope) {
  this.scope = scope
  return this.scope
}

Elastomer.prototype.update = function () {
  console.warn('Elastomer#update() is a noop')
}

Elastomer.prototype._attachLayoutAndStyleOnce = function () {
  if (this._styleAndLayoutAttached) {
    return
  }
  this._styleAndLayoutAttached = true

  if (this.css) {
    if (this.css.onChange) {
      this.css.onChange(this._bindView.bind(this))
    }
  }

  if (this.html) {
    if (this.html.onChange) {
      this.html.onChange(this._bindView.bind(this))
    }
  }
}

Elastomer.prototype._bindView = function () {
  if (!this._attached) return

  if (this._view) {
    this._unbindView()
  }

  this._attachLayoutAndStyleOnce()

  this._postPreLink = function () {
    if (!this._attached) {
      return
    }
    this._injectHtml()
  }.bind(this)

  this.preLink(this.scope, this, function () {
    if (this._postPreLink) {
      this._postPreLink()
      this._postPreLink = null
    }
  }.bind(this))
}

Elastomer.prototype.createShadowRoot = function () {
  if (this.shadowRoot) {
    return this.shadowRoot
  }

  if (this.useNative) {
    try {
      this.host.createShadowRoot()
      this.shadowRoot = this.host.shadowRoot || this.host
    } catch (e) {
      if (Elastomer.config.forceNative) {
        console.error('No native support for shadow dom')
      } else {
        console.warn('Can not use native shadow as requested: disgrade to elastoshadow')
        this.useNative = false
      }
      this.shadowRoot = this.host
    }
  } else {
    this.shadowRoot = elastoshadow(this)
  }
}

Elastomer.prototype._injectHtml = function () {
  this.createShadowRoot()

  if (!this.html) {
    this._bind(this.host)
    return
  }

  if (this.useNative) {
    this.shadowRoot.innerHTML = this.html.toString()
    // this.css(this.shadowRoot)
    this._bind(this.shadowRoot)
    if (this.css) {
      if (typeof this.css === 'function') {
        this.css(this.shadowRoot)
      } else {
        var style = document.createElement('style')
        style.setAttribute('type', 'text/css')
        this.shadowRoot.appendChild(style)
        if (style.styleSheet) {
          style.styleSheet.cssText = this.css.toString()
        } else {
          style.textContent = this.css.toString()
        }
      }
    }
  } else {
    this.shadowRoot.innerHTML = this.html.toString()
    this._bind(this.shadowRoot.shadow)
  }
}

Elastomer.prototype._bind = function (node) {
  var self = this

  self.$ = function (selector) {
    return this.shadowRoot.querySelectorAll(selector)
  }
  utils.toArray(self.$('*[id]'))
  .forEach(function (node) {
    var id = node.getAttribute('id')
    self.$[id] = node
  })

  if (this.host.link) {
    this._unlink = this.host.link(this.getScope(), this, this.getModel())
    this._linked = true
  }

  if ((this._unlink !== false) && this.html) {
    this._view = this.binder(node, this.getScope(), {
      formatters: this.formatters,
      binders: this.binders,
      prefix: this.prefix
    })
  }
  this.emit('linked')
}

Elastomer.prototype.preLink = function (scope, elasto, done) {
  var host = this.host
  if (host.preLink) {
    return host.preLink(scope, elasto, done)
  } else {
    return setTimeout(done)
  }
}

Elastomer.prototype._unbindView = function () {
  var host = this.host

  this._postPreLink = null

  if (this._view) {
    this._view.unbind()
  }

  this.closeAll()

  if (host.unlink) {
    host.unlink(this.getScope(), this, this.getModel())
  }

  if (this._unlink) {
    if (typeof (this._unlink) === 'function') {
      this._unlink(this.getScope(), this, this.getModel())
    }
    this._unlink = null
    this._linked = false
  }

  this._view = null
  this['$'] = function () {}
}

Elastomer.prototype.watch = function (obj, path, callback, noInit) {
  if (typeof (obj) === 'string') {
    noInit = callback
    callback = path
    path = obj
    obj = this.getScope()
  }
  var observer = watchy.observe(obj, path, callback)
  if (noInit !== true) {
    callback(observer.getValue())
  }
  return this.addClosable(observer)
}

Elastomer.prototype.watchModel = function (path, callback, noInit) {
  return this.watch(this.getModel(), path, callback, noInit)
}

Elastomer.prototype.watchAttribute = function (attribute, callback, noInit) {
  var self = this
  var host = this.host
  var observer = {
    attribute: attribute,
    callback: callback,
    setValue: function (value) {
      if (value === undefined || value === null) {
        host.removeAttribute(attribute)
      } else {
        host.setAttribute(attribute, value)
      }
    },
    close: function () {
      observer.callback = null
      self._attrWatcher = self._attrWatcher.filter(function (w) {
        return w !== observer
      })
    }
  }
  self._attrWatcher.push(observer)
  if (noInit !== true) {
    callback(host.getAttribute(attribute), undefined, attribute)
  }
  return self.addClosable(observer)
}

Elastomer.prototype.mapAttribute = function (attribute, formatter, callback) {
  var self = this
  var scopeWatcher, attrWatcher

  if (typeof (formatter) === 'string') {
    formatter = { path: formatter }
  }

  if (typeof (formatter) === 'function') {
    formatter = {change: formatter}
  }

  formatter = extend({
    path: utils.miniCamelCase(attribute),
    read: function (value) { return value },
    publish: function (value) { return value },
    change: null,
    way: MapWay.BOTH
  }, formatter || {})

  formatter.way = MapWay(formatter.way)

  scopeWatcher = self.watch(self.getModel(), formatter.path, function (value, previous) {
    if ((formatter.way & MapWay.UP) && attrWatcher) {
      // attrWatcher must be defined
      attrWatcher.setValue(formatter.publish(value))
    }
    if (callback) {
      callback(attribute, value, previous, formatter)
    }
    if (formatter.change) {
      formatter.change(value, previous)
    }
  }, true)

  attrWatcher = self.watchAttribute(attribute, function (value, previous) {
    if (value === null && previous === null) {
      return
    }
    if (formatter.way & MapWay.DOWN) {
      scopeWatcher.setValue(formatter.read(value))
    }
  })
}

Elastomer.prototype.mapAttributes = function (mapping, callback) {
  var self = this

  if (typeof (mapping) === 'string') {
    mapping = mapping.split(',').map(function (s) { return s.trim() })
  }

  if (mapping.toString() !== '[object Object]') {
    var newMapping = {}
    mapping.forEach(function (k) { newMapping[k] = k })
    mapping = newMapping
  }

  Object.keys(mapping).forEach(function (attribute) {
    self.mapAttribute(attribute, mapping[attribute], callback)
  })
}

Elastomer.prototype.mapFlag = function (flag, formatter, callback) {

  if (typeof (formatter) === 'string') {
    formatter = { path: formatter }
  }

  if (typeof (formatter) === 'function') {
    formatter = {change: formatter}
  }

  formatter = extend({
    read: function (value) {
      return value !== null && value !== 'false' && value !== '0'
    },
    publish: function (value) {
      return value ? '' : null
    }
  }, formatter || {})

  this.mapProperty(flag)
  return this.mapAttribute(flag, formatter, callback)
}

Elastomer.prototype.mapFlags = function (mapping, callback) {
  var self = this

  if (typeof (mapping) === 'string') {
    mapping = mapping.split(',').map(function (s) { return s.trim() })
  }

  if (mapping.toString() !== '[object Object]') {
    var newMapping = {}
    mapping.forEach(function (k) { newMapping[k] = k })
    mapping = newMapping
  }

  Object.keys(mapping).forEach(function (flag) {
    self.mapFlag(flag, mapping[flag], callback)
  })
}

Elastomer.prototype.watchProperty = function (property, callback, noInit) {
  var host = this.host
  var observer = watchy.observe(host, property, callback)
  if (noInit !== true) {
    callback(observer.getValue())
  }
  return this.addClosable(observer)
}

Elastomer.prototype.mapProperty = function (property, formatter, callback) {
  var self = this
  var scopeWatcher, propertyWatcher

  if (typeof (formatter) === 'string') {
    formatter = { path: formatter }
  }

  if (typeof (formatter) === 'function') {
    formatter = {change: formatter}
  }

  formatter = extend({
    path: property,
    read: function (value) { return value },
    publish: function (value) { return value },
    change: null,
    way: MapWay.BOTH
  }, formatter || {})

  formatter.way = MapWay(formatter.way)

  scopeWatcher = self.watch(self.getModel(), formatter.path, function (value, previous) {
    if ((formatter.way & MapWay.UP) && propertyWatcher) {
      // propertyWatcher must be defined
      propertyWatcher.setValue(formatter.publish(value))
    }
    if (callback) {
      // For mapProperties
      callback(property, value, previous, formatter)
    }
    if (formatter.change) {
      formatter.change(value, previous)
    }
  }, true)

  propertyWatcher = self.watchProperty(property, function (value, previous) {
    if ((typeof value === 'undefined') && (typeof previous === 'undefined')) {
      return
    }
    if (formatter.way & MapWay.DOWN) {
      scopeWatcher.setValue(formatter.read(value))
    }
  })
}

Elastomer.prototype.mapProperties = function (mapping, callback) {
  var self = this

  if (typeof (mapping) === 'string') {
    mapping = mapping.split(',').map(function (s) { return s.trim() })
  }

  if (mapping.toString() !== '[object Object]') {
    var newMapping = {}
    mapping.forEach(function (k) { newMapping[k] = k })
    mapping = newMapping
  }

  Object.keys(mapping).forEach(function (property) {
    self.mapProperty(property, mapping[property], callback)
  })
}

Elastomer.prototype.setTimeout = function () {
  var args = Array.prototype.slice.call(arguments)
  var func = args[0]
  args[0] = function () {
    func.apply(null, arguments)
  }
  var t = setTimeout.apply(null, args)
  this.addClosable({
    close: function () {
      clearTimeout(t)
    }
  })
}

Elastomer.prototype.setInterval = function () {
  var args = Array.prototype.slice.call(arguments)
  var func = args[0]
  args[0] = function () {
    func.apply(null, arguments)
  }
  var t = setInterval.apply(null, args)
  this.addClosable({
    close: function () {
      clearInterval(t)
    }
  })
}

Elastomer.prototype.addClosable = function (closable) {
  this._closable.push(closable)
  return closable
}

Elastomer.prototype.removeClosable = function (closable) {
  this._closable = this._closable.filter(function (o) {
    if (o === closable) {
      o.close()
      return false
    }
    return true
  })
}

Elastomer.prototype.emit = function (obj, eventName, data) {
  if (typeof (obj) === 'string') {
    data = eventName
    eventName = obj
    obj = this.host
  }
  return evenity.emit(obj, eventName, data)
}

Elastomer.prototype.on = function (obj, eventName, handler) {
  if (typeof (obj) === 'string') {
    eventName = obj
    handler = eventName
    obj = this.host
  }
  return this.addClosable(evenity.on(obj, eventName, handler))
}

Elastomer.prototype.once = function (obj, eventName, handler) {
  if (typeof (obj) === 'string') {
    eventName = obj
    handler = eventName
    obj = this.host
  }
  return evenity.once(obj, eventName, handler)
}

Elastomer.prototype.off = function (obj, eventName, handler) {
  if (typeof (obj) === 'string') {
    eventName = obj
    handler = eventName
    obj = this.host
  }
  return evenity.off(obj, eventName, handler)
}

Elastomer.prototype.closeAll = function () {
  this._closable.forEach(function (o) { o.close() })
  this._closable = []
}

Elastomer.prototype.dom = function (element) {
  element = element || this.host
  return element._elastomdom || elastodom(element)
}

Elastomer.prototype.querySelector = function (selector) {
  return this.dom().querySelector(selector)
}

Elastomer.prototype.querySelectorAll = function (selector) {
  return this.dom().querySelectorAll(selector)
}
