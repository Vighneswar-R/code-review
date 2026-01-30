// console.log = function () {};
// console.debug = function () {};
// console.info = function () {};
// console.warn = function () {};
// console.error = function () {};

// utils/disableConsole.js

    // Overriding all console methods
    ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
      console[method] = () => {};
    });
      console.assert = () => {};
    console.trace = () => {};
    window.onunhandledrejection = (e) => e.preventDefault();
