import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  active: boolean;
}


function getHeaders(request: NextRequest) {
  return {
    'X-GitHub-User': request.headers.get('x-github-user') || '',
    'X-User-Email': request.headers.get('x-user-email') || '',
  };
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'tfc_';
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export async function GET(request: NextRequest) {
  const headers = getHeaders(request);
  if (!headers['X-GitHub-User']) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return NextResponse.json({ message: 'API keys stored client-side in production. Use POST to generate.' });
}

export async function POST(request: NextRequest) {
  try {
    const { action, name = 'Default', userId } = await request.json();

    if (action === 'generate') {
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        key: generateApiKey(),
        name,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        active: true,
      };
      return NextResponse.json({ success: true, apiKey: newKey });
    }

    if (action === 'verify') {
      const { key } = await request.json();
      return NextResponse.json({ valid: key.startsWith('tfc_'), userId: userId || 'unknown' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'API key operation failed' }, { status: 500 });
  }
}
