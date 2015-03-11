
var elastomer = require('nova-elastomer')

var Louise = module.exports = elastomer('x-louise', {
  html: `<div>LOUISE</div>`,
  css:  `div{ background: #d4d0d6 }`,
  link: function() {
    console.log('Link louise')
  }
})
