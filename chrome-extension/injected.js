// Injected script for deep page monitoring
(function() {
  'use strict';

  // Helper to send data to the content script
  function sendScanData(data, source) {
    window.postMessage({
      type: 'API_KEY_HUNTER_SCAN',
      content: data,
      source: source
    }, window.location.origin);
  }

  // Monitor console logs
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    args.forEach(arg => {
      if (typeof arg === 'string' || (arg instanceof String)) {
        sendScanData(arg, 'console.log');
      } else {
        try {
          const jsonString = JSON.stringify(arg);
          sendScanData(jsonString, 'console.log-object');
        } catch (e) {
            // Ignore circular reference errors
        }
      }
    });
    originalConsoleLog.apply(this, args);
  };
  
  // Monitor localStorage and sessionStorage
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (typeof value === 'string' || (value instanceof String)) {
      sendScanData(value, this === localStorage ? 'localStorage' : 'sessionStorage');
    }
    originalSetItem.apply(this, arguments);
  };

})();