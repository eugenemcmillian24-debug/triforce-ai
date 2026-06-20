'use client';

import { useEffect } from 'react';

export default function ReferralTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get('ref');
    if (ref) {
      // Store referral code for attribution when user upgrades
      localStorage.setItem('triforce_referral', ref);
      // Track the visit
      try {
        const visits = JSON.parse(localStorage.getItem('triforce_ref_visits') || '[]');
        visits.push({ ref, timestamp: new Date().toISOString() });
        localStorage.setItem('triforce_ref_visits', JSON.stringify(visits.slice(-10)));
      } catch {}
    }

    // Increment build count tracking
    const count = parseInt(localStorage.getItem('triforce_build_count') || '0');
    if (count === 0) {
      localStorage.setItem('triforce_build_count', '0');
    }
  }, []);

  return null;
}
