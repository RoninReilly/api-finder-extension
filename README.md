# API Key Hunter - Chrome Extension

[![License](https://img.shields.io/github/license/RoninReilly/api-finder-extension)](https://github.com/RoninReilly/api-finder-extension/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/RoninReilly/api-finder-extension)](https://github.com/RoninReilly/api-finder-extension/issues)
[![Stars](https://img.shields.io/github/stars/RoninReilly/api-finder-extension?style=social)](https://github.com/RoninReilly/api-finder-extension)

A powerful Chrome extension that monitors network traffic and automatically detects exposed API keys from various AI providers in real-time.

## 🔍 Features

### **Real-time Monitoring**
- Automatically scans all network requests and responses
- Analyzes page content, JavaScript, and CSS code
- Monitors browser console output and local storage
- Intercepts WebSocket messages and postMessage communications

### **Supported Providers**
- **OpenAI** (`sk-proj-*`, `sk-*`)
- **Claude (Anthropic)** (`sk-ant-api03-*`)
- **Google Gemini** (`AIzaSy*`)
- **DeepSeek** (`sk-*`)
- **Groq** (`gsk_*`)
- **SiliconFlow** (`sk-*`)
- **xAI (Grok)** (`xai-*`)
- **OpenRouter** (`sk-or-v1-*`)

### **Smart Filtering**
- Pre-configured exclusion list for popular sites (Google, Yandex, Facebook, etc.)
- Customizable domain and pattern exclusions
- Individual provider enable/disable controls
- Automatic filtering of test and demo keys

### **User Interface**
- Clean popup with real-time key counter
- Detailed information for each discovered key
- Search and filter by domain/provider
- Pagination for large result sets
- JSON export functionality

### **Advanced Settings**
- Comprehensive options page with multiple configuration sections
- Enable/disable different monitoring types
- Notification and sound controls
- Automatic cleanup of old keys
- Settings import/export

### **Security Features**
- Automatic exclusion of popular websites
- Optional encryption for stored data
- Configurable data retention periods
- Complete data clearing functionality

## 🚀 Installation

1.  Download or clone this repository
2.  Open Chrome and navigate to `chrome://extensions/`
3.  Enable "Developer mode" in the top right
4.  Click "Load unpacked" and select the root folder of this project
5.  The extension will appear in your toolbar

## 📖 Usage

1.  **Automatic Detection**: The extension runs automatically in the background, monitoring all network traffic
2.  **View Results**: Click the extension icon to see found API keys
3.  **Configure Settings**: Right-click the extension icon and select "Options" to customize behavior
4.  **Export Data**: Use the export button to save found keys or settings

## 🛠️ Build

To package the extension for distribution (e.g., for the Chrome Web Store), use the provided build script:

```bash
./build.sh
```

This will create a `api_key_hunter.zip` file in the `dist/` directory.

## ⚙️ Configuration

### Monitoring Options
- **Network Traffic**: Monitor all HTTP requests and responses
- **Page Content**: Scan HTML, JavaScript, and CSS
- **Console Output**: Watch browser console logs
- **Local Storage**: Monitor localStorage and sessionStorage

### Provider Controls
Each AI provider can be individually enabled or disabled in the settings.

### Exclusions
- **Default Exclusions**: Pre-configured list of popular websites
- **Custom Domains**: Add your own domains to exclude
- **Pattern Matching**: Use wildcards to exclude key patterns

### Security Settings
- **Auto-delete**: Automatically remove old keys after specified days
- **Encryption**: Encrypt stored keys (optional)
- **Data Retention**: Configure how long to keep found keys

## 🛡️ Privacy & Security

- All data is stored locally in your browser
- No data is transmitted to external servers
- Optional encryption for sensitive data
- Automatic exclusion of popular websites to reduce false positives

## 🔧 Technical Details

### Architecture
- **Background Script**: Handles network monitoring and key detection
- **Content Script**: Monitors page content and DOM changes
- **Injected Script**: Deep monitoring of page context
- **Popup Interface**: User-friendly results display
- **Options Page**: Comprehensive settings management

### Permissions
- `webRequest`: Monitor network traffic
- `storage`: Save found keys and settings
- `activeTab`: Access current page content
- `scripting`: Inject monitoring scripts

## 📝 Development

### File Structure
```
.
├── dist/                  # Packaged extension files
├── .gitignore             # Files to ignore in git
├── background.js          # Main monitoring logic
├── build.sh               # Build script
├── content.js             # Page content monitoring
├── injected.js            # Deep page context monitoring
├── manifest.json          # Extension configuration
├── options.html/css/js    # Settings page
├── popup.html/css/js      # Extension popup interface
└── README.md              # This file
```

### Key Components
- **RegEx Patterns**: Carefully crafted patterns for each provider
- **Filtering Logic**: Smart exclusion system to reduce false positives
- **Storage System**: Efficient local storage with optional encryption
- **UI Components**: Modern, responsive interface design

## ⚠️ Disclaimer

This extension is designed for educational and security research purposes. Users are responsible for:
- Complying with applicable laws and regulations
- Respecting website terms of service
- Using discovered information ethically and responsibly

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is provided as-is for educational purposes. Please use responsibly.

## 🔗 Links

- [Chrome Web Store](#) (Coming soon)
- [GitHub Repository](https://github.com/RoninReilly/api-finder-extension)
- [Issues & Bug Reports](https://github.com/RoninReilly/api-finder-extension/issues)

## 🔑 Keywords
`chrome-extension`, `api-key`, `security`, `developer-tools`, `privacy`, `openai`, `gemini`, `claude`, `anthropic`, `groq`, `deepseek`

---

**Made with ❤️ for the security community**