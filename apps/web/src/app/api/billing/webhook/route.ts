import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Stripe webhook handler — verifies signature, records upgrades
// Events: checkout.session.completed, customer.subscription.deleted

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature') || '';
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  // Verify webhook signature
  const timestamp = sig.match(/t=(\d+)/)?.[1];
  const signatures = sig.match(/v1=([a-f0-9]+)/)?.[1];

  if (!timestamp || !signatures) {
    return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
  }

  // Recompute signature
  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expectedSig = Buffer.from(
    await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
  ).toString('hex');

  // Constant-time comparison
  if (expectedSig.length !== signatures.length || !timingSafeEqual(expectedSig, signatures)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || 'pro';
      console.log(`Upgrade: user=${userId} plan=${plan} amount=${session.amount_total}`);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      console.log(`Downgrade: ${sub.id}`);
      break;
    }
    default:
      console.log(`Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
