exports.toArray = function (list) {
  return Array.prototype.slice.call(list)
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

// Basic string to camelCase function
// Enought for attribute name convertion: foo-bar -> fooBar
exports.miniCamelCase = function (str) {
  return str.split(/[^\w\d]+/)
    .map(function (w, index) {
      return index ? w[0].toUpperCase() + w.substr(1).toLowerCase() : w.toLowerCase()
    }).join('')
}

// Basic string to kebabCase function
// Enought for attribute name convertion: fooBar -> foo-bar
exports.miniKebabCase = function (str) {
  return str.replace(/[A-Z]/g, function (m) { return '-' + m[0].toLowerCase() })
}

exports.requestAnimationFrame = (window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (cb) { return setTimeout(cb, 0) }).bind(window)

exports.cancelAnimationFrame = (window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.msCancelAnimationFrame ||
  function (int) { return clearTimeout(int) }).bind(window)
