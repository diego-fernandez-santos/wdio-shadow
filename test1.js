const wdio = require('webdriverio');
const commands = require('./commands');
const expect = require('chai').expect;

const options = { desiredCapabilities: { browserName: 'chrome' } };
const browser = commands.init.call(this, wdio.remote(options).init());

browser
  .url('https://shop.polymer-project.org/')
  .shadowElement('div:nth-child(2) > shop-button')
    .click()
  .waitUntil(() =>
    browser.shadowElement('shop-list-item').then(r =>
      r.value && r.value.length !== 0
        && browser.elementIdDisplayed(r.value.ELEMENT)
    ), 5000)
  .shadowElement('shop-list-item')
    .click()
  .shadowElement('shop-detail')
    .then(r => browser.execute(elem => elem.item.title, r.value))
    .then(r => console.log(`Product Title: ${r.value}`))
  .shadowElement('shop-detail')
    .then(r => browser.execute(elem => elem._addToCart(), r.value))
  .shadowElement('#header > app-toolbar > div.cart-btn-container > div')
    .then(r => browser.elementIdText(r.value.ELEMENT))
    .then(r => { expect(r.value).to.equal("1"); return r.value; } )
    .then(t => console.log(`Cart Count: ${t}`))
  .shadowExecute('shop-detail', elem => elem._addToCart())
  .shadowElement('#header > app-toolbar > div.cart-btn-container > div')
    .then(r => browser.elementIdText(r.value.ELEMENT))
    .then(r => { expect(r.value).to.equal("2"); return r.value; } )
    .then(t => console.log(`Cart Count: ${t}`))
  .catch(e => console.log(e))
  .end()
  ;
