function shadowElement(selector, multiple, baseElement) {
    function querySelectorAllDeep(selector) {
        return _querySelectorDeep(selector, true);
    }

    function querySelectorDeep(selector) {
        return _querySelectorDeep(selector);
    }

    function _querySelectorDeep(selector, findMany) {
        let lightElement = document.querySelector(selector);

        if (document.head.createShadowRoot || document.head.attachShadow) {
            // no need to do any special if selector matches something specific in light-dom
            if (!findMany && lightElement) {
                return lightElement;
            }
            // do best to support complex selectors and split the query
            const splitSelector = selector.match(/(([^\s\"']+\s*[,>+~]\s*)+|\'[^']*\'+|\"[^\"]*\"+|[^\s\"']+)+/g);

            const possibleElementsIndex = splitSelector.length - 1;
            const possibleElements = collectAllElementsDeep(splitSelector[possibleElementsIndex]);
            const findElements = findMatchingElement(splitSelector, possibleElementsIndex);
            if (findMany) {
                return possibleElements.filter(findElements);
            } else {
                return possibleElements.find(findElements);
            }
        } else {
            if (!findMany) {
                return lightElement;
            } else {
                return document.querySelectorAll(selector);
            }
        }
    }

    function findMatchingElement(splitSelector, possibleElementsIndex) {
        return (element) => {
            let position = possibleElementsIndex;
            let parent = element;
            let foundElement = false;
            while (parent) {
                const foundMatch = parent.matches(splitSelector[position]);
                if (foundMatch && position === 0) {
                    foundElement = true;
                    break;
                }
                if (foundMatch) {
                    position--;
                }
                parent = findParentOrHost(parent);
            }
            return foundElement;
        };
    }

    function findParentOrHost(element) {
        const parentNode = element.parentNode;
        return parentNode && (parentNode.host && parentNode.tagName != 'A') ? parentNode.host : parentNode === document ? null : parentNode;
    }

    function collectAllElementsDeep(selector = null) {
        const allElements = [];

        const findAllElements = function(nodes) {
            for (let i = 0, el; el = nodes[i]; ++i) {
                allElements.push(el);
                // If the element has a shadow root, dig deeper.
                if (el.shadowRoot) {
                    findAllElements(el.shadowRoot.querySelectorAll('*'));
                }
            }
        };
        findAllElements(document.querySelectorAll('*'));
        return selector ? allElements.filter(el => el.matches(selector)) : allElements;
    }
    var result = multiple ? querySelectorAllDeep(selector):
                   selector ? querySelectorDeep(selector):
                       (baseElement || document.documentElement);
    return result;
}

module.exports = {
  init: function(browser, overwrite) {

    function noSuchElement(result) {
      return {
        status: 7,
        type: 'NoSuchElement',
        message: 'An element could not be located on the page using the given search parameters.',
        state: 'failure',
        sessionId: result.sessionId,
        value: null,
        selector: result.selector
      }
    };

    function getLastResult() {
      const lastResult = (this.lastPromise && this.lastPromise.inspect().value)
        ? this.lastPromise.inspect().value.value
        : null;
      return lastResult;
    }

    browser.addCommand("shadowElement", function (selector, multiple) {
      const baseElement = getLastResult.apply(this);
      return this
        .execute(shadowElement, selector, multiple === true, baseElement)
        .then((result) => {
          const myResult = Object.assign({}, result, { selector: selector });
          return (myResult.value !== null) ? myResult : noSuchElement(myResult);
        });
    });

    browser.addCommand("shadowExecute", function(arg1, arg2) {
      if (typeof arg1 === 'function') {
        const elem = getLastResult.apply(this);
        return this.execute(arg1, elem);
      } else {
        return this
          .shadowElement(arg1)
          .then(r => this.execute(arg2, r.value));
      }
    });

    if (overwrite) {
      browser.addCommand("element", function (s) {
        return this.shadowElement(s);
      }, true);

      browser.addCommand("elements", function(s) {
        return this.shadowElement(s, true);
      }, true);
    }

    return browser;
  }
};
