// API Key patterns from the provided data
const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    pattern: /(sk-proj-\S{156}|sk-proj-\S{124}|sk-proj-\S{48}|sk-[a-zA-Z0-9]{48})/g,
    example: 'sk-proj-xxx... или sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://api.openai.com',
    description: 'OpenAI официальный API, поддерживает модели GPT серии, включая GPT-4, GPT-3.5 и др.'
  },
  claude: {
    name: 'Claude (Anthropic)',
    pattern: /sk-ant-api03-\S{95}/g,
    example: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://api.anthropic.com',
    description: 'API модели Claude AI от Anthropic, поддерживает Claude-3.5-Sonnet и другие высококачественные диалоговые модели'
  },
  gemini: {
    name: 'Google Gemini',
    pattern: /AIzaSy\S{33}/g,
    example: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://generativelanguage.googleapis.com',
    description: 'API модели Google Gemini AI, поддерживает мультимодальный ввод и эффективное рассуждение'
  },
  deepseek: {
    name: 'DeepSeek',
    pattern: /sk-[a-zA-Z0-9]{32}/g,
    example: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://api.deepseek.com',
    description: 'API модели DeepSeek AI, специализируется на генерации кода и диалогах, высокая производительность'
  },
  groq: {
    name: 'Groq',
    pattern: /gsk_[a-zA-Z0-9]{52}/g,
    example: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://api.groq.com',
    description: 'API высокоскоростного вывода Groq, обеспечивает сверхбыструю скорость вывода модели'
  },
  siliconflow: {
    name: 'SiliconFlow',
    pattern: /sk-[a-zA-Z0-9]{48}/g,
    example: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://api.siliconflow.cn',
    description: 'Платформа API модели SiliconFlow AI, предоставляет различные сервисы моделей с открытым исходным кодом'
  },
  xai: {
    name: 'xAI (Grok)',
    pattern: /xai-[a-zA-Z0-9]{80}/g,
    example: 'xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://api.x.ai',
    description: 'API модели Grok от xAI, обладает возможностями получения информации в реальном времени'
  },
  openrouter: {
    name: 'OpenRouter',
    pattern: /sk-or-v1-[a-f0-9]{64}/g,
    example: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://openrouter.ai/api',
    description: 'Платформа агрегации API OpenRouter с несколькими моделями, один ключ для доступа к различным моделям AI'
  }
};

// Storage for found keys
let foundKeys = [];
let keyCount = 0;

// Default excluded domains and patterns
const DEFAULT_EXCLUDED_DOMAINS = [
  'google.com',
  'googleapis.com',
  'gstatic.com',
  'googleusercontent.com',
  'youtube.com',
  'yandex.ru',
  'yandex.com',
  'ya.ru',
  'mail.ru',
  'vk.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'microsoft.com',
  'live.com',
  'outlook.com',
  'apple.com',
  'icloud.com',
  'amazon.com',
  'aws.amazon.com',
  'cloudflare.com',
  'github.com',
  'gitlab.com',
  'stackoverflow.com',
  'reddit.com',
  'discord.com',
  'telegram.org',
  'whatsapp.com'
];

const DEFAULT_EXCLUDED_PATTERNS = [
  'test-*',
  'demo-*',
  'example-*',
  'sample-*',
  'fake-*',
  'mock-*',
  '*-test',
  '*-demo',
  '*-example',
  '*-sample'
];

// Settings
let settings = {
  excludedDomains: DEFAULT_EXCLUDED_DOMAINS.join('\n'),
  excludedPatterns: DEFAULT_EXCLUDED_PATTERNS.join('\n'),
  enableMonitoring: true,
  providers: {
    openai: true,
    claude: true,
    gemini: true,
    deepseek: true,
    groq: true,
    siliconflow: true,
    xai: true,
    openrouter: true
  }
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('API Key Hunter extension installed');
  initializeStorage();
});

// Initialize storage
async function initializeStorage() {
  try {
    const result = await chrome.storage.local.get(['foundKeys', 'keyCount']);
    foundKeys = result.foundKeys || [];
    keyCount = result.keyCount || 0;
    updateBadge();
    
    // Load settings
    const settingsResult = await chrome.storage.sync.get({
      excludedDomains: DEFAULT_EXCLUDED_DOMAINS.join('\n'),
      excludedPatterns: DEFAULT_EXCLUDED_PATTERNS.join('\n'),
      enableMonitoring: true,
      providers: {
        openai: true,
        claude: true,
        gemini: true,
        deepseek: true,
        groq: true,
        siliconflow: true,
        xai: true,
        openrouter: true
      }
    });
    settings = settingsResult;
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Update badge with key count
function updateBadge() {
  const badgeText = keyCount > 0 ? keyCount.toString() : '';
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: keyCount > 0 ? '#ff4444' : '#888888' });
}

// Check if domain should be excluded
function isDomainExcluded(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const excludedDomains = settings.excludedDomains.split('\n')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0);
    
    return excludedDomains.some(excluded =>
      domain === excluded || domain.endsWith('.' + excluded)
    );
  } catch (error) {
    return false;
  }
}

