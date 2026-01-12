import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abachaonline.app',
  appName: 'AbachaOnline',
  webDir: 'dist',

  // Server configuration
  // Note: No server.url means app loads from local bundled assets (offline-first)
  // API calls will still go to the Railway backend via fetch()
  server: {
    androidScheme: 'https',
    // For live reload during development, uncomment:
    // url: 'http://192.168.x.x:8080',
  },

  // Android-specific configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true // Disable in production
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4CAF50',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#FFFFFF'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#4CAF50'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Camera: {
      // Camera permissions are handled in AndroidManifest.xml
    },
    Geolocation: {
      // High accuracy for delivery tracking
    }
  }
};

export default config;
