var elastomer = require('../../..')

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
    scope.hello = 'Foob'
  }, 1000)
}