// Check if key matches excluded patterns
function isKeyExcluded(key) {
  const excludedPatterns = settings.excludedPatterns.split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  return excludedPatterns.some(pattern => {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\\\*/g, '.*'); // Convert * to .*
    
    const regex = new RegExp('^' + regexPattern + '$', 'i');
    return regex.test(key);
  });
}

// Search for API keys in text
function searchForKeys(text, url, source) {
  const matches = [];
  
  // Check if monitoring is enabled
  if (!settings.enableMonitoring) {
    return matches;
  }
  
  // Check if domain is excluded
  if (isDomainExcluded(url)) {
    return matches;
  }
  
  for (const [providerId, provider] of Object.entries(PROVIDER_INFO)) {
    // Check if this provider is enabled in settings
    if (!settings.providers || !settings.providers[providerId]) {
      continue;
    }
    
    // Reset regex lastIndex to ensure proper matching
    provider.pattern.lastIndex = 0;
    
    let match;
    while ((match = provider.pattern.exec(text)) !== null) {
      const key = match[0];
      
      // Check if key matches excluded patterns
      if (isKeyExcluded(key)) {
        continue;
      }
      
      // Check if this key was already found
      const existingKey = foundKeys.find(k => k.key === key && k.url === url);
      if (!existingKey) {
        const keyData = {
          id: Date.now() + Math.random(),
          key: key,
          provider: provider.name,
          providerId: providerId,
          url: url,
          source: source,
          timestamp: new Date().toISOString(),
          domain: new URL(url).hostname
        };
        
        matches.push(keyData);
        foundKeys.push(keyData);
        keyCount++;
      }
      
      // Prevent infinite loop for global regex
      if (provider.pattern.global && provider.pattern.lastIndex === match.index) {
        break;
      }
    }
  }
  
  if (matches.length > 0) {
    saveFoundKeys();
    updateBadge();
    notifyContentScript(matches);
  }
  
  return matches;
}

// Save found keys to storage
async function saveFoundKeys() {
  try {
    await chrome.storage.local.set({
      foundKeys: foundKeys,
      keyCount: keyCount
    });
  } catch (error) {
    console.error('Error saving found keys:', error);
  }
}

// Notify content script about new keys
function notifyContentScript(newKeys) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'NEW_KEYS_FOUND',
        keys: newKeys
      }).catch(() => {
        // Ignore errors if content script is not ready
      });
    }
  });
}

// Monitor web requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.requestBody) {
      // Check POST data
      if (details.requestBody.raw) {
        details.requestBody.raw.forEach(data => {
          if (data.bytes) {
            const text = new TextDecoder().decode(data.bytes);
            searchForKeys(text, details.url, 'POST Request Body');
          }
        });
      }
      
      // Check form data
      if (details.requestBody.formData) {
        const formDataText = JSON.stringify(details.requestBody.formData);
        searchForKeys(formDataText, details.url, 'Form Data');
      }
    }
    
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

// Monitor response headers
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.responseHeaders) {
      details.responseHeaders.forEach(header => {
        searchForKeys(header.value || '', details.url, `Response Header: ${header.name}`);
      });
    }
    
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// Monitor completed requests for response analysis
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    // Skip non-text content types
    const contentType = details.responseHeaders?.find(h => 
      h.name.toLowerCase() === 'content-type'
    )?.value || '';
    
    if (!contentType.includes('text') && 
        !contentType.includes('json') && 
        !contentType.includes('javascript') &&
        !contentType.includes('xml')) {
      return;
    }
    
    // Try to fetch and analyze response body
    try {
      const response = await fetch(details.url);
      if (response.ok) {
        const text = await response.text();
        searchForKeys(text, details.url, 'Response Body');
      }
    } catch (error) {
      // Ignore fetch errors (CORS, etc.)
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_FOUND_KEYS':
      sendResponse({
        keys: foundKeys,
        count: keyCount
      });
      break;
      
    case 'CLEAR_KEYS':
      foundKeys = [];
      keyCount = 0;
      saveFoundKeys();
      updateBadge();
      sendResponse({ success: true });
      break;
      
    case 'SCAN_PAGE_CONTENT':
      if (request.content) {
        const matches = searchForKeys(request.content, request.url, 'Page Content');
        sendResponse({ matches: matches });
      }
      break;
      
    case 'SCAN_NETWORK_RESPONSE':
      if (request.responseText) {
        const matches = searchForKeys(request.responseText, request.url, 'Network Response');
        sendResponse({ matches: matches });
      }
      break;
      
    case 'SETTINGS_UPDATED':
      if (request.settings) {
        settings = request.settings;
        sendResponse({ success: true });
      }
      break;
      
    case 'CLEANUP_OLD_KEYS':
      if (request.cutoffDate) {
        const cutoff = new Date(request.cutoffDate);
        foundKeys = foundKeys.filter(key => new Date(key.timestamp) > cutoff);
        keyCount = foundKeys.length;
        saveFoundKeys();
        updateBadge();
        sendResponse({ success: true, removed: foundKeys.length });
      }
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async response
});

// Initialize on startup
initializeStorage();