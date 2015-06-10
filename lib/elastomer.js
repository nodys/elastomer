var extend = require('extend')
var binder = require('./binder')
var Watchy = require('./watchy')
var MapWay = require('./MapWay')
var elastoCss = require('./elastocss')
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
  this.elementName = init.elementName
  this.lightDom = []
  this.useNative = init.native === true

  this._elastoCss = null
  this._view = null
  this._attached = false
  this._closable = []
  this._unlink = null
  this._attrWatcher = []
  this._injCss = null

}

Elastomer.prototype.createShadowRoot = function () {
  if (this.root) {
    return this.root
  }

  if (this.useNative) {
    this.host.createShadowRoot()
    this.root = this.host.shadowRoot
  } else {
    this.lightDom = Array.prototype.slice.call(this.host.childNodes)
    this.root = this.host
  }
}

Elastomer.prototype.createdCallback = function () {
  var host = this.host
  debug('createdCallback', this.host)

  if (host.initialize) {
    host.initialize(this)
  }

  this.elementName = this.elementName || this.host.tagName.toLowerCase()

  // Inject css
  if (this.css) {
    if (!this.useNative) {
      this._elastoCss = elastoCss(this.elementName, this.css)
    }
    if (this.css.onChange) {
      this.css.onChange(this._bindView.bind(this))
    }
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

/**
 * Perform object object update (Platform.performMicrotaskCheckpoint)
 *
 * Only required for platform that does not support
 * Object.observe natively
 */
Elastomer.prototype.update = function () {
  if (window.Platform && window.Platform.performMicrotaskCheckpoint) {
    window.Platform.performMicrotaskCheckpoint()
  }
}

Elastomer.prototype._bindView = function () {
  var self = this
  var host = this.host

  if (!this._attached) return

  if (this._view) {
    this._unbindView()
  }

  this._postPreLink = (function () {
    if (!this._attached) {
      return
    }

    if (this.html) {
      if (this.useNative) {
        this._injectHtmlNative()
      } else {
        this._injectHtml()
      }
    }
  }).bind(this)

  this.preLink(this.scope, this, (function () {
    this.update()
    if (this._postPreLink) {
      this._postPreLink()
      this._postPreLink = null
      this.update()
    }
  }).bind(this))
}

Elastomer.prototype._injectHtmlNative = function () {
  this.createShadowRoot()
  var shadow = this.root
  shadow.innerHTML = this.html.toString()
  this._bind()
  this.css(shadow)
}

Elastomer.prototype._bind = function () {
  var shadow = this.root
  if (this.host.link) {
    this._unlink = this.host.link(this.getScope(), this)
  }

  if (this._unlink !== false) {
    this._view = this.binder(shadow, this.getScope(), {
      formatters: this.formatters,
      binders: this.binders,
      prefix: this.prefix
    })
  }
  this.emit('linked')
}

Elastomer.prototype._injectHtml = function () {
  var template = document.createElement('template')
  template.innerHTML = this.html.toString()

  this.createShadowRoot()
  var lightDom = this.lightDom

  if (this._needRestoreLightDom) {
    this.host.textContent = ''
    Array.prototype.slice.call(this.lightDom).forEach(function (el) {
      this.host.appendChild(el)
    }, this)
  }

  this._needRestoreLightDom = true

  var contents = template.content.querySelectorAll('content')
  var elements = Array.prototype.slice.call(lightDom)

  var selectedElements = {}

  for (var i = 0, len = contents.length, content, select; i < len && (content = contents[i]); i++) {
    select = content.getAttribute('select')
    content.setAttribute(this.prefix + '-ignore', '')
    if (select) {
      selectedElements[select] = []
      var find = this.host.querySelectorAll(select)
      for (var f = 0, flen = find.length, lightEl; f < flen && (lightEl = find[f]); f++) {
        selectedElements[select].push(elements.splice(elements.indexOf(lightEl), 1)[0])
      }
    }
  }

  this.host.textContent = ''
  this.host.innerHTML = template.innerHTML


  var restContent, elastoContent
  contents = this.host.querySelectorAll('content')
  for (var j = 0, clen = contents.length, content, select; j < clen && (content = contents[j]); j++) {
    select = content.getAttribute('select')
    content.setAttribute(this.prefix + '-ignore', '')
    if (select && selectedElements[select]) {
      for (var e = 0, elen = selectedElements[select].length, el; e < elen && (el = selectedElements[select][e]); e++) {
        content.appendChild(el)
      }
    } else {
      restContent = content
    }
  }

  if (restContent) {
    for (var e = 0, elen = elements.length, el; e < elen && (el = elements[e]); e++) {
      restContent.appendChild(el)
    }
  }

    this._bind()

  // Update stylesheet
  if (this._elastoCss) {
    this._elastoCss.rawRules.forEach(function (rule) {
      // Localise -remove :host(...)
      rule = rule.replace(/:host(\([^\)]+\))?\s*/g, '') // :host(...) too

      // Remove some pseudo-class
      rule = rule.replace(/:(link|visited|hover|active)$/,'')

      // Remove native shadow dom rules
      rule = rule.replace(/(\/deep\/|::shadow)/g, ' ')
      rule = rule.replace(/::content/g, 'content')

      if (rule === '') {
        return
      }
      var elMatch = Array.prototype.slice.call(this.host.querySelectorAll(rule))
      elMatch.forEach(function (el) {
        if (!el.classList.contains('elastomer-css-scope')) {
          // Todo: alternative for browser without support of classList
          el.classList.add('elastomer-css-scope')
          el.classList.add(this.elementName + '-scope')
        }
      }, this)
    }, this)

  }

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
  this.root.textContent = ''
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

Elastomer.prototype.setTimeout = function () {
  var self = this
  var args = Array.prototype.slice.call(arguments)
  var func = args[0]
  args[0] = function () {
    func.apply(null, arguments)
    self.update()
  }
  var t = setTimeout.apply(null, args)
  this.addClosable({
    close: function () {
      clearTimeout(t)
    }
  })
}

Elastomer.prototype.setInterval = function () {
  var self = this
  var args = Array.prototype.slice.call(arguments)
  var func = args[0]
  args[0] = function () {
    func.apply(null, arguments)
    self.update()
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
