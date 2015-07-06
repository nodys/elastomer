var domready = require('domready')

require('webcomponents.js/webcomponents-lite.min.js')

window.app = {
  debug: require('debug')
}

require('./style.css')()

domready(function() {
  require('./index.html')(document.body)
  require('./louise')
})
