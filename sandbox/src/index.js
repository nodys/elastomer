var domready = require('domready')

window.app = {
  debug: require('debug')
}

require('./style.css')()

domready(function() {
  require('./index.html')(document.body)
  require('./louise')
})
