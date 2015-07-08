/* global describe it  before */

var ElastoCss = require('../lib/elastocss.js')
var expect = require('expect.js')

function clean (src) {
  return src.replace(/\/\*# (sourceMappingURL|sourceURL)=.*(.|\n)*/, '').trim()
}

function check (source, expected) {
  source = clean(source.toString())
  expected = clean(expected.toString())
  var result = ElastoCss.transform(source, 'elasto-tag')
  // console.log('SOURCE:', source)
  // console.log('EXPECT:', expected)
  // console.log('RESULT:', result)
  expect(result).equal(expected)
}

describe('elastomer.ElastoCss', function () {
  it('01_host: should transform :host to localName', function () {
    check(require('./fixtures/elastocss/sources/01_host.css'), require('./fixtures/elastocss/expected/01_host.css'))
  })

  it('02_scope: should apply local scope to rules', function () {
    check(require('./fixtures/elastocss/sources/02_scope.css'), require('./fixtures/elastocss/expected/02_scope.css'))
  })

  it('03_pseudoclass: should preserve pseudo-class', function () {
    check(require('./fixtures/elastocss/sources/03_pseudoclass.css'), require('./fixtures/elastocss/expected/03_pseudoclass.css'))
  })

  it('04_mediaquery: should preserve mediaquery', function () {
    check(require('./fixtures/elastocss/sources/04_mediaquery.css'), require('./fixtures/elastocss/expected/04_mediaquery.css'))
  })

  it('05_keyframe: should preserve keyframe rules', function () {
    check(require('./fixtures/elastocss/sources/05_keyframe.css'), require('./fixtures/elastocss/expected/05_keyframe.css'))
  })

  it('06_deep: should remove deep and scope only local rules', function () {
    check(require('./fixtures/elastocss/sources/06_deep.css'), require('./fixtures/elastocss/expected/06_deep.css'))
  })

  it('07_content: should remove deep and scope only local rules', function () {
    check(require('./fixtures/elastocss/sources/07_content.css'), require('./fixtures/elastocss/expected/07_content.css'))
  })

  it('08_shadow: should remove deep and scope only local rules', function () {
    check(require('./fixtures/elastocss/sources/08_shadow.css'), require('./fixtures/elastocss/expected/08_shadow.css'))
  })

  describe.only('#getSelectors', function () {
    it('01_rawselectors: should return scoped css selectors', function() {
      var source = require('./fixtures/elastocss/selectors/01_rawselectors.css').toString()
      var ecss = ElastoCss.getInstance('elasto-tag', source)
      var selectors = ecss.getSelectors()
      console.log(selectors)
      expect(selectors).eql([".a", ".b", ".c",  "#local", "div", "span",  ".i"])
      // console.log('ok')
    })
  })
})
