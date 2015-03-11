process.env.DEBUG = (process.env.DEBUG || '') + ' servdev'
var servdev = require('nova-servdev')
var resolve = require('path').resolve

servdev({
  cwd: __dirname,
  entries: [resolve(__dirname,'./src/index.js')]
})
