var elastomer = require('../../../..')

require('../elasto-foo')
require('../elasto-qux')
require('../elasto-button')

module.exports = elastomer('elasto-layout', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  // scope.model = {
  //   ctx: {
  //     path: '/foo'
  //   }
  // }
  // window.scope = scope
  // window.watchy = elastomer.watchy
  //
  // elasto.watch('model.ctx.path', function (val, old) {
  //   console.log('watch A', val, old)
  // })
  //
  // elasto.watch('model.ctx.path', function (val, old) {
  //   console.log('watch B', val, old)
  // })

  // elasto.watch('model.ctx.path', function (val, old) {
  //   console.log('watch B', val, old)
  // })
  //
  // elasto.watch('model.ctx.path', function (val, old) {
  //   console.log('watch C', val, old)
  // })
  //
  // elasto.watch('model.ctx.path', function (val, old) {
  //   console.log('watch D', val, old)
  // })

  scope.handleRemove = function () {
    elasto.host.remove()
  }
}
