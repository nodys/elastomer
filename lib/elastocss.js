var map = {}

module.exports = function (elementName, css) {
  if (!map[elementName]) {
    map[elementName] = new ElastoCss(elementName, css)
  }
  return map[elementName]
}

function ElastoCss (elementName, css) {
  var self = this
  self.elementName = elementName
  self.css = css
  self.rawRules = []
  // Cssy like
  if (css.onChange) {
    css.onChange(function (src) {
      console.log('Change')
      self.inject(src)
    })
    self.inject(css.toString())
  } else {
    self.inject(css)
  }
}

ElastoCss.prototype.transform = function (src) {
  this.rawRules = []

  // Ignore comments
  src = src.replace(/\/\*(.|\n)*?\*\//g,'')

  src = src.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, function (match, rule, rest) {
    if (/^@/.test(rule)) {
      return rule + ' ' + rest
    }
    rule = rule.trim()
    this.rawRules.push(rule)
    rule = this.scopeRule(rule)
    return rule + ' ' + rest
  }.bind(this))
  return src
}

ElastoCss.prototype.scopeRule = function (rule) {
  var name = this.elementName

  var hasHost = /^:host/.test(rule)
  var hostOnly = /^:host(?:\([^\)]+\))?$/.test(rule)

  if (hasHost && (rule === ':host')) {
    return name
  }

  if (hasHost) {
    rule = rule.replace(/^:host(?:\(([^\)]+)\))?/, name + '$1').trim()
  }

  rule = rule.replace(/(\/deep\/|::shadow)/g, ' ')
  rule = rule.replace(/::content/g, 'content')

  // Add element scope (if not a :host only rull)
  if(!hostOnly) {
    var splitted = rule.split(/(^|[\s>+~]+)([^\s>+~]+)/g).filter(function (s) { return Boolean(s) })
    var last = splitted[splitted.length - 1]
    var injected = last.split(/(:?[^\s\:\[]+)([\:\[].+)?/).filter(function (s) { return Boolean(s) })
    injected[0] = injected[0] + '.' + name + '-scope'
    splitted[splitted.length - 1] = injected.join('')
    rule = splitted.join('')
  }
  rule = (hasHost ? '' : name + ' ') + rule
  return rule
}

ElastoCss.prototype.inject = function (src) {
  var style
  src = this.transform(src)

  // Todo: inject before other styles / links
  style = document.querySelector('head style[elasto-scope="' + this.elementName + '"]')

  if (!style) {
    style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.setAttribute('elastomer-css-for', this.elementName)
    document.getElementsByTagName('head')[0].appendChild(style)
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = src
  } else {
    style.textContent = src
  }
}
