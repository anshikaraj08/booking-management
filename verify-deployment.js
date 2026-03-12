#!/usr/bin/env node

/**
 * Environment & Configuration Verification Script
 * Run this before deploying to catch issues early
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, passMessage, failMessage) {
  if (condition) {
    log(`✅ ${passMessage}`, 'green');
    return true;
  } else {
    log(`❌ ${failMessage}`, 'red');
    return false;
  }
}

async function verify() {
  log('\n🔍 Aetheria Heights - Deployment Verification\n', 'blue');

  let allChecks = true;

  // Load .env.local
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    log('✅ .env.local file found', 'green');
  } else {
    log('⚠️  .env.local not found - using defaults', 'yellow');
  }

  // Required Environment Variables
  log('\n📋 Checking Required Variables:', 'blue');

  const requiredVars = {
    'MONGO_URI': 'MongoDB connection string',
    'JWT_SECRET': 'JWT secret key',
    'GEMINI_API_KEY': 'Google Gemini API key',
    'EMAIL_USER': 'Email user for notifications',
    'EMAIL_PASS': 'Email app password'
  };

  for (const [varName, description] of Object.entries(requiredVars)) {
    if (!check(process.env[varName], 
      `${varName} is set (${description})`,
      `${varName} is missing - ${description}`)) {
      allChecks = false;
    }
  }

  // Optional Variables
  log('\n⚙️  Optional Variables:', 'blue');
  
  check(process.env.PORT, 
    `PORT configured (${process.env.PORT})`,
    `PORT not set (using default 3001)`);

  check(process.env.NODE_ENV, 
    `NODE_ENV configured (${process.env.NODE_ENV})`,
    `NODE_ENV not set (using default development)`);

  // File checks
  log('\n📁 Checking Project Files:', 'blue');

  const requiredFiles = [
    'server.js',
    'package.json',
    'vite.config.js',
    'index.jsx',
    'App.jsx'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    check(fs.existsSync(filePath), 
      `${file} exists`,
      `${file} missing`);
  }

  // Node modules check
  log('\n📦 Dependencies:', 'blue');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (check(fs.existsSync(nodeModulesPath),
    'node_modules installed',
    'node_modules not found - run "npm install"')) {
  } else {
    allChecks = false;
  }

  // MongoDB Connection Check
  log('\n🗄️  Database Configuration:', 'blue');
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aetheria_heights';
  const isLocal = mongoUri.includes('localhost');
  const isAtlas = mongoUri.includes('mongodb+srv');

  if (isAtlas) {
    check(mongoUri.includes('@'), 
      'MongoDB Atlas URI format correct',
      'MongoDB Atlas URI may be malformed');
  } else if (isLocal) {
    log('ℹ️  Using local MongoDB', 'yellow');
  } else {
    log('⚠️  Unknown MongoDB configuration', 'yellow');
  }

  // Summary
  log('\n' + '='.repeat(40), 'blue');
  if (allChecks) {
    log('✅ All critical checks passed!', 'green');
    log('Ready to deploy to Render', 'green');
  } else {
    log('⚠️  Please fix the issues above before deploying', 'yellow');
  }
  log('='.repeat(40) + '\n', 'blue');

  // Production checklist
  log('📋 Pre-Deployment Checklist:', 'blue');
  log('  [ ] .env variables configured', 'yellow');
  log('  [ ] MongoDB Atlas cluster created', 'yellow');
  log('  [ ] GitHub repository created and pushed', 'yellow');
  log('  [ ] CORS configured in server.js', 'yellow');
  log('  [ ] Strong JWT_SECRET generated', 'yellow');
  log('  [ ] Render accounts created', 'yellow');
  log('  [ ] Local testing completed', 'yellow');
  log('\n');
}

verify().catch(err => {
  log(`Error during verification: ${err.message}`, 'red');
  process.exit(1);
});
