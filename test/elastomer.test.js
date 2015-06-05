/* global describe it  before */

require('webcomponents.js/webcomponents-lite.min.js')

// var elastomer = require('../lib/elastomer')
// var expect = require('expect.js')

describe('elastomer', function () {
  var base

  before(function () {
    base = document.createElement('div')
    document.body.appendChild(base)
    base.innerHTML = '<h3>This main document</h3>'
  })

  // it('functional test', function () {
  //   require('./fixtures/elasto-basic')
  //   var el = document.createElement('elasto-basic')
  //   el.innerHTML = '<span>This is lightDom</span>'
  //   base.appendChild(el)
  // })

  it.only('functional test', function () {
    require('./fixtures/elasto-layout')
    // require('./fixtures/elasto-qux')
    var el = document.createElement('elasto-layout')
    // el.setAttribute('val','qux')
    // el.innerHTML = '<h3>Light (Raw style expected)</h3><span>dom {{hello}}{{val}}</span><elasto-foo val="bob"><h3>Inner (raw) {{val}}</h3></elasto-foo>'
    base.appendChild(el)
  })
})
