/* global describe it  before */

require('./polyfills.js')

var elastomer = require('..')

// elastomer.Elastomer.config.native = true

describe('elastomer', function () {
  var base

  require('./elastocss.test.js')

  describe('functional test', function() {
    before(function () {
      base = document.createElement('div')
      document.body.appendChild(base)
      base.innerHTML = '<h3>This main document for functional tests</h3><p>It must not be styled</p>'
    })

    it('functional test', function () {
      require('./fixtures/functional/elasto-layout')
      var el = document.createElement('elasto-layout')
      base.appendChild(el)
    })
  })

})
