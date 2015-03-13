var extend = require('extend');
var binder = require('./binder');
var Watchy = require('./watchy')
var MapWay = require('./MapWay')
var debug  = require('debug')('elastomer')

var UID          = 0;
var Proto        = module.exports = {};

Proto.binder     = binder;
Proto.prefix     = 'nv'
Proto.adapters   = { }
Proto.formatters = { }
Proto.binders    = { }
Proto.html       = null
Proto.css        = null

Proto.createdCallback = function() {
  debug('createdCallback', this.tagName)


  this.shadow             = this.createShadowRoot(); // TODO Use shadowRoot
  this.base               = this.shadow; // TODO: Deprecated
  this._elastomer = {
    uid               : UID++,
    scope             : {},
    view              : null,
    attached          : false,
    closable          : [],
    unlink            : null,
    attributeWatcher  : [],
    injectedCss       : null,
  }
  this._scope             = {};
  this._view              = null;
  this._attached          = false;
  this._closable          = [];
  this._unlink            = null;
  this._attributeWatcher  = [];
  this._injectedCss       = null;

  // TODO Move this to bind ?
  if(this.html) {
    if(this.html.onChange) {
      this.html.onChange(this._bindView.bind(this));
    }
  }

  if(this.created) this.created.call(this);
}

Proto.attributeChangedCallback = function(attribute, oldVal, newVal) {
  this._attributeWatcher.forEach(function(w) {
    if(w.attribute == attribute) {
      w.callback(newVal, oldVal, attribute)
    }
  })
}

Proto.attachedCallback = function() {
  debug('attachedCallback', this.tagName)
  this._attached  = true;
  this._bindView();

}

Proto.detachedCallback = function() {
  debug('detachedCallback', this.tagName)
  this._unbindView();
  this._attached  = false;
}

Proto.isAttached = function() {
  return this._attached;
}

Proto.getScope = function() {
  return this._scope;
}

Proto._bindView = function() {

  if(this._view) {
    this._unbindView();
  }

  if(!this._attached) return;

  this.preLink(function() {

    if(this.html) {
      if(this.css && ('function' != typeof(this.css))) {
        this.shadow.innerHTML = this.html.toString() + '<style>'+this.css+'</style>';
      } else {
        this.shadow.innerHTML = this.html.toString();
      }
    }

    if(this.css && ('function' == typeof(this.css))) {
      this._injectedCss = this.css(this.shadow);
    }

    if(this.link) {
      this._unlink = this.link.call(this, this.getScope());
    }

    if(this._unlink !== false) {
      this._view = this.binder(this.shadow, this.getScope(), {
        formatters : this.formatters,
        binders    : this.binders,
        prefix     : this.prefix,
      })
    }

  }.bind(this))

}

Proto.preLink = function(done) {
  return setTimeout(done)
}


Proto._unbindView = function() {
  if(this._view) {
    this._view.unbind();
  }

  if(this._injectedCss) {
    this._injectedCss.remove();
    this._injectedCss = null;
  }

  this.closeAll();

  if(this.unlink) {
    this.unlink.call(this, this.getScope());
  }
  if(this._unlink) {
    if('function' == typeof(this._unlink)) {
      this._unlink(this.getScope());
    }
    this._unlink = null;
  }
  this.base.innerHTML = '';
  this._view = null;
}

Proto.watch = function(obj, path, callback, noInit) {
  var args = Array.prototype.slice.call(arguments);
  if('string' === typeof(obj)) {
    noInit   = callback;
    callback = path;
    path     = obj;
    obj      = this.getScope();
  }
  var observer = Watchy.createObserver(obj, path, callback)
  if(noInit !== true) {
    callback(observer.value_)
  }
  return this.addClosable(observer);
}

