#!/usr/bin/env node

/**
 * Environment Setup Script for Cardo Backend
 * 
 * This script helps you set up the .env file for the backend server.
 * Run with: node setup-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const examplePath = path.join(__dirname, 'env.example');

console.log('🔧 Cardo Backend Environment Setup');
console.log('=====================================\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('If you want to recreate it, please delete the existing .env file first.\n');
  process.exit(0);
}

// Read the example file
if (!fs.existsSync(examplePath)) {
  console.error('❌ env.example file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(examplePath, 'utf8');

// Replace placeholder values with more helpful defaults
envContent = envContent.replace('your_super_secret_jwt_key_here', 'cardo_jwt_secret_' + Date.now());
envContent = envContent.replace('your-email@gmail.com', 'your-email@gmail.com');
envContent = envContent.replace('your-app-password-here', 'your-app-password-here');

// Write the .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env file successfully!');
console.log('\n📝 Next steps:');
console.log('1. Edit the .env file and add your Gmail credentials:');
console.log('   - Set SMTP_USER to your Gmail address');
console.log('   - Set SMTP_PASS to your Gmail App Password (not your regular password)');
console.log('   - Set MAIL_FROM to your Gmail address');
console.log('\n2. To get a Gmail App Password:');
console.log('   - Go to Google Account settings');
console.log('   - Enable 2-Factor Authentication');
console.log('   - Generate an App Password for "Mail"');
console.log('   - Use that App Password as SMTP_PASS');
console.log('\n3. For development/testing, you can also:');
console.log('   - Uncomment FORCE_DEV_EMAIL=true to bypass SMTP');
console.log('   - This will log emails to console instead of sending them');
console.log('\n🚀 Then restart your server with: npm run dev');
