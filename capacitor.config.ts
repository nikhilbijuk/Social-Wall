import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialwall.app',
  appName: 'Social Wall',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
