#!/bin/bash

# TriForce AI — Quick Setup Script
# Run: ./setup.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TriForce AI — Environment Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env.local exists
if [ -f "apps/web/.env.local" ]; then
    echo "✅ .env.local already exists"
else
    echo "📝 Creating .env.local from template..."
    cp .env.template apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "   1. Open apps/web/.env.local"
    echo "   2. Add at least GROQ_API_KEY"
    echo "   3. Run: bun dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Quick Start Guide"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Get FREE API Keys:"
echo "   • Groq:      https://console.groq.com/keys"
echo "   • Gemini:    https://aistudio.google.com/apikey"
echo "   • Cerebras:  https://cloud.cerebras.ai"
echo ""
echo "2️⃣  Install Dependencies:"
echo "   bun install"
echo ""
echo "3️⃣  Start Development Server:"
echo "   cd apps/web && bun dev"
echo ""
echo "4️⃣  Open in Browser:"
echo "   http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Need Help?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   📖 docs/SETUP.md"
echo "   🐛 issues: github.com/triforce-ai/triforce-ai/issues"
echo ""
