import { render } from 'preact';
import { App } from './app';
import './styles/global.css';
import { initializeNative } from './services/NativeBridge';
import { initOfflineDB } from './services/OfflineSyncService';

// Initialize native capabilities and offline database
async function initializeApp() {
  try {
    // Initialize native capabilities (Capacitor plugins)
    await initializeNative();
    console.log('[App] Native bridge initialized');

    // Initialize offline database
    await initOfflineDB();
    console.log('[App] Offline database initialized');
  } catch (err) {
    console.warn('[App] Initialization warning:', err);
  }
}

initializeApp();

render(<App />, document.getElementById('app'));
