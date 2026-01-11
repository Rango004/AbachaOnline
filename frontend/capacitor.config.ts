import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abachaonline.app',
  appName: 'AbachaOnline',
  webDir: 'dist',

  // Server configuration for live reload during development
  server: {
    // Use your Railway backend URL in production
    url: 'https://abachaonline.up.railway.app',
    cleartext: true,
    // For local development, uncomment below:
    // url: 'http://localhost:8080',
    // androidScheme: 'http'
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
