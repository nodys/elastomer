var observers = window.WatchyObservers = (window.WatchyObservers || new WeakMap())
var utils = require('./utils')

function getStore (obj) {
  var store = observers.get(obj)
  if (store === undefined) {
    store = []
    observers.set(obj, store)
  }
  return store
}

function getObserverInStore (store, key) {
  if (!store) {
    return
  }
  for (var i = 0, len = store.length; i < len; i++) {
    if (store[i].key === key) {
      return store[i]
    }
  }
}

function getObserverFor (obj, key) {
  var store = observers.get(obj)
  var observer = getObserverInStore(store, key)
  if (!observer) {
    store = store || getStore(obj)
    observer = getObserverInStore(store, key)
    if (!observer) {
      observer = new WatchyObserver(obj, key)
      store.push(observer)
    }
  }
  return observer
}

function removeObserver (obj, key, callback) {
  var store = observers.get(obj)
  var observer = getObserverInStore(store, key)
  if (!store || !observer) {
    return
  }
  observer.remove(callback)

  // Do cleanup later: rivet should need an removed
  // observer to read an object during unbinding
  // this prevent many observer creation just for
  // reading
  setTimeout(function () {
    if (observer.isEmpty()) {
      observer.close()
      store.splice(store.indexOf(observer), 1)
      if (!store.length) {
        observers.delete(obj)
      }
    }
  }, 10)
}

exports._observeKey = function (obj, key, callback) {
  var observer = getObserverFor(obj, key)
  observer.add(callback)
  return {
    close: function () {
      exports.unobserve(obj, key, callback)
    },
    getValue: function () {
      return observer.getValue()
    },
    setValue: function (value) {
      return observer.setValue(value)
    }
  }
}

exports._observeKeypath = function (obj, key, callback) {
  var pObs = []
  var path = key.split('.')
  var last

  var result = {
    close: function () {
      reset()
    },
    getValue: function () {
      return last.getValue()
    },
    setValue: function (value) {
      return last.setValue(value)
    }
  }

  function reset () {
    pObs.forEach(function (obs) {
      obs.close()
    })
    pObs = []
    if (last) {
      last.close()
    }
  }

  function update () {
    var cur = obj
    reset()
    function cbWrapper () {
      callback.apply(this, arguments)
    }
    function updateWrapper () {
      update()
    }
    updateWrapper.callback = callback
    path.slice(0, -1).forEach(function (key, index) {
      if (!cur[key]) {
        cur[key] = {}
      }
      var obs = exports._observeKey(cur, key, updateWrapper)
      pObs.push(obs)
      cur = cur[key]
    })
    last = exports._observeKey(cur, path.slice(-1), cbWrapper)
    cbWrapper(cur[path.slice(-1)])
  }
  update()

  return result
}

exports.observe = function (obj, key, callback) {
  if (!~key.indexOf('.')) {
    return exports._observeKey(obj, key, callback)
  } else {
    return exports._observeKeypath(obj, key, callback)
  }
}

exports._unobserveKey = function (obj, key, callback) {
  removeObserver(obj, key, callback)
}

exports.unobserve = function (obj, key, callback) {
  exports._unobserveKey(obj, key, callback)
}

exports.get = function (obj, key) {
  var observer = getObserverFor(obj, key)
  return observer ? observer.getValue() : void (0)
}

exports.set = function (obj, key, value) {
  var observer = getObserverFor(obj, key)
  observer.setValue(value)
  return value
}

function isArray (a) {
  return Object.prototype.toString.call(a) === '[object Array]'
}

