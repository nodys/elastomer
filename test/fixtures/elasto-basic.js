// var elastomer = require('../..')
//
// class ElastoBasic extends elastomer.HTMLElastomer {
//   initialize (elasto) {
//     elasto.html = `<div id="outer">{{hello}} <content></content></div>`
//     elasto.css = `#outer {
//       display: block;
//       position: absolute;
//       width: 90px;
//       height: 90px;
//       background-color: #F00BA5;
//     }`
//   }
//
//   link (scope, elasto) {
//     scope.hello = 'Hello'
//     setTimeout(function () {
//       scope.hello = "Foob"
//       elasto.update()
//     },1000)
//   }
// }
//
// module.exports = elastomer('elasto-basic', { prototype: ElastoBasic.prototype })


var elastomer = require('../..')

module.exports = elastomer('elasto-basic', {
  html: '<div id="outer">{{hello}} <content></content></div>',
  css: '#outer {\n' +
   ' display: block;\n' +
   ' position: absolute;\n' +
   ' width: 90px;\n' +
   ' height: 90px;\n' +
   ' background-color: #F00BA5;\n' +
   '}',
  link: link
})

function link (scope, elasto) {
  scope.hello = 'Hello'
  setTimeout(function () {
    scope.hello = "Foob"
    elasto.update()
  },1000)
}
