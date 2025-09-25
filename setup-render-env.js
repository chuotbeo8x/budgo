#!/usr/bin/env node

/**
 * Script để tạo environment variables cho Render.com
 * Chạy: node setup-render-env.js
 */

const fs = require('fs');
const path = require('path');

// Đọc env.beta để lấy các giá trị
const envBetaPath = path.join(__dirname, 'env.beta');

if (!fs.existsSync(envBetaPath)) {
  console.error('❌ File env.beta không tồn tại!');
  process.exit(1);
}

const envContent = fs.readFileSync(envBetaPath, 'utf8');
const envVars = {};

// Parse env.beta file
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log('🚀 Environment Variables cho Render.com:');
console.log('='.repeat(50));

// Hiển thị các biến cần thiết
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

requiredVars.forEach(key => {
  if (envVars[key]) {
    console.log(`${key} = ${envVars[key]}`);
  } else {
    console.log(`❌ ${key} = (missing)`);
  }
});

console.log('\n📋 Hướng dẫn:');
console.log('1. Copy các biến trên vào Render.com dashboard');
console.log('2. Vào Web Service → Environment → Add Environment Variable');
console.log('3. Paste từng biến một');
console.log('4. Deploy lại service');

console.log('\n🔗 Link: https://dashboard.render.com');
