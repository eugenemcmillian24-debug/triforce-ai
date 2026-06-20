import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Stripe checkout - creates a Payment Link session
// Uses Stripe's hosted checkout (no webhook needed for one-time payments)

interface StripePrice {
  id: string;
  name: string;
  amount: number; // cents
  interval: 'one_time' | 'month' | 'year';
  features: string[];
}

const STRIPE_PRICES: Record<string, StripePrice> = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Builder',
    amount: 1900, // $19/mo
    interval: 'month',
    features: ['Unlimited builds', 'AGI mode access', 'Priority providers', 'No watermarks', 'Email support'],
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Builder (Annual)',
    amount: 19000, // $190/yr (2 months free)
    interval: 'year',
    features: ['Unlimited builds', 'AGI mode access', 'Priority providers', 'No watermarks', 'Priority support', 'API access'],
  },
  build_pack: {
    id: 'build_pack',
    name: 'Build Pack (100 builds)',
    amount: 500, // $5 one-time
    interval: 'one_time',
    features: ['100 build credits', 'No expiration', 'AGI mode included'],
  },
  template_pro: {
    id: 'template_pro',
    name: 'Template Creator',
    amount: 900, // $9/mo
    interval: 'month',
    features: ['Publish & sell templates', 'Keep 70% revenue', 'Analytics dashboard', 'Featured placement'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl, userId, email } = await request.json();

    const price = STRIPE_PRICES[priceId];
    if (!price) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // Demo mode: return upgrade info without charging
      return NextResponse.json({
        demo: true,
        message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable payments.',
        price: { name: price.name, amount: price.amount, interval: price.interval },
        features: price.features,
        upgradeUrl: `https://billing.stripe.com/p/login/test_abcdefghijklmnop`,
      });
    }

    // Create Stripe Checkout Session
    const params = new URLSearchParams();
    params.append('mode', price.interval === 'one_time' ? 'payment' : 'subscription');
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', String(price.amount));
    params.append('line_items[0][price_data][product_data][name]', price.name);
    params.append('success_url', successUrl || 'https://triforce-ai.pages.dev/account?upgraded=1');
    params.append('cancel_url', cancelUrl || 'https://triforce-ai.pages.dev/pricing');

    if (email) params.append('customer_email', email);
    if (userId) {
      params.append('client_reference_id', userId);
      params.append('metadata[user_id]', userId);
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Stripe error: ${err}` }, { status: 500 });
    }

    const session = await response.json();

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    prices: Object.entries(STRIPE_PRICES).map(([id, p]) => ({
      id,
      name: p.name,
      amount: p.amount,
      displayPrice: `$${(p.amount / 100).toFixed(2)}${p.interval === 'one_time' ? '' : p.interval === 'year' ? '/yr' : '/mo'}`,
      interval: p.interval,
      features: p.features,
    })),
  });
}
