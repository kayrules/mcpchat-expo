const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for monorepo/local packages
config.watchFolders = [
  path.resolve(__dirname, 'packages'),
];

// Handle symlinked packages - ONLY use host app's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Block SDK's node_modules to prevent version conflicts
config.resolver.blockList = [
  new RegExp(`${path.resolve(__dirname, 'packages/rhb-chat-sdk/node_modules').replace(/[/\\]/g, '[/\\\\]')}.*`),
];

// Enable hot reloading for SDK development - resolve to source files
config.resolver.alias = {
  'rhb-chat-sdk': path.resolve(__dirname, 'packages/rhb-chat-sdk/src'),
};

// Add TypeScript support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Ensure proper handling of newer JS syntax
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;