var map = {}


module.exports = function (elementName, css) {
  if (!map[elementName]) {
    map[elementName] = new ElastoCss(elementName, css)
  }
}

function ElastoCss (elementName, css) {
  var self = this
  self.elementName = elementName
  self.css = css

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
  var useNative = window.CustomElements.useNative
  var name = this.elementName
  src = src.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, function (match, rule, rest) {
    if (useNative) {
      if (/^:host/.test(rule.trim())) {
        if (rule.trim() === ':host') {
          rule = 'html /deep/ ' + name
        } else {
          rule = rule.replace(/:host/g, 'html /deep/ ' + name + '::shadow')
        }
      } else {
        rule = 'html /deep/ ' + name + '::shadow ' + rule
      }
    } else {
      if (/^:host/.test(rule.trim())) {
        rule = rule.replace(/:host/g, 'html ' + name)
      } else {
        rule = 'html ' + name + ' ' + rule
      }
    }
    return rule + rest
  })
  return src
}

ElastoCss.prototype.inject = function (src) {
  var style
  src = this.transform(src)

  style = document.querySelector('head style[elastomer-css-for="' + this.elementName + '"]')

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
