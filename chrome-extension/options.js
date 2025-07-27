// Options page script for API Key Hunter extension
document.addEventListener('DOMContentLoaded', function() {
  // Default excluded domains and patterns (same as in background.js)
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

  const defaultSettings = {
    enableMonitoring: true,
    enablePageScanning: true,
    enableConsoleMonitoring: true,
    enableStorageMonitoring: true,
    enableNotifications: true,
    enableSounds: true,
    enableBadge: true,
    autoDelete: true,
    deleteAfterDays: 7,
    encryptStorage: false,
    excludedDomains: DEFAULT_EXCLUDED_DOMAINS.join('\n'),
    excludedPatterns: DEFAULT_EXCLUDED_PATTERNS.join('\n'),
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

  let currentSettings = { ...defaultSettings };

  // DOM elements
  const enableMonitoring = document.getElementById('enableMonitoring');
  const enablePageScanning = document.getElementById('enablePageScanning');
  const enableConsoleMonitoring = document.getElementById('enableConsoleMonitoring');
  const enableStorageMonitoring = document.getElementById('enableStorageMonitoring');
  const enableNotifications = document.getElementById('enableNotifications');
  const enableSounds = document.getElementById('enableSounds');
  const enableBadge = document.getElementById('enableBadge');
  const autoDelete = document.getElementById('autoDelete');
  const deleteAfterDays = document.getElementById('deleteAfterDays');
  const encryptStorage = document.getElementById('encryptStorage');
  const excludedDomains = document.getElementById('excludedDomains');
  const excludedPatterns = document.getElementById('excludedPatterns');

  // Provider checkboxes
  const providerCheckboxes = {};
  Object.keys(defaultSettings.providers).forEach(provider => {
    providerCheckboxes[provider] = document.getElementById(`provider-${provider}`);
  });

  // Buttons
  const exportSettings = document.getElementById('exportSettings');
  const importSettings = document.getElementById('importSettings');
  const importFile = document.getElementById('importFile');
  const exportKeys = document.getElementById('exportKeys');
  const clearAllData = document.getElementById('clearAllData');
  const resetSettings = document.getElementById('resetSettings');
  const saveSettings = document.getElementById('saveSettings');

  // Initialize
  init();

  function init() {
    loadSettings();
    setupEventListeners();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Settings change listeners
    enableMonitoring.addEventListener('change', updateSettings);
    enablePageScanning.addEventListener('change', updateSettings);
    enableConsoleMonitoring.addEventListener('change', updateSettings);
    enableStorageMonitoring.addEventListener('change', updateSettings);
    enableNotifications.addEventListener('change', updateSettings);
    enableSounds.addEventListener('change', updateSettings);
    enableBadge.addEventListener('change', updateSettings);
    autoDelete.addEventListener('change', updateSettings);
    deleteAfterDays.addEventListener('change', updateSettings);
    encryptStorage.addEventListener('change', updateSettings);
    excludedDomains.addEventListener('input', debounce(updateSettings, 500));
    excludedPatterns.addEventListener('input', debounce(updateSettings, 500));

    // Provider checkboxes
    Object.values(providerCheckboxes).forEach(checkbox => {
      checkbox.addEventListener('change', updateSettings);
    });

    // Button listeners
    exportSettings.addEventListener('click', handleExportSettings);
    importSettings.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImportSettings);
    exportKeys.addEventListener('click', handleExportKeys);
    clearAllData.addEventListener('click', handleClearAllData);
    resetSettings.addEventListener('click', handleResetSettings);
    saveSettings.addEventListener('click', handleSaveSettings);
  }

  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(defaultSettings, (result) => {
      currentSettings = { ...defaultSettings, ...result };
      updateUI();
    });
  }

  // Update UI with current settings
  function updateUI() {
    enableMonitoring.checked = currentSettings.enableMonitoring;
    enablePageScanning.checked = currentSettings.enablePageScanning;
    enableConsoleMonitoring.checked = currentSettings.enableConsoleMonitoring;
    enableStorageMonitoring.checked = currentSettings.enableStorageMonitoring;
    enableNotifications.checked = currentSettings.enableNotifications;
    enableSounds.checked = currentSettings.enableSounds;
    enableBadge.checked = currentSettings.enableBadge;
    autoDelete.checked = currentSettings.autoDelete;
    deleteAfterDays.value = currentSettings.deleteAfterDays;
    encryptStorage.checked = currentSettings.encryptStorage;
    excludedDomains.value = currentSettings.excludedDomains;
    excludedPatterns.value = currentSettings.excludedPatterns;

    // Update provider checkboxes
    Object.keys(providerCheckboxes).forEach(provider => {
      if (providerCheckboxes[provider]) {
        providerCheckboxes[provider].checked = currentSettings.providers[provider];
      }
    });
  }

  // Update settings object from UI
  function updateSettings() {
    currentSettings.enableMonitoring = enableMonitoring.checked;
    currentSettings.enablePageScanning = enablePageScanning.checked;
    currentSettings.enableConsoleMonitoring = enableConsoleMonitoring.checked;
    currentSettings.enableStorageMonitoring = enableStorageMonitoring.checked;
    currentSettings.enableNotifications = enableNotifications.checked;
    currentSettings.enableSounds = enableSounds.checked;
    currentSettings.enableBadge = enableBadge.checked;
    currentSettings.autoDelete = autoDelete.checked;
    currentSettings.deleteAfterDays = parseInt(deleteAfterDays.value);
    currentSettings.encryptStorage = encryptStorage.checked;
    currentSettings.excludedDomains = excludedDomains.value;
    currentSettings.excludedPatterns = excludedPatterns.value;

    // Update providers
    Object.keys(providerCheckboxes).forEach(provider => {
      if (providerCheckboxes[provider]) {
        currentSettings.providers[provider] = providerCheckboxes[provider].checked;
      }
    });

    // Auto-save after changes
    saveSettingsToStorage();
  }

  // Save settings to storage
  function saveSettingsToStorage() {
    chrome.storage.sync.set(currentSettings, () => {
      // Notify background script of settings change
      chrome.runtime.sendMessage({
        type: 'SETTINGS_UPDATED',
        settings: currentSettings
      });
    });
  }

  // Handle export settings
  function handleExportSettings() {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      settings: currentSettings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-hunter-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('Настройки экспортированы успешно', 'success');
  }

  // Handle import settings
  function handleImportSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (importData.settings) {
          currentSettings = { ...defaultSettings, ...importData.settings };
          updateUI();
          saveSettingsToStorage();
          showMessage('Настройки импортированы успешно', 'success');
        } else {
          throw new Error('Неверный формат файла');
        }
      } catch (error) {
        showMessage('Ошибка импорта настроек: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }

  // Handle export keys
  function handleExportKeys() {
    chrome.runtime.sendMessage({ type: 'GET_FOUND_KEYS' }, (response) => {
      if (response && response.keys && response.keys.length > 0) {
        const exportData = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          total: response.keys.length,
          keys: response.keys.map(key => ({
            provider: key.provider,
            domain: key.domain,
            url: key.url,
            source: key.source,
            timestamp: key.timestamp,
            key: key.key
          }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-keys-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage(`Экспортировано ${response.keys.length} ключей`, 'success');
      } else {
        showMessage('Нет ключей для экспорта', 'error');
      }
    });
  }

  // Handle clear all data
  function handleClearAllData() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ данные расширения?\n\nЭто действие нельзя отменить.')) {
      // Clear found keys
      chrome.runtime.sendMessage({ type: 'CLEAR_KEYS' }, () => {
        // Clear settings
        chrome.storage.sync.clear(() => {
          chrome.storage.local.clear(() => {
            // Reset to defaults
            currentSettings = { ...defaultSettings };
            updateUI();
            saveSettingsToStorage();
            showMessage('Все данные удалены', 'success');
          });
        });
      });
    }
  }

  // Handle reset settings
  function handleResetSettings() {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      currentSettings = { ...defaultSettings };
      updateUI();
      saveSettingsToStorage();
      showMessage('Настройки сброшены к значениям по умолчанию', 'success');
    }
  }

  // Handle save settings
  function handleSaveSettings() {
    saveSettings.classList.add('loading');
    
    saveSettingsToStorage();
    
    setTimeout(() => {
      saveSettings.classList.remove('loading');
      showMessage('Настройки сохранены', 'success');
    }, 500);
  }

  // Show message
  function showMessage(text, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at top of main content
    const main = document.querySelector('.main');
    main.insertBefore(message, main.firstChild);
    
    // Show with animation
    setTimeout(() => {
      message.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 3000);
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Auto-cleanup old keys based on settings
  function cleanupOldKeys() {
    if (currentSettings.autoDelete) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - currentSettings.deleteAfterDays);
      
      chrome.runtime.sendMessage({
        type: 'CLEANUP_OLD_KEYS',
        cutoffDate: cutoffDate.toISOString()
      });
    }
  }

  // Run cleanup on page load
  cleanupOldKeys();
  
  // Run cleanup periodically
  setInterval(cleanupOldKeys, 60000); // Every minute
});