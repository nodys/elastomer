module.exports = ElastoCss

function ElastoCss (localName) {
  this.localName = localName
  this.css = null
  this.rawRules = []
  this.styleElement = null
}

ElastoCss.map = {}

ElastoCss.getInstance = function (localName, css) {
  var map = ElastoCss.map

  if (!map[localName]) {
    map[localName] = new ElastoCss(localName)
  }
  if (css) {
    map[localName].inject(css)
  }
  return map[localName]
}

ElastoCss.transform = function (src, localName, rawRules) {
  rawRules = rawRules || []

  // Ignore comments
  var comments = {}
  src = src.replace(/\/\*(.|\n)*?\*\//g, function (match) {
    var key = '/*_comment_' + (Math.random() * 1e9 >>> 0) + '*/'
    comments[key] = match
    return key
  })

  src = src.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, function (match, rule, rest) {
    if (/^@/.test(rule)) {
      return rule + rest
    }
    if (/%/.test(rule)) {
      return rule + rest
    }
    rule = rule.replace(/\s*$/,'')
    rawRules.push(rule)
    rule = ElastoCss.scopeRule(rule, localName)
    return rule + ' ' + rest
  })

  // Restore comments
  Object.keys(comments).forEach(function (key) {
    src = src.replace(key, comments[key])
  })

  return src
}

ElastoCss.scopeRule = function (rule, localName) {

  var hasHost = /:host/.test(rule)
  var hostOnly = /:host(?:\([^\)]+\))?$/.test(rule)
  var indent = rule.match(/^\s*/)[0]
  var outOfScope = ''



  var outMatch = rule.match(/(.*)(\/deep\/|::shadow|::content)(.*)/)
  if (outMatch) {
    rule = outMatch[1].replace(/\s*$/,'')
    outOfScope = outMatch[2] + outMatch[3]
    outOfScope = outOfScope.replace(/\/deep\//g, '')
    outOfScope = outOfScope.replace(/::shadow/g, ' > elasto-shadow')
    outOfScope = outOfScope.replace(/::content/g, ' content')
  }

  if(!rule.trim()) {
    return localName + outOfScope
  }

  var hasHost = /:host/.test(rule)
  var hostOnly = /:host(?:\([^\)]+\))?$/.test(rule)

  if (hasHost && (rule === ':host')) {
    return localName + outOfScope
  }

  if (hasHost) {
    rule = rule.replace(/:host(?:\(([^\)]+)\))?/, localName + '$1').trim()
  }

  // rule = rule.replace(/(\/deep\/|::shadow)/g, '')
  // rule = rule.replace(/::content/g, 'content')

  // Add element scope (if not a :host only rule)
  if (!hostOnly) {
    var splitted = rule.split(/(^|[\s>+~]+)([^\s>+~]+)/g).filter(function (s) { return Boolean(s) })
    var last = splitted[splitted.length - 1]
    var injected = last.split(/(:?[^\s\:\[]+)([\:\[].+)?/).filter(function (s) { return Boolean(s) })
    injected[0] = injected[0] + '.' + localName + '-scope'
    splitted[splitted.length - 1] = injected.join('')
    rule = splitted.join('')
  }

  rule = indent + (hasHost ? '' : localName + ' ') + rule + outOfScope
  return rule
}

ElastoCss.prototype.inject = function (src) {
  if (this.css === src) {
    // No changes. Ignore
    return
  }
  this.css = src
  this.rawRules = []
  src = ElastoCss.transform(src, this.localName, this.rawRules)

  var style = this._getStyleElement()

  if (style.styleSheet) {
    style.styleSheet.cssText = src
  } else {
    style.textContent = src
  }
}

ElastoCss.prototype.getSelectors = function () {
  return this.rawRules.map(function (rule) {
    rule = rule.replace(/:host(\([^\)]+\))?\s*/g, '') // :host(...) too
    // Remove some pseudo-class
    rule = rule.replace(/:(link|visited|hover|active)$/, '')
    // Remove native shadow dom rules
    rule = rule.replace(/(\/deep\/|::shadow)/g, ' ')
    rule = rule.replace(/::content/g, 'content')
    return rule.trim()
  })
  .filter(function (rule) {
    return Boolean(rule)
  })
}

ElastoCss.prototype._getStyleElement = function () {
  if (this.styleElement) {
    return this.styleElement
  }

  var style = document.querySelector('head style[elasto-scope="' + this.localName + '"]')

  if (style) {
    this.styleElement = style
    return this.styleElement
  }

  var ref = document.head.querySelector('style, link[rel=stylesheet]')

  style = document.createElement('style')
  style.setAttribute('type', 'text/css')
  style.setAttribute('elasto-scope', this.localName)

  if (ref) {
    document.head.insertBefore(style, ref)
  } else {
    document.head.appendChild(style)
  }

  this.styleElement = style

  return this.styleElement
}
