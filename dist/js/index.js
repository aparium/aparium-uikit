/* global TESTS */
import{$$,addClass,css,on,prepend,removeClass,ucfirst} from './uikit-util';
const tests = tests;
const storage = window.sessionStorage;
const key = '_uikit_style';
const keyinverse = '_uikit_inverse';

storage[key] = storage[key] || 'core';
storage[keyinverse] = storage[keyinverse] || '';

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
  scriptUIkit.src = 'https://cdn.jsdelivr.net/gh/aparium/css-style/js/uikit.js';
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


const component = location.pathname.split('/').pop().replace(/.html$/, '');
const variations={"":"Default",light:"Dark",dark:"Light"};
// Handle style parameters
if (getParam('style') && getParam('style').match(/\.(json|css)$/)) {
  styles.custom = getParam('style');
}

// Set document direction
const dir = storage._uikit_dir || 'ltr';
document.dir = dir;
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
      on($rtl, 'change', ({ target }) => {
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