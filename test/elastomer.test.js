/* global describe it  before */

require('webcomponents.js/webcomponents.min.js')

// var elastomer = require('../lib/elastomer')
// var expect = require('expect.js')

describe('elastomer', function () {
  var base

  before(function () {
    base = document.createElement('div')
    document.body.appendChild(base)
    base.innerHTML = '<div id="outer">TEST OUTER</div>'
  })

  it('functional test', function () {
    require('./fixtures/elasto-basic')
    var el = document.createElement('elasto-basic')
    el.innerHTML = 'Light Domdd'
    base.appendChild(el)
  })

  it.only('functional test', function () {
    require('./fixtures/elasto-cssyhtmly')
    var el = document.createElement('elasto-cssyhtmly')
    el.innerHTML = 'Light Domdd'
    base.appendChild(el)
  })
})
