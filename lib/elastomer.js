var extend = require('extend')
var binder = require('./binder')
var Watchy = require('./watchy')
var MapWay = require('./MapWay')
var debug = require('debug')('elastomer')

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
  this.scope = init.scope || {}

  this._view = null
  this._attached = false
  this._closable = []
  this._unlink = null
  this._attrWatcher = []
  this._injCss = null

}

Elastomer.prototype.createdCallback = function () {
  var host = this.host

  debug('createdCallback', this.host)

  if (host.initialize) {
    host.initialize(this)
  }

  if (!host.shadowRoot) {
    host.createShadowRoot()
  }

  // TODO Move this to bind ?
  if (this.html) {
    if (this.html.onChange) {
      this.html.onChange(this._bindView.bind(this))
    }
  }

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

Elastomer.prototype.setScope = function (scope) {
  this.scope = scope
  return this.scope
}

Elastomer.prototype._bindView = function () {
  var self = this
  var host = self.host
  var shadow = self.host.shadowRoot

  if (!self._attached) return

  if (self._view) {
    self._unbindView()
  }

  self._postPreLink = function () {
    if (!self._attached) return
    if (self.html) {
      if (self.css && (typeof (self.css) !== 'function')) {
        shadow.innerHTML = self.html.toString() + '<style>' + self.css + '</style>'
      } else {
        shadow.innerHTML = self.html.toString()
      }
    }

    if (self.css && (typeof (self.css) === 'function')) {
      self._injCss = self.css(shadow)
    }

    if (host.link) {
      self._unlink = host.link(self.getScope(), self)
    }

    if (self._unlink !== false) {
      self._view = self.binder(shadow, self.getScope(), {
        formatters: self.formatters,
        binders: self.binders,
        prefix: self.prefix
      })
    }
  }

  this.preLink(self.scope, self, function () {
    if (self._postPreLink) {
      self._postPreLink()
      self._postPreLink = null
    }
  })

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

  if (this._injCss) {
    this._injCss.remove()
    this._injCss = null
  }

  this.closeAll()

  if (host.unlink) {
    host.unlink(this.getScope(), this)
  }

  if (this._unlink) {
    if (typeof (this._unlink) === 'function') {
      this._unlink(this.getScope())
    }
    this._unlink = null
  }
  host.shadowRoot.innerHTML = ''
  this._view = null
}

Elastomer.prototype.watch = function (obj, path, callback, noInit) {
  if (typeof (obj) === 'string') {
    noInit = callback
    callback = path
    path = obj
    obj = this.getScope()
  }
  var observer = Watchy.createObserver(obj, path, callback)
  if (noInit !== true) {
    callback(observer.value_)
  }
  return this.addClosable(observer)
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

  if (typeof (formatter) === 'string') {
    formatter = {path: formatter }
  }

  formatter = extend({
    path: attribute,
    read: function (value) { return value },
    publish: function (value) { return value },
    change: null,
    way: MapWay.BOTH
  }, formatter || {})

  formatter.way = MapWay(formatter.way)

  var scopeWatcher = self.watch(self.getScope(), formatter.path, function (value, previous) {
    if (formatter.way & MapWay.UP) {
      attrWatcher.setValue(formatter.publish(value))
    }
  }, true)

  var attrWatcher = self.watchAttribute(attribute, function (value, previous) {
    if (value === undefined || value === null) return
    if (formatter.way & MapWay.DOWN) {
      scopeWatcher.setValue(formatter.read(value))
    }
    if (callback) callback(attribute, value, previous, formatter)
    if (formatter.change) formatter.change(value, previous)
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

Elastomer.prototype.watchProperty = function (property, callback, noInit) {
  var host = this.host
  var observer = Watchy.createObserver(host, property, callback)
  if (noInit !== true) {
    callback(observer.value_)
  }
  return this.addClosable(observer)
}

Elastomer.prototype.mapProperty = function (property, formatter, callback) {
  var self = this
  var scopeWatcher, propertyWatcher

  if (typeof (formatter) === 'string') {
    formatter = {path: formatter }
  }

  formatter = extend({
    path: property,
    read: function (value) { return value },
    publish: function (value) { return value },
    change: null,
    way: MapWay.BOTH
  }, formatter || {})

  formatter.way = MapWay(formatter.way)

  scopeWatcher = self.watch(self.getScope(), formatter.path, function (value, previous) {
    if (formatter.way & MapWay.UP) {
      propertyWatcher.setValue(formatter.publish(value))
    }
  }, true)

  propertyWatcher = self.watchProperty(property, function (value, previous) {
    if (value === undefined || value === null) return
    if (formatter.way & MapWay.DOWN) {
      scopeWatcher.setValue(formatter.read(value))
    }
    if (callback) callback(property, value, previous, formatter)
    if (formatter.change) formatter.change(value, previous)
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
  // If obj is an HTMLElement
  if (obj.dispatchEvent) {
    return obj.dispatchEvent(new CustomEvent(eventName, {detail: data}))
  } else {
    return obj.emit(eventName, data)
  }
}

Elastomer.prototype.on = function (obj, eventName, handler) {
  if (typeof (obj) === 'string') {
    eventName = obj
    handler = eventName
    obj = this.host
  }

  var res

  if (obj.addEventListener) {
    res = obj.addEventListener(eventName, handler)
  } else {
    res = obj.on(eventName, handler)
  }

  this.addClosable({
    close: function () {
      if (obj.addEventListener) {
        return obj.removeEventListener(eventName, handler)
      } else {
        return obj.off(eventName, handler)
      }
    }
  })

  return res
}

Elastomer.prototype.off = function (obj, eventName, handler) {
  if (typeof (obj) === 'string') {
    eventName = obj
    handler = eventName
    obj = this.host
  }

  if (obj.addEventListener) {
    return obj.removeEventListener(eventName, handler)
  } else {
    return obj.off(eventName, handler)
  }
}

Elastomer.prototype.closeAll = function () {
  this._closable.forEach(function (o) { o.close() })
  this._closable = []
}
