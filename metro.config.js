const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for monorepo/local packages
config.watchFolders = [
  path.resolve(__dirname, 'packages'),
];

// Handle symlinked packages
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'packages/rhb-chat-sdk/node_modules'),
];

// Ensure proper handling of newer JS syntax
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;