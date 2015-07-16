exports.toArray = function (list) {
  return Array.prototype.slice.call(list)
}

// exports.containsCssClass = function (el, className) {
//   console.warn('containsCssClass is deprecated', (new Error).stack)
//   return exports.getClassList(el).contains(className)
// }
//
// exports.addCssClass = function (el, className) {
//   console.warn('addCssClass is deprecated', (new Error).stack)
//   return exports.getClassList(el).add(className)
// }
//
// exports.removeCssClass = function (el, className) {
//   console.warn('removeCssClass is deprecated', (new Error).stack)
//   return exports.getClassList(el).remove(className)
// }
//
// exports.toggleCssClass = function (el, className) {
//   console.warn('toggleCssClass is deprecated', (new Error).stack)
//   return exports.getClassList(el).toggle(className)
// }

exports.nodeListToHTML = function (nodeList) {
  var s = []
  var Node = window.Node || {
      TEXT_NODE: 3, COMMENT_NODE: 8, ELEMENT_NODE: 1
    }
  for (var i = 0, len = nodeList.length, node; i < len && (node = nodeList[i]); i++) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        s.push(node.textContent)
        break
      case Node.COMMENT_NODE:
        s.push('<!-- ' + node.textContent + ' -->')
        break
      case Node.ELEMENT_NODE:
        s.push(node.outerHTML) // Shim ?
        break
    }
  }
  return s.join('')
}

exports.getClassList = function (el) {
  if (el.classList) {
    return el.classList
  }
  var list
  if (el.className) {
    list = el.className.split(' ')
  } else {
    list = (el.getAttribute('class') || '').replace(/\s+/g, ' ').split(' ')
  }

  function apply () {
    if (el.className) {
      el.className = list.join(' ')
    } else {
      el.setAttribute('class', list.join(' '))
    }
  }

  var classList = {
    add: function (name) {
      if (classList.contains(name)) { return }
      list.push(name)
      apply()
    },
    remove: function (name) {
      if (!classList.contains(name)) { return }
      list.splice(list.indexOf(name), 1)
      apply()
    },
    contains: function (name) {
      return !!~list.indexOf(name)
    },
    toggle: function (name) {
      if (classList.contains(name)) {
        classList.remove(name)
      } else {
        classList.add(name)
      }
    }
  }

  return classList
}
