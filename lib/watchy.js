var PathObserver = require('observe-js').PathObserver
var ObjectObserver = require('observe-js').ObjectObserver
var ArrayObserver = require('observe-js').ArrayObserver

var observers = new WeakMap()

function getStore (obj) {
  var store = observers.get(obj)
  if (store === undefined) {
    store = []
    observers.set(obj, store)
  }
  return store
}

function getObserverInStore (store, keypath) {
  if (!store) {
    return
  }
  for (var i = 0, len = store.length; i < len; i++) {
    if (store[i].keypath === keypath) {
      return store[i]
    }
  }
}

function getObserverFor (obj, keypath) {
  var store = observers.get(obj)
  var observer = getObserverInStore(store, keypath)
  if (!observer) {
    store = store || getStore(obj)
    observer = getObserverInStore(store, keypath)
    if (!observer) {
      observer = new WatchyObserver(obj, keypath)
      store.push(observer)
    }
  }
  return observer
}

function removeObserver (obj, keypath, callback) {
  var store = observers.get(obj)
  var observer = getObserverInStore(store, keypath)
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

exports.observe = function (obj, keypath, callback) {
  var observer = getObserverFor(obj, keypath)
  observer.add(callback)
  return {
    close: function () {
      exports.unobserve(obj, keypath, callback)
    },
    getValue: function () {
      return exports.get(obj, keypath)
    },
    setValue: function (value) {
      return exports.set(obj, keypath, value)
    }
  }
}

exports.unobserve = function (obj, keypath, callback) {
  removeObserver(obj, keypath, callback)
}

exports.get = function (obj, keypath) {
  var observer = getObserverFor(obj, keypath)
  return observer.getValue()
}

exports.set = function (obj, keypath, value) {
  var observer = getObserverFor(obj, keypath)
  observer.setValue(value)
  if (window.Platform && window.Platform.performMicrotaskCheckpoint) {
    window.Platform.performMicrotaskCheckpoint()
  }
  return value
}

function WatchyObserver (obj, keypath) {
  var self = this
  WatchyObserver._count++
  self.obj = obj
  self.keypath = keypath
  self.callbacks = []

  self.pathObs = new PathObserver(obj, keypath)
  self.valueObs

  function callback (newValue, oldValue) {
    var cbs = self.callbacks
    for (var c = 0, len = cbs.length, cb; c < len && (cb = cbs[c]); c++) {
      cb(newValue, oldValue)
    }
  }

  function updateSubObserver (newValue, oldValue) {
    if (self.valueObs) {
      self.valueObs.close()
      self.valueObs = null
    }

    if ((typeof (newValue) === 'object') && (newValue !== null)) {
      if (Array.isArray(newValue)) {
        self.valueObs = new ArrayObserver(newValue)
        self.valueObs.open(function (splice) {
          callback(obj[keypath])
        })
      } else {
        self.valueObs = new ObjectObserver(newValue)
        self.valueObs.open(function (added, removed, changed, getOldValueFn) {
          callback(obj[keypath])
        })
      }
    }
  }

  self.pathObs.open(function (newValue, oldValue) {
    updateSubObserver(newValue, oldValue)
    callback(newValue, oldValue)
  })

  updateSubObserver(obj[keypath])
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
  }
}

WatchyObserver.prototype.isEmpty = function () {
  return !this.callbacks.length
}

WatchyObserver.prototype.getValue = function () {
  return this.pathObs.value_
}

WatchyObserver.prototype.setValue = function (value) {
  return this.pathObs.setValue(value)
}

WatchyObserver.prototype.close = function () {
  WatchyObserver._count--
  this.pathObs.close()
  if (this.valueObs) {
    this.valueObs.close()
    this.valueObs = null
  }
  this.obj = null
  this.keypath = null
  this.callbacks = []
}

WatchyObserver._count = 0

exports.WatchyObserver = WatchyObserver
