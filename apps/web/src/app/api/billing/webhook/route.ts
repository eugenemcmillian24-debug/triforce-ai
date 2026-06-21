import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Stripe webhook handler — verifies signature, processes subscription + payment events
// Webhook URL: https://triforce-ai.pages.dev/api/billing/webhook
// Required events (select these when creating the endpoint in Stripe Dashboard):
//   1. checkout.session.completed        — User pays → grant plan access
//   2. customer.subscription.updated      — Plan change (Pro ↔ Creator)
//   3. customer.subscription.deleted      — Subscription cancelled → downgrade to Free
//   4. invoice.payment_succeeded          — Recurring renewal confirmed → extend access
//   5. invoice.payment_failed             — Card declined → mark account past_due
//   6. charge.refunded                    — Refund issued → revoke access, clawback affiliate
//   7. payment_intent.payment_failed      — Failed one-time payment (template purchase)
//   8. account.updated                    — Connected account status (affiliate payouts)

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature') || '';
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  // Verify webhook signature (Stripe v1 HMAC-SHA256)
  const timestamp = sig.match(/t=(\d+)/)?.[1];
  const signatures = sig.match(/v1=([a-f0-9]+)/)?.[1];

  if (!timestamp || !signatures) {
    return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
  }

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

  if (expectedSig.length !== signatures.length || !timingSafeEqual(expectedSig, signatures)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  // In production, each handler would write to D1/KV. For now we log structured events.
  switch (event.type) {
    // 1. User pays → grant plan access
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || 'pro';
      const referralCode = session.metadata?.referralCode;
      const mode = session.mode; // 'subscription' or 'payment'

      console.log(JSON.stringify({
        event: 'checkout.session.completed',
        userId,
        plan,
        mode,
        amountTotal: session.amount_total,
        currency: session.currency,
        referralCode,
        subscriptionId: session.subscription,
      }));

      // If referred, credit the affiliate
      if (referralCode) {
        console.log(`Affiliate credit: referralCode=${referralCode} amount=${session.amount_total}`);
        // In prod: UPDATE affiliates SET earnings = earnings + (amount * 0.20) WHERE code = ?
      }
      break;
    }

    // 2. Plan change (Pro ↔ Creator, or tier upgrade/downgrade)
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const planId = sub.items?.data?.[0]?.price?.id;
      const status = sub.status;
      console.log(JSON.stringify({
        event: 'customer.subscription.updated',
        subscriptionId: sub.id,
        customerId: sub.customer,
        status,
        planId,
        currentPeriodEnd: sub.current_period_end,
      }));
      break;
    }

    // 3. Subscription cancelled → downgrade to Free
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      console.log(JSON.stringify({
        event: 'customer.subscription.deleted',
        subscriptionId: sub.id,
        customerId: sub.customer,
        // In prod: UPDATE users SET plan = 'free' WHERE stripe_customer_id = ?
      }));
      break;
    }

    // 4. Recurring renewal confirmed → extend access period
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const isRenewal = invoice.billing_reason === 'subscription_cycle';
      console.log(JSON.stringify({
        event: 'invoice.payment_succeeded',
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountPaid: invoice.amount_paid,
        isRenewal,
        // In prod: UPDATE users SET plan_expires = period_end WHERE stripe_customer_id = ?
      }));
      break;
    }

    // 5. Card declined → mark account past_due (keep access for grace period)
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(JSON.stringify({
        event: 'invoice.payment_failed',
        invoiceId: invoice.id,
        customerId: invoice.customer,
        attemptCount: invoice.attempt_count,
        // In prod: UPDATE users SET billing_status = 'past_due' WHERE stripe_customer_id = ?
        // Trigger dunning email after 3 attempts
      }));
      break;
    }

    // 6. Refund issued → revoke access, clawback affiliate commission
    case 'charge.refunded': {
      const charge = event.data.object;
      const amountRefunded = charge.amount_refunded;
      console.log(JSON.stringify({
        event: 'charge.refunded',
        chargeId: charge.id,
        customerId: charge.customer,
        amountRefunded,
        // In prod:
        //   1. UPDATE users SET plan = 'free' WHERE stripe_customer_id = ?
        //   2. Reverse affiliate commission: UPDATE affiliates SET earnings = earnings - (refunded * 0.20)
      }));
      break;
    }

    // 7. Failed one-time payment (e.g. template purchase failed)
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.log(JSON.stringify({
        event: 'payment_intent.payment_failed',
        paymentIntentId: pi.id,
        customerId: pi.customer,
        lastPaymentError: pi.last_payment_error?.message,
        // In prod: mark template purchase as failed, notify user
      }));
      break;
    }

    // 8. Connected account status change (Stripe Connect for affiliate payouts)
    case 'account.updated': {
      const account = event.data.object;
      console.log(JSON.stringify({
        event: 'account.updated',
        accountId: account.id,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        // In prod: UPDATE affiliates SET payout_ready = payouts_enabled WHERE stripe_account_id = ?
      }));
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  // Always return 200 quickly — Stripe retries on non-2xx
  return NextResponse.json({ received: true, eventType: event.type });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
