var elastomer = require('../../..')

module.exports = elastomer('elasto-bindtest', {
  html: require('./layout.html'),
  css: require('./style.css'),
  link: link
})

function link (scope, elasto) {
  var model
  scope.path = null
  elasto.watchProperty('model', function (_model) {
    if (_model !== model) {
      scope.path = _model.path
    }
  })

}
