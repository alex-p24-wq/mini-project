// Deployment Configuration Checker
// Run this to verify your setup before deploying

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking Deployment Configuration...\n');

// Check 1: Backend Vercel Config
console.log('📦 Backend (Vercel):');
const backendVercelPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(backendVercelPath)) {
  console.log('  ✅ backend/vercel.json exists');
  try {
    const config = JSON.parse(fs.readFileSync(backendVercelPath, 'utf8'));
    if (config.builds && config.routes) {
      console.log('  ✅ Valid Vercel configuration');
    } else {
      console.log('  ⚠️  Vercel config may be incomplete');
    }
  } catch (e) {
    console.log('  ❌ Invalid JSON in vercel.json');
  }
} else {
  console.log('  ❌ backend/vercel.json missing');
}

// Check 2: Backend Package.json
const backendPkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(backendPkgPath)) {
  console.log('  ✅ backend/package.json exists');
  try {
    const pkg = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
    if (pkg.type === 'module') {
      console.log('  ✅ ES modules enabled');
    }
    if (pkg.dependencies?.express) {
      console.log('  ✅ Express dependency found');
    }
  } catch (e) {
    console.log('  ⚠️  Could not parse package.json');
  }
} else {
  console.log('  ❌ backend/package.json missing');
}

// Check 3: Frontend Render Config
console.log('\n🎨 Frontend (Render):');
const frontendRenderPath = path.join(__dirname, '..', 'frontend', 'render.yaml');
if (fs.existsSync(frontendRenderPath)) {
  console.log('  ✅ frontend/render.yaml exists');
} else {
  console.log('  ⚠️  frontend/render.yaml missing (can configure via UI)');
}

// Check 4: Frontend Package.json
const frontendPkgPath = path.join(__dirname, '..', 'frontend', 'package.json');
if (fs.existsSync(frontendPkgPath)) {
  console.log('  ✅ frontend/package.json exists');
  try {
    const pkg = JSON.parse(fs.readFileSync(frontendPkgPath, 'utf8'));
    if (pkg.scripts?.build) {
      console.log('  ✅ Build script found');
    }
    if (pkg.dependencies?.react) {
      const reactVersion = pkg.dependencies.react;
      console.log(`  ✅ React version: ${reactVersion}`);
      if (reactVersion.includes('18.3.1')) {
        console.log('  ✅ Recommended React version');
      }
    }
  } catch (e) {
    console.log('  ⚠️  Could not parse package.json');
  }
} else {
  console.log('  ❌ frontend/package.json missing');
}

// Check 5: Environment Files
console.log('\n🔐 Environment Configuration:');
const backendEnvPath = path.join(__dirname, '.env');
const backendEnvExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(backendEnvPath)) {
  console.log('  ✅ backend/.env exists (local development)');
} else {
  console.log('  ⚠️  backend/.env missing (okay for production)');
}
if (fs.existsSync(backendEnvExamplePath)) {
  console.log('  ✅ backend/.env.example exists');
} else {
  console.log('  ⚠️  backend/.env.example missing');
}

const frontendEnvExamplePath = path.join(__dirname, '..', 'frontend', '.env.example');
if (fs.existsSync(frontendEnvExamplePath)) {
  console.log('  ✅ frontend/.env.example exists');
} else {
  console.log('  ⚠️  frontend/.env.example missing');
}

// Check 6: Server.js
console.log('\n🚀 Server Configuration:');
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('  ✅ server.js exists');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  if (serverContent.includes('FRONTEND_URL')) {
    console.log('  ✅ CORS configured with FRONTEND_URL');
  }
  if (serverContent.includes('/api/health')) {
    console.log('  ✅ Health check endpoint found');
  }
} else {
  console.log('  ❌ server.js missing');
}

// Summary
console.log('\n📋 Deployment Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Backend  → Vercel (Serverless)');
console.log('Frontend → Render (Static Site)');
console.log('Database → MongoDB Atlas');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n⚠️  Important Reminders:');
console.log('1. Set MONGO_URI in Vercel environment variables');
console.log('2. Set JWT_SECRET in Vercel environment variables');
console.log('3. Set SMTP credentials in Vercel environment variables');
console.log('4. Set VITE_API_URL in Render environment variables');
console.log('5. Update FRONTEND_URL in Vercel after Render deployment');
console.log('6. Vercel has NO persistent file storage (use Cloudinary)');

console.log('\n📚 Documentation:');
console.log('  → VERCEL_BACKEND_RENDER_FRONTEND_SETUP.md');
console.log('  → DEPLOYMENT_QUICK_CARD.md');

console.log('\n✨ Ready to deploy!\n');
