#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing ShopWave for better performance...');

// 1. Clean up .next cache
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Cleared .next cache');
}

// 2. Clean up node_modules/.cache
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✅ Cleared node_modules cache');
}

console.log('🎉 Performance optimization complete!');
console.log('💡 Run "npm run dev" to start with optimized settings');