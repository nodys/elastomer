// From polymer
var Element = window.Element
var p = Element.prototype
var matchesSelector = p.matches || p.matchesSelector ||
  p.mozMatchesSelector || p.msMatchesSelector ||
  p.oMatchesSelector || p.webkitMatchesSelector

var getClassList = require('./utils').getClassList
var toArray = require('./utils').toArray

module.exports = ElastoDom

function ElastoDom (node) {
  if (!(this instanceof ElastoDom)) {
    return new ElastoDom(node)
  }
  this.node = node

  Object.defineProperty(this, 'childNodes', {
    get: function () {
      if (this.node._lightChildren) {
        return this.node._lightChildren
      } else {
        return this.node.childNodes
      }
    },
    enumerable: true,
    configurable: true
  })

  Object.defineProperty(this, 'children', {
    get: function () {
      if (this.node._lightChildren) {
        return toArray(this.childNodes).filter(function (node) {
          return node.nodeType === window.Node.ELEMENT_NODE
        })
      } else {
        return this.node.children
      }
    },
    enumerable: true,
    configurable: true
  })

  Object.defineProperty(this, 'innerHTML', {
    get: function () {
      console.warn('Not implemented')
    },
    set: function () {
      console.warn('Not implemented')
    }
  })

  Object.defineProperty(this, 'classList', {
    get: function () {
      return getClassList(this.node)
    }
  })

}

ElastoDom.prototype.querySelector = function (selector) {
  return this.querySelectorAll(selector)[0]
}

ElastoDom.prototype['$'] = function (selector) {
  return this.querySelectorAll(selector)
}

ElastoDom.prototype.querySelectorAll = function (selector) {
  function getLightChildren (node) {
    if (node.tagName === 'CONTENT') {
      return []
    }
    if (node._lightChildren) {
      return node._lightChildren
    }
    return node.childNodes
  }

  function query (matcher, node) {
    var list = []
    queryElements(getLightChildren(node), matcher, list)
    return list
  }

  function queryElements (elements, matcher, list) {
    if (!elements) { return }
    for (var i = 0, l = elements.length, c; (i < l) && (c = elements[i]); i++) {
      if (c.nodeType === window.Node.ELEMENT_NODE) {
        queryElement(c, matcher, list)
      }
    }
  }

  function queryElement (node, matcher, list) {
    if (matcher(node)) {
      list.push(node)
    }
    queryElements(getLightChildren(node), matcher, list)
  }

  return query(function (n) {
    return matchesSelector.call(n, selector)
  }, this.node)
}
