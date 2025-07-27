// Content script for additional monitoring and page analysis
(function() {
  'use strict';

  let isMonitoring = false;
  let originalFetch = window.fetch;
  let originalXHROpen = XMLHttpRequest.prototype.open;
  let originalXHRSend = XMLHttpRequest.prototype.send;
  let domObserver = null;
  let messageQueue = [];
  let lastMessageTime = 0;
  const MESSAGE_THROTTLE_MS = 100; // Throttle messages to prevent spam
  const MAX_CONTENT_LENGTH = 50000; // Limit content size to prevent memory issues

  // Rate limiting for messages
  function throttledSendMessage(message, callback) {
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_THROTTLE_MS) {
      // Queue message instead of sending immediately
      messageQueue.push({ message, callback, timestamp: now });
      return;
    }
    
    lastMessageTime = now;
    sendMessageSafely(message, callback);
  }

  // Process queued messages
  function processMessageQueue() {
    if (messageQueue.length === 0) return;
    
    const now = Date.now();
    const messagesToSend = messageQueue.filter(item => now - item.timestamp > MESSAGE_THROTTLE_MS);
    
    if (messagesToSend.length > 0) {
      // Send only the most recent message of each type to avoid spam
      const uniqueMessages = new Map();
      messagesToSend.forEach(item => {
        const key = item.message.type + (item.message.url || '');
        uniqueMessages.set(key, item);
      });
      
      uniqueMessages.forEach(item => {
        sendMessageSafely(item.message, item.callback);
      });
      
      // Remove processed messages
      messageQueue = messageQueue.filter(item => !messagesToSend.includes(item));
      lastMessageTime = now;
    }
  }

  // Process queue periodically
  setInterval(processMessageQueue, MESSAGE_THROTTLE_MS);

  // Safe message sending with error handling
  function sendMessageSafely(message, callback) {
    try {
      if (chrome.runtime && chrome.runtime.id) {
        // Limit content size to prevent crashes
        if (message.content && message.content.length > MAX_CONTENT_LENGTH) {
          message.content = message.content.substring(0, MAX_CONTENT_LENGTH) + '... [truncated]';
        }
        if (message.responseText && message.responseText.length > MAX_CONTENT_LENGTH) {
          message.responseText = message.responseText.substring(0, MAX_CONTENT_LENGTH) + '... [truncated]';
        }
        
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            // Extension context invalidated, ignore silently
            return;
          }
          if (callback) callback(response);
        });
      }
    } catch (error) {
      // Extension context invalidated, ignore silently
    }
  }

  // Initialize content script
  function init() {
    if (isMonitoring) return;
    isMonitoring = true;

    // Scan initial page content (throttled)
    setTimeout(() => scanPageContent(), 1000);
    
    // Monitor DOM changes (optimized)
    observeDOM();
    
    // Intercept network requests (optimized)
    interceptFetch();
    interceptXHR();
    
    // Inject script for deeper monitoring
    injectMonitoringScript();
    
    console.log('API Key Hunter: Content script initialized');
  }

  // Scan current page content for API keys (optimized)
  function scanPageContent() {
    try {
      // Only scan script tags and specific elements, not entire HTML
      const scripts = document.querySelectorAll('script[src], script:not([src])');
      let scriptCount = 0;
      
      scripts.forEach((script) => {
        if (scriptCount >= 10) return; // Limit to prevent spam
        
        if (script.textContent && script.textContent.trim().length > 50) {
          throttledSendMessage({
            type: 'SCAN_PAGE_CONTENT',
            content: script.textContent,
            url: window.location.href + `#script-${scriptCount}`
          });
          scriptCount++;
        }
      });

      // Scan localStorage and sessionStorage
      try {
        for (let i = 0; i < localStorage.length && i < 20; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          if (value && value.length > 20 && value.length < 1000) {
            throttledSendMessage({
              type: 'SCAN_PAGE_CONTENT',
              content: value,
              url: window.location.href + `#localStorage-${key}`
            });
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }

    } catch (error) {
      console.error('API Key Hunter: Error scanning page content:', error);
    }
  }

  // Monitor DOM changes for dynamically loaded content (optimized)
  function observeDOM() {
    if (domObserver) {
      domObserver.disconnect();
    }

    domObserver = new MutationObserver((mutations) => {
      let scriptCount = 0;
      
      mutations.forEach((mutation) => {
        if (scriptCount >= 5) return; // Limit processing per batch
        
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Only scan script tags and specific high-value elements
            if (node.tagName === 'SCRIPT' && node.textContent && node.textContent.trim().length > 50) {
              throttledSendMessage({
                type: 'SCAN_PAGE_CONTENT',
                content: node.textContent,
                url: window.location.href + '#dynamic-script'
              });
              scriptCount++;
            }
            
            // Scan for nested scripts but limit depth
            if (scriptCount < 3) {
              const nestedScripts = node.querySelectorAll && node.querySelectorAll('script');
              if (nestedScripts && nestedScripts.length > 0 && nestedScripts.length < 5) {
                nestedScripts.forEach((script) => {
                  if (script.textContent && script.textContent.trim().length > 50) {
                    throttledSendMessage({
                      type: 'SCAN_PAGE_CONTENT',
                      content: script.textContent,
                      url: window.location.href + '#nested-script'
                    });
                    scriptCount++;
                  }
                });
              }
            }
          }
        });
      });
    });

    if (document.body) {
      domObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // Intercept fetch requests (optimized)
  function interceptFetch() {
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // Only process text responses and limit size
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text') &&
            !contentType.includes('json') &&
            !contentType.includes('javascript')) {
          return response;
        }
        
        // Clone response to read it without consuming the original
        const clonedResponse = response.clone();
        
        // Try to read response text with size limit
        try {
          const responseText = await clonedResponse.text();
          if (responseText && responseText.length > 20 && responseText.length < MAX_CONTENT_LENGTH) {
            throttledSendMessage({
              type: 'SCAN_NETWORK_RESPONSE',
              responseText: responseText,
              url: response.url || args[0]
            });
          }
        } catch (readError) {
          // Ignore errors reading response body
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };
  }

  // Intercept XMLHttpRequest (optimized)
  function interceptXHR() {
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._url = url;
      this._method = method;
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(data) {
      // Monitor request data with size limit
      if (data && typeof data === 'string' && data.length > 20 && data.length < MAX_CONTENT_LENGTH) {
        throttledSendMessage({
          type: 'SCAN_NETWORK_RESPONSE',
          responseText: data,
          url: this._url || window.location.href + '#xhr-request'
        });
      }
  
      // Monitor response with size limit
      this.addEventListener('load', function() {
        if (this.responseText && this.responseText.length > 20 && this.responseText.length < MAX_CONTENT_LENGTH) {
          throttledSendMessage({
            type: 'SCAN_NETWORK_RESPONSE',
            responseText: this.responseText,
            url: this._url || window.location.href + '#xhr-response'
          });
        }
      });

      return originalXHRSend.apply(this, arguments);
    };
  }

  // Inject monitoring script into page context
  function injectMonitoringScript() {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('injected.js');
      script.onload = function() {
        this.remove();
      };
      script.onerror = function() {
        this.remove();
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (error) {
      // Ignore injection errors
    }
  }

  // Cleanup function
  function cleanup() {
    if (domObserver) {
      domObserver.disconnect();
      domObserver = null;
    }
    isMonitoring = false;
    messageQueue = [];
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case 'NEW_KEYS_FOUND':
        console.log('API Key Hunter: New keys found:', request.keys);
        break;
        
      case 'RESCAN_PAGE':
        scanPageContent();
        sendResponse({ success: true });
        break;
        
      case 'CLEANUP':
        cleanup();
        sendResponse({ success: true });
        break;
        
      default:
        break;
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();