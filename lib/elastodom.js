// From polymer
var p = Element.prototype
var matchesSelector = p.matches || p.matchesSelector ||
  p.mozMatchesSelector || p.msMatchesSelector ||
  p.oMatchesSelector || p.webkitMatchesSelector

var toArray = require('./utils.js').toArray

module.exports = ElastoDom

function ElastoDom(node) {
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
}

ElastoDom.prototype.querySelector = function (selector) {
  return this.querySelectorAll(selector)[0]
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

//
// // BUGGY
// ElastoDom.prototype._getInnerHTML = function () {
//   var elasto = this.elasto
//   var template = document.createElement('template')
//   var _insertionPoints = this._insertionPoints
//
//   template.innerHTML = this.elasto.host.innerHTML
//
//   // Cleanup insertion points
//   var contents = Array.prototype.slice.call(template.content.querySelectorAll('content'))
//   contents.forEach(function (content, index) {
//     content.removeAttribute(elasto.prefix + '-ignore')
//     content.textContent = ''
//     if (_insertionPoints[index]) {
//       content.innerHTML = nodeListToHTML(_insertionPoints[index]._elasto_cacheDefaultNodes)
//     }
//   })
//
//   // Cleanup insertion style scope
//   var scopedElements = Array.prototype.slice.call(template.content.querySelectorAll('.elastomer-css-scope'))
//   scopedElements.forEach(function (el) {
//     removeCssClass(el, 'elastomer-css-scope')
//     removeCssClass(el, elasto.elementName + '-scope')
//   })
//
//   // TODO: Child nodes with fake shadow dom ?
//
//   return template.innerHTML
// }
