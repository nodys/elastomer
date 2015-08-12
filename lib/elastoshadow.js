var ElastoCss = require('./elastocss')
var elastodom = require('./elastodom')
var toArray = require('./utils').toArray
var getClassList = require('./utils').getClassList

module.exports = ElastoShadow

function ElastoShadow (elasto) {
  if (!(this instanceof ElastoShadow)) {
    return new ElastoShadow(elasto)
  }
  var self = this

  this.elasto = elasto

  this.shadow = null

  this._lightChildren = null

  this._distributedNodes = []

  this._insertionPoints = []

  this._elastomdom = elastodom(this)

  // Getter / Setter innerHTML
  Object.defineProperty(this, 'innerHTML', {
    get: function () {
      // return this._getInnerHTML()
    },
    set: function (html) {
      this._setInnerHTML(html)
    }
  })

  Object.defineProperty(this, 'host', {
    get: function () {
      return this.elasto.host
    }
  })

  Object.defineProperty(this, 'childNodes', {
    get: function () {
      return this._lightChildren
    }
  })

  // Dom methods Wrapper:
  var methods = ['querySelector', 'querySelectorAll']
  methods.forEach(function (method) {
    if (self[method]) {
      return
    }
    self[method] = function () {
      return self._elastomdom[method].apply(self._elastomdom, arguments)
    }
  })
}

ElastoShadow.prototype._restoreHostLightDom = function () {
  var host = this.elasto.host
  var ldom = host._lightChildren
  if (!ldom) {
    return
  }
  host.textContent = ''
  for (var i = 0, len = ldom.length; i < len; i++) {
    host.appendChild(ldom[i])
  }
}

ElastoShadow.prototype._getNodeDistribution = function (host, shadowHtml) {
  var template = document.createElement('div')
  template.innerHTML = shadowHtml
  var contents = template.querySelectorAll('content')
  var pool = toArray(host.childNodes)

  var distribution = {}

  for (var i = 0, len = contents.length, content, select; i < len && (content = contents[i]); i++) {
    select = content.getAttribute('select')
    if (select) {
      distribution[select] = []
      var find = host.querySelectorAll(select)
      for (var f = 0, flen = find.length, lightEl; f < flen && (lightEl = find[f]); f++) {
        distribution[select].push(pool.splice(pool.indexOf(lightEl), 1)[0])
      }
    } else if (!distribution['*']) {
      distribution['*'] = pool
      pool = []
      break // And stop !
    }
  }
  return distribution
}

ElastoShadow.prototype._distributeNodes = function (host, distribution) {
  var elasto = this.elasto
  var _distributedNodes = this._distributedNodes = []
  var _insertionPoints = this._insertionPoints = []
  var restContent
  var contents = host.querySelectorAll('content')

  var previousNode = null

  function addDistributedNode (node, insertionPoint) {
    insertionPoint.appendChild(node)
    node._elasto_nextSibling = null
    node._elasto_insertionPoint = insertionPoint
    _distributedNodes.push(node)
    if (previousNode) {
      previousNode._elasto_nextSibling = node
    }
    previousNode = node
  }

  function addInsertionPoint (insertionPoint) {
    insertionPoint._elasto_cacheDefaultNodes = toArray(insertionPoint.childNodes)
    _insertionPoints.push(insertionPoint)
  }

  for (var j = 0, clen = contents.length, content, select; j < clen && (content = contents[j]); j++) {
    select = content.getAttribute('select')
    addInsertionPoint(content)
    if (select && distribution[select] && distribution[select].length) {
      content.textContent = ''
      content.setAttribute(elasto.prefix + '-ignore', '')
      distribution[select].forEach(function (node) {
        addDistributedNode(node, content)
      })
    } else {
      restContent = restContent || content
    }
  }

  if (restContent && distribution['*'] && distribution['*'].length) {
    restContent.textContent = ''
    restContent.setAttribute(elasto.prefix + '-ignore', '')
    distribution['*'].forEach(function (node) {
      addDistributedNode(node, restContent)
    })
  }
}

ElastoShadow.prototype._setInnerHTML = function (html) {
  var elasto = this.elasto
  var host = elasto.host

  if (host._lightChildren) {
    this._restoreHostLightDom()
  } else {
    host._lightChildren = toArray(host.childNodes)
  }
  var distribution = this._getNodeDistribution(host, html)

  host.textContent = ''

  if (!this.shadow) {
    this.shadow = document.createElement('elasto-shadow')
  } else {
    this.shadow.textContent = ''
  }
  host.appendChild(this.shadow)

  this.shadow.innerHTML = html

  this._lightChildren = toArray(this.shadow.childNodes)

  // TODO: Maybe we should handle style tag there ?
  if (elasto.css) {
    var elastoCss = ElastoCss.getInstance(elasto.elementName, elasto.css.toString())
    elastoCss.getSelectors().forEach(function (rule) {
      var elMatch = Array.prototype.slice.call(host.querySelectorAll(rule))
      elMatch.forEach(function (el) {
        var classList = getClassList(el)
        if (!classList.contains('elastomer-css-scope')) {
          classList.add('elastomer-css-scope')
          classList.add(elasto.elementName + '-scope')
        }
      }, elasto)
    }, elasto)

  }

  // After to prevent changes on injectionPoint nodes
  // (but could be handled with a scoped query selector for css above)
  this._distributeNodes(this.shadow, distribution)

}
