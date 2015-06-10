/* global describe it  before */

require('webcomponents.js/webcomponents-lite.min.js')

// var elastomer = require('../lib/elastomer')
// var expect = require('expect.js')

describe('elastomer', function () {
  var base

  before(function () {
    base = document.createElement('div')
    document.body.appendChild(base)
    base.innerHTML = '<h3>This main document</h3><p>It must not be styled</p>'
  })

  // it('functional test', function () {
  //   require('./fixtures/elasto-basic')
  //   var el = document.createElement('elasto-basic')
  //   el.innerHTML = '<span>This is lightDom</span>'
  //   base.appendChild(el)
  // })

  it('do not run me', function () {
    console.log('run')
  })

  it.only('functional test', function () {
    require('./fixtures/elasto-layout')
    var el = document.createElement('elasto-layout')
    base.appendChild(el)
  })
})
