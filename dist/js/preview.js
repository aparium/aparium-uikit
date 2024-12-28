/*! UIkit 3.21.16 | https://www.getuikit.com | (c) 2014 - 2024 YOOtheme | MIT License */

(function (factory) {
  typeof define === 'function' && define.amd ? define('uikittest', factory) :
    factory();
})((function () {
  'use strict';

  const hyphenateRe = /\B([A-Z])/g;
  const hyphenate = memoize((str) => str.replace(hyphenateRe, "-$1").toLowerCase());
  const ucfirst = memoize((str) => str.charAt(0).toUpperCase() + str.slice(1));

  function startsWith(str, search) {
    var _a;
    return (_a = str == null ? void 0 : str.startsWith) == null ? void 0 : _a.call(str, search);
  }
  const {
    isArray,
    from: toArray
  } = Array;

  function isFunction(obj) {
    return typeof obj === "function";
  }

  function isObject(obj) {
    return obj !== null && typeof obj === "object";
  }

  function isWindow(obj) {
    return isObject(obj) && obj === obj.window;
  }

  function isDocument(obj) {
    return nodeType(obj) === 9;
  }

  function isNode(obj) {
    return nodeType(obj) >= 1;
  }

  function nodeType(obj) {
    return !isWindow(obj) && isObject(obj) && obj.nodeType;
  }

  function isString(value) {
    return typeof value === "string";
  }

  function isNumber(value) {
    return typeof value === "number";
  }

  function isNumeric(value) {
    return isNumber(value) || isString(value) && !isNaN(value - parseFloat(value));
  }

  function isUndefined(value) {
    return value === void 0;
  }

  function toFloat(value) {
    return parseFloat(value) || 0;
  }

  function toNode(element) {
    return element && toNodes(element)[0];
  }

  function toNodes(element) {
    return isNode(element) ? [element] : Array.from(element || []).filter(isNode);
  }

  function sumBy(array, iteratee) {
    return array.reduce(
      (sum, item) => sum + toFloat(isFunction(iteratee) ? iteratee(item) : item[iteratee]),
      0
    );
  }

  function memoize(fn) {
    const cache = /* @__PURE__ */ Object.create(null);
    return (key, ...args) => cache[key] || (cache[key] = fn(key, ...args));
  }

  function addClass(element, ...classes) {
    for (const node of toNodes(element)) {
      const add = toClasses(classes).filter((cls) => !hasClass(node, cls));
      if (add.length) {
        node.classList.add(...add);
      }
    }
  }

  function removeClass(element, ...classes) {
    for (const node of toNodes(element)) {
      const remove = toClasses(classes).filter((cls) => hasClass(node, cls));
      if (remove.length) {
        node.classList.remove(...remove);
      }
    }
  }

  function hasClass(element, cls) {
    [cls] = toClasses(cls);
    return toNodes(element).some((node) => node.classList.contains(cls));
  }

  function toClasses(str) {
    return str ? isArray(str) ? str.map(toClasses).flat() : String(str).split(" ").filter(Boolean) : [];
  }

  function attr(element, name, value) {
    var _a;
    if (isObject(name)) {
      for (const key in name) {
        attr(element, key, name[key]);
      }
      return;
    }
    if (isUndefined(value)) {
      return (_a = toNode(element)) == null ? void 0 : _a.getAttribute(name);
    } else {
      for (const el of toNodes(element)) {
        if (isFunction(value)) {
          value = value.call(el, attr(el, name));
        }
        if (value === null) {
          removeAttr(el, name);
        } else {
          el.setAttribute(name, value);
        }
      }
    }
  }

  function removeAttr(element, name) {
    toNodes(element).forEach((element2) => element2.removeAttribute(name));
  }

  function parent(element) {
    var _a;
    return (_a = toNode(element)) == null ? void 0 : _a.parentElement;
  }

  function filter(element, selector) {
    return toNodes(element).filter((element2) => matches(element2, selector));
  }

  function matches(element, selector) {
    return toNodes(element).some((element2) => element2.matches(selector));
  }

  function children(element, selector) {
    element = toNode(element);
    const children2 = element ? toArray(element.children) : [];
    return selector ? filter(children2, selector) : children2;
  }

  function index(element, ref) {
    return ref ? toNodes(element).indexOf(toNode(ref)) : children(parent(element)).indexOf(element);
  }

  function find(selector, context) {
    return toNode(_query(selector, toNode(context), "querySelector"));
  }

  function findAll(selector, context) {
    return toNodes(_query(selector, toNode(context), "querySelectorAll"));
  }
  const addStarRe = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g;
  const splitSelectorRe = /(\([^)]*\)|[^,])+/g;
  const parseSelector = memoize((selector) => {
    let isContextSelector = false;
    if (!selector || !isString(selector)) {
      return {};
    }
    const selectors = [];
    for (let sel of selector.match(splitSelectorRe)) {
      sel = sel.trim().replace(addStarRe, "$1 *");
      isContextSelector || (isContextSelector = ["!", "+", "~", "-", ">"].includes(sel[0]));
      selectors.push(sel);
    }
    return {
      selector: selectors.join(","),
      selectors,
      isContextSelector
    };
  });
  const positionRe = /(\([^)]*\)|\S)*/;
  const parsePositionSelector = memoize((selector) => {
    selector = selector.slice(1).trim();
    const [position] = selector.match(positionRe);
    return [position, selector.slice(position.length + 1)];
  });

  function _query(selector, context = document, queryFn) {
    const parsed = parseSelector(selector);
    if (!parsed.isContextSelector) {
      return parsed.selector ? _doQuery(context, queryFn, parsed.selector) : selector;
    }
    selector = "";
    const isSingle = parsed.selectors.length === 1;
    for (let sel of parsed.selectors) {
      let positionSel;
      let ctx = context;
      if (sel[0] === "!") {
        [positionSel, sel] = parsePositionSelector(sel);
        ctx = context.parentElement.closest(positionSel);
        if (!sel && isSingle) {
          return ctx;
        }
      }
      if (ctx && sel[0] === "-") {
        [positionSel, sel] = parsePositionSelector(sel);
        ctx = ctx.previousElementSibling;
        ctx = matches(ctx, positionSel) ? ctx : null;
        if (!sel && isSingle) {
          return ctx;
        }
      }
      if (!ctx) {
        continue;
      }
      if (isSingle) {
        if (sel[0] === "~" || sel[0] === "+") {
          sel = `:scope > :nth-child(${index(ctx) + 1}) ${sel}`;
          ctx = ctx.parentElement;
        } else if (sel[0] === ">") {
          sel = `:scope ${sel}`;
        }
        return _doQuery(ctx, queryFn, sel);
      }
      selector += `${selector ? "," : ""}${domPath(ctx)} ${sel}`;
    }
    if (!isDocument(context)) {
      context = context.ownerDocument;
    }
    return _doQuery(context, queryFn, selector);
  }

  function _doQuery(context, queryFn, selector) {
    try {
      return context[queryFn](selector);
    } catch (e) {
      return null;
    }
  }

  function domPath(element) {
    const names = [];
    while (element.parentNode) {
      const id = attr(element, "id");
      if (id) {
        names.unshift(`#${escape(id)}`);
        break;
      } else {
        let {
          tagName
        } = element;
        if (tagName !== "HTML") {
          tagName += `:nth-child(${index(element) + 1})`;
        }
        names.unshift(tagName);
        element = element.parentNode;
      }
    }
    return names.join(" > ");
  }

  function escape(css) {
    return isString(css) ? CSS.escape(css) : "";
  }

  function on(...args) {
    let [targets, types, selector, listener, useCapture = false] = getArgs(args);
    if (listener.length > 1) {
      listener = detail(listener);
    }
    if (useCapture == null ? void 0 : useCapture.self) {
      listener = selfFilter(listener);
    }
    if (selector) {
      listener = delegate(selector, listener);
    }
    for (const type of types) {
      for (const target of targets) {
        target.addEventListener(type, listener, useCapture);
      }
    }
    return () => off(targets, types, listener, useCapture);
  }

  function off(...args) {
    let [targets, types, , listener, useCapture = false] = getArgs(args);
    for (const type of types) {
      for (const target of targets) {
        target.removeEventListener(type, listener, useCapture);
      }
    }
  }

  function getArgs(args) {
    args[0] = toEventTargets(args[0]);
    if (isString(args[1])) {
      args[1] = args[1].split(" ");
    }
    if (isFunction(args[2])) {
      args.splice(2, 0, false);
    }
    return args;
  }

  function delegate(selector, listener) {
    return (e) => {
      const current = selector[0] === ">" ? findAll(selector, e.currentTarget).reverse().find((element) => element.contains(e.target)) : e.target.closest(selector);
      if (current) {
        e.current = current;
        listener.call(this, e);
        delete e.current;
      }
    };
  }

  function detail(listener) {
    return (e) => isArray(e.detail) ? listener(e, ...e.detail) : listener(e);
  }

  function selfFilter(listener) {
    return function (e) {
      if (e.target === e.currentTarget || e.target === e.current) {
        return listener.call(null, e);
      }
    };
  }

  function isEventTarget(target) {
    return target && "addEventListener" in target;
  }

  function toEventTarget(target) {
    return isEventTarget(target) ? target : toNode(target);
  }

  function toEventTargets(target) {
    return isArray(target) ? target.map(toEventTarget).filter(Boolean) : isString(target) ? findAll(target) : isEventTarget(target) ? [target] : toNodes(target);
  }

  const cssNumber = {
    "animation-iteration-count": true,
    "column-count": true,
    "fill-opacity": true,
    "flex-grow": true,
    "flex-shrink": true,
    "font-weight": true,
    "line-height": true,
    opacity: true,
    order: true,
    orphans: true,
    "stroke-dasharray": true,
    "stroke-dashoffset": true,
    widows: true,
    "z-index": true,
    zoom: true
  };

  function css(element, property, value, priority) {
    const elements = toNodes(element);
    for (const element2 of elements) {
      if (isString(property)) {
        property = propName(property);
        if (isUndefined(value)) {
          return getComputedStyle(element2).getPropertyValue(property);
        } else {
          element2.style.setProperty(
            property,
            isNumeric(value) && !cssNumber[property] ? `${value}px` : value || isNumber(value) ? value : "",
            priority
          );
        }
      } else if (isArray(property)) {
        const props = {};
        for (const prop of property) {
          props[prop] = css(element2, prop);
        }
        return props;
      } else if (isObject(property)) {
        for (const prop in property) {
          css(element2, prop, property[prop], value);
        }
      }
    }
    return elements[0];
  }
  const propName = memoize((name) => {
    if (startsWith(name, "--")) {
      return name;
    }
    name = hyphenate(name);
    const {
      style
    } = document.documentElement;
    if (name in style) {
      return name;
    }
    for (const prefix of ["webkit", "moz"]) {
      const prefixedName = `-${prefix}-${name}`;
      if (prefixedName in style) {
        return prefixedName;
      }
    }
  });

  const prepend = applyFn("prepend");

  function applyFn(fn) {
    return function (ref, element) {
      var _a;
      const nodes = toNodes(isString(element) ? fragment(element) : element);
      (_a = $(ref)) == null ? void 0 : _a[fn](...nodes);
      return unwrapSingle(nodes);
    };
  }
  const singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

  function fragment(html2) {
    const matches = singleTagRe.exec(html2);
    if (matches) {
      return document.createElement(matches[1]);
    }
    const container = document.createElement("template");
    container.innerHTML = html2.trim();
    return unwrapSingle(container.content.childNodes);
  }

  function unwrapSingle(nodes) {
    return nodes.length > 1 ? nodes : nodes[0];
  }

  function $(selector, context) {
    return isHtml(selector) ? toNode(fragment(selector)) : find(selector, context);
  }

  function $$(selector, context) {
    return isHtml(selector) ? toNodes(fragment(selector)) : findAll(selector, context);
  }

  function isHtml(str) {
    return isString(str) && startsWith(str.trim(), "<");
  }

  const dirs = {
    width: ["left", "right"],
    height: ["top", "bottom"]
  };

  dimension("height");
  dimension("width");

  function dimension(prop) {
    const propName = ucfirst(prop);
    return (element, value) => {
      if (isUndefined(value)) {
        if (isWindow(element)) {
          return element[`inner${propName}`];
        }
        if (isDocument(element)) {
          const doc = element.documentElement;
          return Math.max(doc[`offset${propName}`], doc[`scroll${propName}`]);
        }
        element = toNode(element);
        value = css(element, prop);
        value = value === "auto" ? element[`offset${propName}`] : toFloat(value) || 0;
        return value - boxModelAdjust(element, prop);
      } else {
        return css(
          element,
          prop,
          !value && value !== 0 ? "" : +value + boxModelAdjust(element, prop) + "px"
        );
      }
    };
  }

  function boxModelAdjust(element, prop, sizing = "border-box") {
    return css(element, "boxSizing") === sizing ? sumBy(
      dirs[prop],
      (prop2) => toFloat(css(element, `padding-${prop2}`)) + toFloat(css(element, `border-${prop2}-width`))
    ) : 0;
  }

  const tests = ["accordion", "alert", "align", "animation", "aparium-test", "article", "background", "badge", "base", "breadcrumb", "button", "card", "close", "column", "comment", "container", "countdown", "cover", "customizer", "description-list", "divider", "dotnav", "drop", "dropbar", "dropdown", "dropnav", "filter", "flex", "form", "grid-masonry", "grid-parallax", "grid", "heading", "height-expand", "height-viewport", "height", "icon", "iconnav", "image", "label", "leader", "lightbox", "link", "list", "margin", "marker", "modal", "nav", "navbar", "notification", "offcanvas", "overlay", "padding", "pagination", "parallax", "placeholder", "position", "progress", "scroll", "scrollspy", "search", "section", "slidenav", "slider", "slideshow", "sortable", "spinner", "sticky-navbar", "sticky-parallax", "sticky", "subnav", "svg", "switcher", "tab", "table", "test_2", "text", "thumbnav", "tile", "toggle", "tooltip", "totop", "transition", "upload", "utility", "video", "visibility", "width"];

  const storage = window.sessionStorage;
  const key = "_uikit_style";
  const keyinverse = "_uikit_inverse";

  // Initialize themes
let themes = {};

// Wrap fetch call in an async IIFE (Immediately Invoked Function Expression)
(async function loadThemes() {
  try {
    const response = await fetch('../themes.json');
    if (response.ok) {
      themes = await response.json();
    }
  } catch (error) {
    console.error('Failed to load themes.json:', error);
  }
})();


// Define styles
const styles = {
  core: {
    css: 'https://cdn.jsdelivr.net/gh/aparium/css-style/css/uikit-core.min.css'
  },
  theme: {
    css: 'https://cdn.jsdelivr.net/gh/aparium/css-style/css/uikit.min.css'
  },
  // Assuming `themes` is an object containing additional theme URLs
  ...themes,
};

// Function to load CSS dynamically
function loadCSS(href, callback) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.onload = callback;
  link.onerror = () => console.error(`Failed to load CSS: ${href}`);
  document.head.appendChild(link);
}

