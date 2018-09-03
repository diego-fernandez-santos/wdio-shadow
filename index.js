var webdriverio = require('webdriverio');
var shadowElement = require('./shadow');

var options = { desiredCapabilities: { browserName: 'chrome' } };
var browser = webdriverio.remote(options).init();

function getLastResult() {
  const lastResult = (this.lastPromise && this.lastPromise.inspect().value)
    ? this.lastPromise.inspect().value.value
    : null;

  return lastResult;
}
  
browser.addCommand("shadowElement", (selector) => {
  const baseElement = getLastResult.apply(this);
  return browser
    .execute(shadowElement, selector, false, baseElement)
    .then(result => Object.assign({}, result, { selector: selector }));
});

browser.addCommand("shadowExecute", (selector, f) => {
  return browser
    .shadowElement(selector)
    .then(r => browser.execute(f, r.value))
});

browser
  .url('https://shop.polymer-project.org/')
//  .timeouts('implicit', 5000)
//  .element('not-exists')
//  .click()
  .shadowElement('div:nth-child(2) > shop-button')
  .click()
  .waitUntil(() => {
      return browser.shadowElement('shop-list-item').then(res => {
        if (!res.value || res.value.length === 0) {
            return false
        }
        return browser.elementIdDisplayed(res.value.ELEMENT);
      });
   }, 5000)
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
//  .end()
  ;
