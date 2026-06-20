import type { Metadata, Viewport } from 'next';
import './globals.css';
import ReferralTracker from './ReferralTracker';

export const metadata: Metadata = {
  title: 'TriForce AI — Build Everything',
  description: 'Three AI builders sharing one universal free-tier pipeline. Build apps, design AI workflows, and auto-repair repos — all free.',
  keywords: ['AI app builder', 'AGI workflow', 'code generation', 'repo repair', 'free AI', 'Cloudflare'],
  openGraph: {
    title: 'TriForce AI — Build Everything',
    description: 'Three AI builders sharing one universal free-tier pipeline',
    url: 'https://triforce-ai.pages.dev',
    siteName: 'TriForce AI',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        <ReferralTracker />
        {children}
      </body>
    </html>
  );
}
