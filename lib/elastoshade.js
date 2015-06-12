var elastocss = require('./elastocss')

module.exports = ElastoShade

function ElastoShade (elasto) {
  if(!(this instanceof ElastoShade)) {
    return new ElastoShade(elasto)
  }

  this.elasto = elasto

  var template = document.createElement('template')
  template.innerHTML = elasto.html.toString()

  if (elasto._lightDom) {
    elasto.host.textContent = ''
    Array.prototype.slice.call(elasto._lightDom).forEach(function (el) {
      elasto.host.appendChild(el)
    }, elasto)
  } else {
    elasto._lightDom = elasto.host.childNodes
  }

  var contents = template.content.querySelectorAll('content')
  var elements = Array.prototype.slice.call(elasto._lightDom)

  var selectedElements = {}

  for (var i = 0, len = contents.length, content, select; i < len && (content = contents[i]); i++) {
    select = content.getAttribute('select')
    if (select) {
      selectedElements[select] = []
      var find = elasto.host.querySelectorAll(select)
      for (var f = 0, flen = find.length, lightEl; f < flen && (lightEl = find[f]); f++) {
        selectedElements[select].push(elements.splice(elements.indexOf(lightEl), 1)[0])
      }
    } else if (!selectedElements['*']) {
      selectedElements['*'] = elements
      elements = []
      // And stop !
      break
    }
  }

  elasto.host.textContent = ''
  elasto.host.innerHTML = elasto.html.toString()

  var restContent
  contents = elasto.host.querySelectorAll('content')
  for (var j = 0, clen = contents.length, content, select; j < clen && (content = contents[j]); j++) {
    select = content.getAttribute('select')
    content.setAttribute(elasto.prefix + '-ignore', '')
    if (select && selectedElements[select] && selectedElements[select].length) {
      content.textContent = ''
      for (var e = 0, elen = selectedElements[select].length, el; e < elen && (el = selectedElements[select][e]); e++) {
        content.appendChild(el)
      }
    } else {
      restContent = restContent || content
    }
  }

  if (restContent && selectedElements['*'].length) {
    restContent.textContent = ''
    for (var e = 0, elen = selectedElements['*'].length, el; e < elen && (el = selectedElements['*'][e]); e++) {
      restContent.appendChild(el)
    }
  }

  if (elasto.css) {
    var elastoCss = elastocss(elasto.elementName, elasto.css)
    elastoCss.rawRules.forEach(function (rule) {
      // Localise -remove :host(...)
      rule = rule.replace(/:host(\([^\)]+\))?\s*/g, '') // :host(...) too

      // Remove some pseudo-class
      rule = rule.replace(/:(link|visited|hover|active)$/, '')

      // Remove native shadow dom rules
      rule = rule.replace(/(\/deep\/|::shadow)/g, ' ')
      rule = rule.replace(/::content/g, 'content')

      if (rule === '') {
        return
      }
      var elMatch = Array.prototype.slice.call(elasto.host.querySelectorAll(rule))
      elMatch.forEach(function (el) {
        if (!el.classList.contains('elastomer-css-scope')) {
          // Todo: alternative for browser without support of classList
          el.classList.add('elastomer-css-scope')
          el.classList.add(elasto.elementName + '-scope')
        }
      }, elasto)
    }, elasto)

  }
}