function watchyWrapperArray (a) {
  if (a.__watchyWrapper__) {
    return a.__watchyWrapper__
  }
  var watchers = []

  var w = {
    change: function (info) {
      watchers.forEach(function (w) {
        w(info)
      })
    },
    watch: function (cb) {
      watchers.push(cb)
      return {
        close: function () { w.unwatch(cb) }
      }
    },
    unwatch: function (cb) {
      var index = watchers.indexOf(cb)
      if (~index) {
        watchers.splice(index, 1)
      }
    },
    reset: function () {
      watchers = []
    }
  }

  Object.defineProperty(a, '__watchyWrapper__', {
    get: function () {
      return w
    },
    enumerable: false,
    configurable: false
  })

  Object.defineProperty(a, 'splice', {
    value: function () {
      var previous = Array.prototype.slice.call(a)
      var infos = Array.prototype.slice.call(arguments)
      var deleted = Array.prototype.splice.apply(this, arguments)
      if (deleted.length || (arguments.length > 2)) {
        Object.defineProperty(infos, 'deleted', {
          value: deleted,
          enumerable: false
        })
        Object.defineProperty(infos, 'previous', {
          value: previous,
          enumerable: false
        })
        Object.defineProperty(infos, 'current', {
          value: a,
          enumerable: false
        })
        w.change(infos)
      }
      return deleted
    },
    enumerable: false
  })

  Object.defineProperty(a, 'push', {
    value: function () {
      var args = Array.prototype.slice.call(arguments)
      args.unshift(this.length, 0)
      return this.splice.apply(this, args)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'pop', {
    value: function () {
      return this.splice(this.length - 1, 1)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'shift', {
    value: function () {
      return this.splice(0, 1)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'unshift', {
    value: function () {
      var args = Array.prototype.slice.call(arguments)
      args.unshift(0, 0)
      return this.splice.apply(this, args)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'set', {
    value: function (index, value) {
      a.splice(index, 1, value)
    },
    enumerable: false
  })

  return a.__watchyWrapper__
}

function WatchyObserver (obj, key) {
  var self = this
  var handler
  WatchyObserver._count++
  self.obj = obj
  self.key = key
  self.callbacks = []

  self.value = obj[key]

  self.subWatcher = null

  function applySubWatch (value) {
    if (self.subWatcher) {
      self.subWatcher.close()
      self.subWatcher = null
    }
    if (isArray(value)) {
      self.subWatcher = watchyWrapperArray(value).watch(function (spliceInfos) {
        self.triggerChange(spliceInfos.current, spliceInfos.previous, spliceInfos)
      })
    }
    if (value && value.isCollection) {
      self.subWatcher = (function () {
        function handleEvent () {
          self.triggerChange(value, null, null) // .. previous ??
        }
        value.on('reset', handleEvent)
        value.on('add', handleEvent)
        value.on('remove', handleEvent)
        return {
          close: function () {
            value.off('reset', handleEvent)
            value.off('add', handleEvent)
            value.off('remove', handleEvent)
          }
        }
      })()
    }
  }

  if (this.useChangeEvents()) {
    self.backboneStyleChangeHandler = function (model, value) {
      if (!self.obj) { return }
      var prev = self.obj.previous(self.key)
      if (prev === value) {
        return
      }
      applySubWatch(value)
      self.triggerChange(value, prev)
    }
    obj.on('change:' + key, self.backboneStyleChangeHandler)
  } else {
    handler = this._getHandler(obj, key)
    Object.defineProperty(obj, key, {
      get: function () {
        return handler.get()
      },
      set: function (value) {
        var prev = handler.get()
        if (prev === value) {
          return
        }
        applySubWatch(value)
        handler.set(value)
        value = handler.get()
        self.triggerChange(value, prev)
      },
      configurable: true,
      enumerable: true
    })
    applySubWatch(handler.get())
  }
}

WatchyObserver.prototype._getHandler = function (obj, key) {
  var self = this
  var desc = Object.getOwnPropertyDescriptor(obj, key)
  var descp = Object.getOwnPropertyDescriptor(obj.constructor.prototype, key)
  var handler = {}
  var setter
  var getter
  if (desc && desc.set) {
    setter = desc.set
    handler.set = function (v) { return setter.call(obj, v) }
  } else if (descp && descp.set) {
    setter = descp.set
    handler.set = function (v) { return setter.call(obj, v) }
  } else {
    handler.set = function (v) { self.value = v }
  }
  if (desc && desc.get) {
    getter = desc.get
    handler.get = function () { return getter.call(obj) }
  } else if (descp && descp.get) {
    getter = descp.get
    handler.get = function () { return getter.call(obj) }
  } else {
    handler.get = function () { return self.value }
  }
  return handler
}

WatchyObserver.prototype.triggerChange = function (value, prev, splice) {
  if (value === prev) {
    return
  }
  var callbacks = this.callbacks.slice()
  callbacks.forEach(function (cb) {
    cb(value, prev, splice)
  })
}

WatchyObserver.prototype.add = function (callback) {
  var index = this.callbacks.indexOf(callback)
  if (index === -1) {
    this.callbacks.push(callback)
  }
}

WatchyObserver.prototype.remove = function (callback) {
  var index = this.callbacks.indexOf(callback)
  if (index !== -1) {
    this.callbacks.splice(index, 1)
  } else {
    // Callback allready removed (certainly closed manually)
  }
}

WatchyObserver.prototype.isEmpty = function () {
  return !this.callbacks.length
}

WatchyObserver.prototype.getValue = function () {
  return this.obj[this.key]
}

WatchyObserver.prototype.setValue = function (value) {
  this.obj[this.key] = value
}

/**
 * Try to determine if the object is 'watchable' according to Backbone & co kind of objects
 * @param  {[type]}  value [description]
 * @return {Boolean}       [description]
 */
WatchyObserver.prototype.useChangeEvents = function () {
  try {
    // Amperstand isState
    return this.obj.isEmittingChangeEvent === true || this.obj.isState === true
  } catch (_) {
    return false
  }
}

WatchyObserver.prototype.close = function () {
  WatchyObserver._count--
  if (this.subWatcher) {
    this.subWatcher.close()
    this.subWatcher = null
  }

  try {
    if (this.useChangeEvents() && this.backboneStyleChangeHandler) {
      this.obj.off('change:' + this.key, this.backboneStyleChangeHandler)
    }
  } catch (e) {}

  this.obj = null
  this.key = null
  this.callbacks = []
}

WatchyObserver._count = 0

exports.WatchyObserver = WatchyObserver