Proto.watchAttribute = function(attribute, callback, noInit) {
  var self     = this;
  var observer = {
    attribute : attribute,
    callback  : callback,
    setValue  : function(value) {
      if(value === undefined || value === null) {
        self.removeAttribute(attribute)
      } else {
        self.setAttribute(attribute, value)
      }
    },
    close: function() {
      observer.callback = null;
      self._attributeWatcher = self._attributeWatcher.filter(function(w) {
        return w !== observer;
      })
    }
  };
  self._attributeWatcher.push(observer)
  if(noInit !== true) {
    callback(self.getAttribute(attribute), undefined, attribute)
  }
  return self.addClosable(observer);
}

Proto.mapAttribute = function(attribute, formatter, callback) {
  var self  = this;

  if('string' === typeof(formatter)) {
    formatter = { path: formatter }
  }

  formatter = extend({
    path      : attribute,
    read      : function(value) { return value },
    publish   : function(value) { return value },
    change    : null,
    way       : MapWay.BOTH
  }, formatter || {});

  formatter.way = MapWay(formatter.way)

  var scopeWatcher = self.watch(self.getScope(), formatter.path, function(value, previous) {
    if(formatter.way & MapWay.UP) {
      attrWatcher.setValue(formatter.publish(value))
    }
  }, true)

  var attrWatcher = self.watchAttribute(attribute, function(value, previous) {
    if(value === undefined || value === null) return;
    if(formatter.way & MapWay.DOWN) {
      scopeWatcher.setValue(formatter.read(value))
    }
    if(callback) callback(attribute, value, previous, formatter)
    if(formatter.change) formatter.change(value, previous)
  })
}

Proto.mapAttributes = function(mapping, callback) {
  var self  = this;

  if('string' == typeof(mapping)) {
    mapping = mapping.split(',').map(function(s) { return s.trim() })
  }

  if('[object Object]' !== mapping.toString()) {
    var newMapping = {};
    mapping.forEach(function(k) { newMapping[k] = k })
    mapping = newMapping;
  }

  Object.keys(mapping).forEach(function(attribute) {
    self.mapAttribute(attribute, mapping[attribute], callback)
  })
}

Proto.watchProperty = function(property, callback, noInit) {
  var observer = Watchy.createObserver(this, property, callback)
  if(noInit !== true) {
    callback(observer.value_)
  }
  return this.addClosable(observer);
}


Proto.mapProperty = function(property, formatter, callback) {
  var self  = this;
  var scopeWatcher, propertyWatcher;

  if('string' === typeof(formatter)) {
    formatter = { path: formatter }
  }

  formatter = extend({
    path      : property,
    read      : function(value) { return value },
    publish   : function(value) { return value },
    change    : null,
    way       : MapWay.BOTH
  }, formatter || {});

  formatter.way = MapWay(formatter.way)

  var way = formatter.way;


  scopeWatcher = self.watch(self.getScope(), formatter.path, function(value, previous) {
    if(formatter.way & MapWay.UP) {
      propertyWatcher.setValue(formatter.publish(value))
    }
  }, true)

  propertyWatcher = self.watchProperty(property, function(value, previous) {
    if(value === undefined || value === null) return;
    if(formatter.way & MapWay.DOWN) {
      scopeWatcher.setValue(formatter.read(value))
    }
    if(callback) callback(property, value, previous, formatter)
    if(formatter.change) formatter.change(value, previous)
  })
}

Proto.mapProperties = function(mapping, callback) {
  var self  = this;

  if('string' == typeof(mapping)) {
    mapping = mapping.split(',').map(function(s) { return s.trim() })
  }

  if('[object Object]' !== mapping.toString()) {
    var newMapping = {};
    mapping.forEach(function(k) { newMapping[k] = k })
    mapping = newMapping;
  }

  Object.keys(mapping).forEach(function(property) {
    self.mapProperty(property, mapping[property], callback)
  })
}


Proto.addClosable = function(closable) {
  this._closable.push(closable);
  return closable;
}

Proto.removeClosable = function(closable) {
  this._closable = this._closable.filter(function(o) {
    if(o === closable) {
      o.close();
      return false;
    }
    return true;
  })
}

Proto.closeAll = function() {
  this._closable.forEach(function(o) { o.close(); })
  this._closable = [];
}

Proto.created = function() {

}
