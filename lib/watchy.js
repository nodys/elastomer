
var requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }
})()

var observers = new WeakMap()

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

function getObserverFor (obj, key, noCreate) {
  var store = observers.get(obj)
  var observer = getObserverInStore(store, key)
  if (!observer && !noCreate) {
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
  if (observer.isEmpty()) {
    observer.close()
    store.splice(store.indexOf(observer), 1)
    if (!store.length) {
      observers.delete(obj)
    }
  }
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
  var observer = getObserverFor(obj, key, true)
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
      var infos = Array.prototype.slice.call(arguments)
      var deleted = Array.prototype.splice.apply(this, arguments)
      Object.defineProperty(infos, 'deleted', {
        value: deleted,
        enumerable: false
      })
      w.change(infos)
      return deleted
    },
    enumerable: false
  })

  Object.defineProperty(a, 'push', {
    value: function () {
      var args = Array.prototype.slice.call(arguments)
      args.unshift(this.length, 0)
      return this.splice.call(this, args)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'pop', {
    value: function () {
      return this.splice.call(this, this.length - 1, 1)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'shift', {
    value: function () {
      return this.splice.call(this, 0, 1)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'unshift', {
    value: function () {
      var args = Array.prototype.slice.call(arguments)
      args.unshift(0, 0)
      return this.splice.call(this, args)
    },
    enumerable: false
  })

  Object.defineProperty(a, 'set', {
    value: function (index, value) {
      a.splice(index, 1, value)
    // var args = Array.prototype.slice.call(arguments)
    // args.unshift(0, 0)
    // return this.splice.call(this, args)
    },
    enumerable: false
  })


  // Object.defineProperty(a, 'change', {
  //   value: function () {
  //     w.change()
  //   },
  //   enumerable: false
  // })

  return a.__watchyWrapper__
}

function WatchyObserver (obj, key) {
  var self = this
  WatchyObserver._count++
  self.obj = obj
  self.key = key
  self.callbacks = []

  self.value = obj[key]
  self.definition = Object.getOwnPropertyDescriptor(obj, key)
  self.subWatcher

  function getValue () {
    if (self.definition && self.definition.get) {
      return self.definition.get()
    } else {
      return self.value
    }
  }

  function applySubWatch (value) {
    if (self.subWatcher) {
      self.subWatcher.close()
      self.subWatcher = null
    }
    if (!isArray(value)) { return }
    self.subWatcher = watchyWrapperArray(value).watch(function (spliceInfos) {
      var newValue = getValue()
      self.triggerChange(newValue, newValue, spliceInfos)
    })
  }

  Object.defineProperty(obj, key, {
    get: function () {
      return getValue()
    },
    set: function (value) {
      var prev = getValue()
      applySubWatch(value)

      if (self.definition && self.definition.set) {
        self.definition.set(value)
        value = getValue()
      } else {
        self.value = value
      }
      self.triggerChange(value, prev)
    },
    configurable: true,
    enumerable: true
  })

  applySubWatch(getValue())

}

WatchyObserver.prototype.triggerChange = function (value, prev, splice) {
  var callbacks = this.callbacks.slice()
  requestAnimationFrame(function () {
    callbacks.forEach(function (cb) {
      cb(value, prev, splice)
    })
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
    console.error('Callback not found ?', callback)
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

WatchyObserver.prototype.close = function () {
  WatchyObserver._count--
  if (this.subWatcher) {
    this.subWatcher.close()
    this.subWatcher = null
  }
  this.obj = null
  this.key = null
  this.callbacks = []
}

WatchyObserver._count = 0

exports.WatchyObserver = WatchyObserver
