exports.toArray = function (list) {
  return Array.prototype.slice.call(list)
}

exports.containsCssClass = function (el, className) {
  if (el.classList) {
    return el.classList.contains(className)
  } else {
    var classList = (el.getAttribute('class') || '').split(' ')
    return !!~classList.indexOf(className)
  }
}

exports.addCssClass = function (el, className) {
  if (exports.containsCssClass(el, className)) {
    return
  }
  if (el.classList) {
    el.classList.add(className)
  } else {
    var classList = (el.getAttribute('class') || '').split(' ')
    classList.push(className)
    el.setAttribute('class', classList.join(' '))
  }
}

exports.removeCssClass = function (el, className) {
  if (!exports.containsCssClass(el, className)) {
    return
  }
  if (el.classList) {
    el.classList.add(className)
  } else {
    var classList = (el.getAttribute('class') || '').split(' ')
    var index = classList.indexOf(className)
    classList.splice(index, 1)
    el.setAttribute('class', classList.join(' '))
  }
  if (el.getAttribute('class').trim() === '') {
    el.removeAttribute('class')
  }
}

exports.toggleCssClass = function (el, className) {
  if (!exports.containsCssClass(el, className)) {
    return exports.addCssClass(el, className)
  } else {
    return exports.removeCssClass(el, className)
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
