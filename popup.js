document.addEventListener('DOMContentLoaded', function() {
    let allKeys = [];
    let filteredKeys = [];

    // DOM elements
    const keyCountEl = document.getElementById('keyCount');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const searchInput = document.getElementById('searchInput');
    const noKeysMessage = document.getElementById('noKeysMessage');
    const keysList = document.getElementById('keysList');
    const optionsLink = document.getElementById('optionsLink');

    // Modal elements
    const keyModal = document.getElementById('keyModal');
    const closeModal = document.getElementById('closeModal');
    const modalProvider = document.getElementById('modalProvider');
    const modalDomain = document.getElementById('modalDomain');
    const modalUrl = document.getElementById('modalUrl');
    const modalSource = document.getElementById('modalSource');
    const modalTime = document.getElementById('modalTime');
    const modalKey = document.getElementById('modalKey');
    const copyKeyBtn = document.getElementById('copyKeyBtn');

    function init() {
        loadKeys();
        setupEventListeners();
    }

    function setupEventListeners() {
        clearBtn.addEventListener('click', clearAllKeys);
        exportBtn.addEventListener('click', exportKeys);
        searchInput.addEventListener('input', handleSearch);
        optionsLink.addEventListener('click', () => chrome.runtime.openOptionsPage());

        // Modal events
        closeModal.addEventListener('click', hideModal);
        keyModal.addEventListener('click', (e) => {
            if (e.target === keyModal) hideModal();
        });
        copyKeyBtn.addEventListener('click', copyKey);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideModal();
        });
    }

    function loadKeys() {
        chrome.runtime.sendMessage({ type: 'GET_FOUND_KEYS' }, (response) => {
            if (response && response.keys) {
                allKeys = response.keys.reverse(); // Reverse keys here
                filteredKeys = [...allKeys];
                updateUI();
            }
        });
    }

    function updateUI() {
        updateStats();
        renderKeys();
    }

    function updateStats() {
        keyCountEl.textContent = `${filteredKeys.length} ${filteredKeys.length === 1 ? 'key' : 'keys'}`;
    }

    function renderKeys() {
        keysList.innerHTML = '';
        if (filteredKeys.length === 0) {
            noKeysMessage.style.display = 'block';
        } else {
            noKeysMessage.style.display = 'none';
            filteredKeys.forEach(key => {
                const keyItem = createKeyItem(key);
                keysList.appendChild(keyItem);
            });
        }
    }

    function createKeyItem(key) {
        const item = document.createElement('div');
        item.className = 'key-item';
        item.addEventListener('click', () => showKeyDetails(key));

        const time = new Date(key.timestamp).toLocaleString('ru-RU', { timeStyle:'short', dateStyle:'short' });
        const keyPreview = key.key.length > 30 ? `${key.key.substring(0, 15)}...${key.key.substring(key.key.length - 15)}` : key.key;

        item.innerHTML = `
            <div class="key-header">
                <span class="key-provider">${key.provider}</span>
                <span class="key-time">${time}</span>
            </div>
            <div class="key-domain">${key.domain}</div>
            <div class="key-preview">${keyPreview}</div>
        `;
        return item;
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        filteredKeys = query ? allKeys.filter(key => 
            key.domain.toLowerCase().includes(query) ||
            key.provider.toLowerCase().includes(query) ||
            key.key.toLowerCase().includes(query)
        ) : [...allKeys];
        updateUI();
    }
    
    let selectedKey = null;
    function showKeyDetails(key) {
        selectedKey = key;
        modalProvider.textContent = key.provider;
        modalDomain.textContent = key.domain;
        modalUrl.textContent = key.url;
        modalSource.textContent = key.source;
        modalTime.textContent = new Date(key.timestamp).toLocaleString('ru-RU');
        modalKey.textContent = key.key;
        keyModal.style.display = 'flex';
    }

    function hideModal() {
        keyModal.style.display = 'none';
        selectedKey = null;
    }

    function copyKey() {
        if (selectedKey) {
            navigator.clipboard.writeText(selectedKey.key).then(() => {
                const originalIcon = copyKeyBtn.innerHTML;
                copyKeyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;
                setTimeout(() => {
                     copyKeyBtn.innerHTML = originalIcon;
                }, 1500);
            });
        }
    }

    function clearAllKeys() {
        if (confirm('Are you sure you want to delete all found keys?')) {
            chrome.runtime.sendMessage({ type: 'CLEAR_KEYS' }, () => {
                loadKeys(); // Refresh the list
            });
        }
    }

    function exportKeys() {
        if (allKeys.length === 0) return;
        const exportData = {
            timestamp: new Date().toISOString(),
            total: allKeys.length,
            keys: allKeys
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-keys-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Auto-refresh every 3 seconds to catch new keys
    setInterval(loadKeys, 3000);

    init();
});