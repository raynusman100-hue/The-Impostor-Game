// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('lottie');

// Android-specific fixes for bundle loading issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Performance optimizations for faster bundling
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
    compress: {
      // Drop console logs in production
      drop_console: false,
      // Reduce passes for faster bundling
      passes: 1,
    },
  },
  // Enable inline requires for faster startup
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Critical for performance
    },
  }),
};

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

module.exports = config;
