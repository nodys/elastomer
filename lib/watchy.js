var PathObserver = require('observe-js').PathObserver
var ObjectObserver = require('observe-js').ObjectObserver
var ArrayObserver = require('observe-js').ArrayObserver

module.exports = Watchy

function Watchy () {
  if (!(this instanceof Watchy)) return new Watchy()

  var observers = []

  function keyCompare (a, b) {
    return (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2])
  }

  function newObserver (obj, keypath, callback) {
    var observer = Watchy.createObserver(obj, keypath, callback)
    observers.push({key: [obj, keypath, callback], observer: observer})
  }

  function removeObserver (obj, keypath, callback) {
    var key = [obj, keypath, callback]
    observers = observers.reduce(function (memo, item) {
      if (keyCompare(key, item.key)) {
        item.observer.close()
      } else {
        memo.push(item)
      }
      return memo
    }, [])
  }

  this.observe = function (obj, keypath, callback) {
    newObserver(obj, keypath, callback)
  }

  this.unobserve = function (obj, keypath, callback) {
    removeObserver(obj, keypath, callback)
  }

  this.get = function (obj, keypath) {
    return obj[keypath]
  }

  this.set = function (obj, keypath, value) {
    obj[keypath] = value
    if (window.WebComponents) {
      window.WebComponents.performMicrotaskCheckpoint()
    }
    return obj[keypath]
  }

}

Watchy.createObserver = function (obj, keypath, callback) {
  var observer = new PathObserver(obj, keypath)
  var subObs

  function updateSubObserver (value) {
    if (subObs) {
      subObs.close()
      subObs = null
    }

    if ((typeof (value) === 'object') && (value !== null)) {
      if (Array.isArray(value)) {
        subObs = new ArrayObserver(value)
        subObs.open(function (splice) {
          callback(obj[keypath])
        })
      } else {
        subObs = new ObjectObserver(value)
        subObs.open(function (added, removed, changed, getOldValueFn) {
          callback(obj[keypath])
        })
      }
    }
  }

  observer.open(function (newValue, oldValue) {
    updateSubObserver(newValue)
    callback(newValue, oldValue)
  })

  updateSubObserver(obj[keypath])

  var _close = observer.close

  observer.close = function () {
    if (subObs) {
      subObs.close()
      subObs = null
    }
    _close.call(observer)
  }

  return observer
}
