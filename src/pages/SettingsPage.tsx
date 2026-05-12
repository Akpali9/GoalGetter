import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import {
  Moon,
  Sun,
  Download,
  Shield,
  Globe,
  CreditCard,
} from 'lucide-react';

import { getUserCurrency } from '@/lib/currency';
import { stripePromise } from '@/lib/stripe';

export default function SettingsPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const [loading, setLoading] = useState(false);

  const currency = getUserCurrency();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);

    localStorage.setItem(
      'goalgetter_theme',
      dark ? 'dark' : 'light'
    );
  }, [dark]);

  // Stripe Payment
  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:5000/create-checkout-session',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      const stripe = await stripePromise;

      if (!stripe) {
        alert('Stripe failed to load');
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error(error);

      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-8">
          Settings
        </h1>

        <div className="space-y-4">
          {/* Theme */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              {dark ? (
                <Moon className="w-5 h-5 text-accent" />
              ) : (
                <Sun className="w-5 h-5 text-accent" />
              )}

              <div>
                <p className="text-sm font-medium text-foreground">
                  Appearance
                </p>

                <p className="text-xs text-muted-foreground">
                  {dark ? 'Dark' : 'Light'} mode
                </p>
              </div>
            </div>

            <button
              onClick={() => setDark(!dark)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                dark ? 'bg-accent' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-all duration-300 ${
                  dark ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Currency */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-accent" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  Currency
                </p>

                <p className="text-xs text-muted-foreground">
                  Auto-detected: {currency.symbol} (
                  {currency.code})
                </p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  Export Data
                </p>

                <p className="text-xs text-muted-foreground">
                  Download your goals as CSV
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors">
              Export
            </button>
          </div>

          {/* Privacy */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  Privacy
                </p>

                <p className="text-xs text-muted-foreground">
                  Your data stays on your device.
                  We never sell your data.
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="gradient-accent rounded-2xl p-6 text-center shadow-elevated relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-accent-foreground" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-accent-foreground mb-2">
                Upgrade to Pro
              </h3>

              <p className="text-sm text-accent-foreground/80 mb-6 max-w-sm mx-auto">
                Unlock unlimited goals, advanced analytics,
                cloud sync, premium coaching,
                professional booking, and more.
              </p>

              {/* Price */}
              <div className="mb-5">
                <span className="text-4xl font-black text-accent-foreground">
                  ₦10,000
                </span>

                <span className="text-accent-foreground/70 text-sm">
                  /month
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-card text-foreground text-sm font-bold hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 shadow-soft"
              >
                {loading
                  ? 'Processing Payment...'
                  : 'Upgrade Now'}
              </button>

              {/* Small text */}
              <p className="text-[11px] text-accent-foreground/60 mt-4">
                Secure payments powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
