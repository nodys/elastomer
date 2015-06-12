exports.toArray = function (list) {
  return Array.prototype.slice.call(list)
}

exports.containsCssClass = function (el, className) {
  // Todo: alternative for browser without support of classList
  el.classList.contains(className)
}

exports.addCssClass = function (el, className) {
  // Todo: alternative for browser without support of classList
  el.classList.add(className)
}

exports.removeCssClass = function (el, className) {
  // Todo: alternative for browser without support of classList
  el.classList.remove(className)
  if (el.getAttribute('class').trim() === '') {
    el.removeAttribute('class')
  }
}

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
