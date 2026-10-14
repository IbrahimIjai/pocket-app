const { colors } = require('./theme/brand');

const variant = process.env.APP_VARIANT ?? 'production';

const IS_DEV = variant === 'development';
const IS_PREVIEW = variant === 'preview';

const appName = IS_DEV ? 'Pocket Dev' : IS_PREVIEW ? 'Pocket Preview' : 'Pocket';
const appPackage = IS_DEV ? 'com.pocket.dev' : IS_PREVIEW ? 'com.pocket.preview' : 'com.pocket.app';

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  name: appName,
  slug: 'pocket',
  version: '1.0.0',
  description: 'Trade in dollars. Never lose more than you chose.',
  backgroundColor: colors.paper,
  scheme: IS_DEV ? 'pocket-dev' : IS_PREVIEW ? 'pocket-preview' : 'pocket',
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCompiler: true,
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-system-ui',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: colors.paper,
        dark: { image: './assets/splash-icon.png', backgroundColor: colors.ink },
      },
    ],
    'expo-status-bar',
    'expo-web-browser',
  ],
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: appPackage,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      monochromeImage: './assets/adaptive-icon-mono.png',
      backgroundColor: colors.ink,
    },
    package: appPackage,
    // arm64-v8a only — cuts APK size ~60% vs universal. Covers all modern Android (2017+).
    supportedCpuArchitectures: IS_DEV ? undefined : ['arm64-v8a'],
  },
  web: {
    favicon: './assets/favicon.png',
    name: 'Pocket',
    shortName: 'Pocket',
    themeColor: colors.paper,
    backgroundColor: colors.paper,
  },
  extra: {
    variant,
  },
};
