const shadowElement = require('./shadow');

module.exports = function(browser) {
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

  return browser;
};
