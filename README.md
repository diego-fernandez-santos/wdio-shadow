Examples of how to handle shadow DOM elements with webdriverio.

- To run the example launch the following commands:

```
npm i
node test1.js
node test2.js
```

- test2.js

```
const wdio = require('webdriverio');
const commands = require('./commands');
const expect = require('chai').expect;

const options = { desiredCapabilities: { browserName: 'chrome' } };
const browser = commands.init.call(this, wdio.remote(options).init(), true);
 
browser
  .url('https://shop.polymer-project.org/')
  .click('div:nth-child(2) > shop-button')
  .waitUntil(() => browser.isVisible('shop-list-item'), 5000)
  .click('shop-list-item')
  .element('shop-detail')
    .then(r => browser.execute(elem => elem.item.title, r.value))
    .then(r => console.log(`Product Title: ${r.value}`))
  .element('#content > div > shop-button > button')
      .click()
  .getText('#header > app-toolbar > div.cart-btn-container > div')
    .then(t => { expect(t).to.equal("1"); return t; } )
    .then(t => console.log(`Cart Count: ${t}`))
  .element('shop-detail')
      .shadowExecute(elem => elem._addToCart())
  .getText('#header > app-toolbar > div.cart-btn-container > div')
    .then(t => { expect(t).to.equal("2"); return t; } )
    .then(t => console.log(`Cart Count: ${t}`))
 .shadowExecute('shop-detail', elem => elem._addToCart())
  .getText('#header > app-toolbar > div.cart-btn-container > div')
    .then(t => { expect(t).to.equal("3"); return t; } )
    .then(t => console.log(`Cart Count: ${t}`))
  .catch(e => console.log(e))
  .end()
```

# Credit

This project is based on [query-selector-shadow-dom](https://www.npmjs.com/package/query-selector-shadow-dom).


