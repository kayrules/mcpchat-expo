#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to find the host app's root directory
function findProjectRoot() {
  let currentDir = process.cwd();
  
  // Keep going up until we find package.json in host app
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      // Check if this is not our SDK package
      if (packageJson.name !== 'rhb-chat-sdk') {
        return currentDir;
      }
    }
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}

try {
  const projectRoot = findProjectRoot();
  
  console.log('\n🎉 RHB Chat SDK installed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Install peer dependencies:');
  console.log('   npm install @expo/vector-icons expo-image-picker expo-document-picker expo-audio expo-media-library');
  console.log('\n2. Configure permissions in your app.json:');
  console.log('   See node_modules/rhb-chat-sdk/INSTALLATION.md for detailed configuration');
  console.log('\n3. For bare React Native projects, run: cd ios && pod install');
  console.log('\n');

  // Check if this is an Expo project
  const appJsonPath = path.join(projectRoot, 'app.json');
  const expoConfigPath = path.join(projectRoot, 'app.config.js');

  if (fs.existsSync(appJsonPath) || fs.existsSync(expoConfigPath)) {
    console.log('✅ Expo project detected');
    console.log('⚠️  Don\'t forget to add the required plugins to your app.json/app.config.js');
  } else {
    console.log('📱 React Native project detected');
    console.log('⚠️  Don\'t forget to configure permissions in Info.plist and AndroidManifest.xml');
  }

  console.log('\n');
} catch (error) {
  console.log('RHB Chat SDK installed. Please check the documentation for setup instructions.');
}