// Load the core and theme styles sequentially
loadCSS(styles.core.css, () => {
  console.log('Core CSS loaded.');
  loadCSS(styles.theme.css, () => {
    console.log('Theme CSS loaded.');

    // Now proceed with the rest of your script
    initializeUIkit();
  });
});

// Function to initialize UIkit and other logic
function initializeUIkit() {
  const scriptUIkit = document.createElement('script');
  scriptUIkit.src = 'https://cdn.jsdelivr.net/gh/aparium/css-style/js/uikit.min.js';
  scriptUIkit.onload = () => {
    console.log('UIkit script loaded.');

    const scriptIcons = document.createElement('script');
    scriptIcons.src = 'https://cdn.jsdelivr.net/gh/aparium/css-style/js/uikit-icons.min.js';
    scriptIcons.onload = () => {
      console.log('UIkit Icons script loaded.');
    };
    document.body.appendChild(scriptIcons);
  };
  document.body.appendChild(scriptUIkit);
}

// Set document direction
const dir = storage._uikit_dir || 'ltr';
document.dir = dir;

// Load selected stylesheet
const style = styles[storage[key]] || styles.theme;
document.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = dir !== 'rtl' ? style.css : style.css.replace('.css', '-rtl.css');
  document.head.appendChild(link);
// Add inline style for component switcher
const styleElement = document.createElement('style');
styleElement.textContent = `html:not(:has(body :first-child [aria-label="Component switcher"])) { padding-top: 80px; }`;
document.head.appendChild(styleElement);
});

