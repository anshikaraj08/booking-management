#!/bin/bash

# Setup script for Aetheria Heights project

echo "🚀 Aetheria Heights - Local Setup"
echo "=================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "✅ Created .env.local - Please edit it with your actual values"
else
  echo "✅ .env.local already exists"
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local with your MongoDB URI, JWT_SECRET, and email credentials"
echo "2. Run 'npm run server' in one terminal to start the backend (port 3001)"
echo "3. Run 'npm run dev' in another terminal to start the frontend (port 3000)"
echo ""
echo "✨ Setup complete! Happy coding!"
