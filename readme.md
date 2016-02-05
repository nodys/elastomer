# elastomer
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

[npm-image]: https://img.shields.io/npm/v/elastomer.svg?style=flat
[npm-url]: https://npmjs.org/package/elastomer
[downloads-image]: https://img.shields.io/npm/dm/elastomer.svg?style=flat
[downloads-url]: https://npmjs.org/package/elastomer

A web-component library for commonjs based on rivet

## Overview

**ALPHA version - incomplete doc / incomplete tests**

- Create web-components in commonjs
- Elastomer is like a light [polymer](https://www.polymer-project.org/) + [rivets](http://rivetsjs.com/)

## Getting Started

Install the module with: `npm install elastomer --save`

## Getting Started

```javascript
'use strict'
const elastomer = require('nova-elastomer')

require('nova-elastomer/webcomponents-lite.js') // Optional

class Foobar extends elastomer.HTMLElastomer {
  initialize (elasto) {
    elasto.html = `
    <h2>{{title}}</h2>
    <ul>
      <li nv-each-item="list">{{item.label}}</li>
    </ul>
    <content></content>`
    elasto.css = `:host {}`
  }

  link (scope, elasto) {
    scope.list = [
      { label: 'A' },
      { label: 'B' }
    ]
    elasto.mapAttribute('title')
  }
}

module.exports = elastomer('nova-foobar', { prototype: Foobar.prototype })
```


Now you can use the new `<nova-foobar>` tag

```html
<div>
  <nova-foobar title="Hello world">
    <p>The future is now</p>
  </nova-foobar>
</div>
```

The pseudo-dom produced looks like:

```html
<div>
  <nova-foobar title="Hello world">
    <h2>Hello world</h2>
    <ul>
      <li>A</li>
      <li>B</li>
    </ul>
    <p>The future is now</p>
  </nova-foobar>
</div>
```

---

License: [MIT](./LICENSE)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
