import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// User account system — GitHub OAuth based
// Stores: userId, email, plan, buildCount, createdAt, referralCode

interface UserAccount {
  userId: string;
  email: string;
  githubUsername?: string;
  plan: 'free' | 'pro' | 'template_pro';
  buildCount: number;
  buildLimit: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  createdAt: string;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro: Infinity,
  template_pro: Infinity,
};

// Generate a short referral code from user ID
function generateReferralCode(userId: string): string {
  return 'TF-' + userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const { action, githubUsername, email, referralCode } = await request.json();

    switch (action) {
      case 'create': {
        if (!githubUsername || !email) {
          return NextResponse.json({
           error: 'GitHub username and email required' }, { status: 400 });
        }

        const userId = `user_${githubUsername}_${Date.now().toString(36)}`;
        const myReferralCode = generateReferralCode(userId);

        const account: UserAccount = {
          userId,
          email,
          githubUsername,
          plan: 'free',
          buildCount: 0,
          buildLimit: PLAN_LIMITS.free ?? 0,
          referralCode: myReferralCode,
          referralCount: 0,
          referralEarnings: 0,
          createdAt: new Date().toISOString(),
        };

        // Check referral code
        let referredBy = '';
        if (referralCode && referralCode.startsWith('TF-')) {
          referredBy = referralCode;
        }

        return NextResponse.json({
          success: true,
          account,
          referredBy,
          referralLink: `https://triforce-ai.pages.dev/?ref=${myReferralCode}`,
        });
      }

      case 'increment_build': {
        void await request.json();
        // In production: read from KV, increment, check limit, write back
        return NextResponse.json({
          success: true,
          remaining: 'unlimited (demo)',
        });
      }

      case 'upgrade': {
        const { plan } = await request.json();
        if (!PLAN_LIMITS[plan]) {
          return NextResponse.json({
           error: 'Invalid plan' }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          plan,
          buildLimit: PLAN_LIMITS[plan] === Infinity ? 'unlimited' : PLAN_LIMITS[plan],
          message: `Upgraded to ${plan}`,
        });
      }

      default:
        return NextResponse.json({
           error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'User operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referralCode = searchParams.get('ref');

  if (referralCode) {
    return NextResponse.json({
      valid: true,
      code: referralCode,
      message: 'Referral code applied — you get 5 bonus builds!',
      bonus: 5,
    });
  }

  return NextResponse.json({
    plans: [
      { id: 'free', name: 'Free', price: 0, limit: PLAN_LIMITS.free, features: ['10 builds/mo', '3 providers', 'Community templates'] },
      { id: 'pro', name: 'Pro', price: 19, limit: 'unlimited', features: ['Unlimited builds', 'AGI mode', 'Priority providers', 'No watermarks'] },
      { id: 'template_pro', name: 'Template Creator', price: 9, limit: 'unlimited', features: ['Sell templates', '70% revenue share', 'Analytics'] },
    ],
  });
}
