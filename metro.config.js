const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude backend directories from Metro bundler
config.resolver.blockList = [
  /backend\/.*/,
  /deepseek\/.*/,
  /\.github\/.*/,
];

module.exports = config;