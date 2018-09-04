const webdriverio = require('webdriverio');
const commands = require('./commands');

const options = { desiredCapabilities: { browserName: 'chrome' } };
const browser = commands(webdriverio.remote(options).init());

browser
  .url('https://shop.polymer-project.org/')
  .shadowElement('div:nth-child(2) > shop-button')
    .click()
  .waitUntil(() =>
      browser.shadowElement('shop-list-item').then(res =>
        res.value && res.value.length !== 0
          && browser.elementIdDisplayed(res.value.ELEMENT)
      )
   , 5000)
  .shadowElement('shop-list-item')
    .click()
  .shadowElement('shop-detail')
    .then(r => browser.execute(elem => elem.item.title, r.value))
    .then(r => console.log(r))
  .shadowElement('shop-detail')
    .then(r => browser.execute(elem => elem._addToCart(), r.value))
    .then(r => console.log(r))
  .shadowExecute('shop-detail', (elem) => elem._addToCart())
    .then(r => console.log(r))
    .catch(e => console.log(e))
  .end();