document.addEventListener('DOMContentLoaded', () => {
  const scriptUIkit = document.createElement('script');
  scriptUIkit.src = 'https://cdn.jsdelivr.net/gh/aparium/css-style/js/uikit.min.js';
  document.body.appendChild(scriptUIkit);

  const scriptIcons = document.createElement('script');
  scriptIcons.src = style.icons || 'https://cdn.jsdelivr.net/gh/aparium/css-style/js/uikit-icons.min.js';
  document.body.appendChild(scriptIcons);
});


  // UI Initialization
  on(window, 'load', () => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        const $container = prepend(document.body, `\n  <div class="uk-container">\n<select class="uk-select uk-form-width-small" style="margin: 20px 20px 20px 0" aria-label="Component switcher">\n<option value="index.html">Overview</option>\n${tests.map((e => `<option value="${e}.html">${e.split("-").map(ucfirst).join(" ")}</option>`)).join("")}\n</select>\n<select class="uk-select uk-form-width-small" style="margin: 20px" aria-label="Theme switcher">\n${Object.keys(styles).map((e => `<option value="${e}">${ucfirst(e)}</option>`)).join("")}\n</select>\n<select class="uk-select uk-form-width-small" style="margin: 20px" aria-label="Inverse switcher">\n${Object.keys(variations).map((e => `<option value="${e}">${variations[e]}</option>`)).join("")}\n</select>\n<label style="margin: 20px">\n<input type="checkbox" class="uk-checkbox"/>\n<span style="margin: 5px">RTL</span>\n</label>\n</div>\n`);
        const [$tests, $styles, $inverse, $rtl] = $container.children;
        // Handle component switching
        on($tests, 'change', () => {
          if ($tests.value) {
            location.href = `${$tests.value}${styles.custom ? `?style=${getParam('style')}` : ''}`;
          }
        });
        $tests.value = `${component || 'index'}.html`;
        // Handle style switching
        on($styles, 'change', () => {
          storage[key] = $styles.value;
          location.reload();
        });
        $styles.value = storage[key];
        // Handle variations
        $inverse.value = storage[keyinverse];
        if ($inverse.value) {
          removeClass(
            $$('*'),
            'uk-card-default', 'uk-card-muted', 'uk-card-primary', 'uk-card-secondary',
            'uk-tile-default', 'uk-tile-muted', 'uk-tile-primary', 'uk-tile-secondary',
            'uk-section-default', 'uk-section-muted', 'uk-section-primary', 'uk-section-secondary',
            'uk-overlay-default', 'uk-overlay-primary',
          );
          addClass($$('.uk-navbar-container'), 'uk-navbar-transparent');
          css(document.documentElement, 'background', $inverse.value === 'dark' ? '#fff' : '#222');
          addClass(document.body, `uk-${$inverse.value}`);
        }
        on($inverse, 'change', () => {
          storage[keyinverse] = $inverse.value;
          location.reload();
        });
        // Handle RTL
        on($rtl, 'change', ({
          target
        }) => {
          storage._uikit_dir = target.checked ? 'rtl' : 'ltr';
          location.reload();
        });
        $rtl.firstElementChild.checked = dir === 'rtl';
      });
    }, 100);
  });

  function getParam(name) {
    const match = new RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
}));