// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('lottie');

// Android-specific fixes for bundle loading issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Increase timeout for Android builds
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set longer timeout for Android
      res.setTimeout(300000); // 5 minutes
      return middleware(req, res, next);
    };
  },
};

// Transformer options for better Android compatibility
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
