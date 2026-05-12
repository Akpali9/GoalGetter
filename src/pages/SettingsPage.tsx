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

// Stripe
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'
);

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

  // Stripe Checkout
  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const stripe = await stripePromise;

      if (!stripe) {
        alert('Stripe failed to load');
        return;
      }

      // Replace with your backend checkout session endpoint
      const response = await fetch(
        'http://localhost:5000/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            amount: 1000000, // ₦10,000 in kobo
          }),
        }
      );

      const session = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
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
        <h1 className="text-2xl font-bold text-foreground mb-8">
          Settings
        </h1>

        <div className="space-y-4">
          {/* Theme */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
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
              className={`relative w-12 h-6 rounded-full transition-colors ${
                dark ? 'bg-accent' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${
                  dark ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Currency */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
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
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
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

            <button className="px-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors">
              Export
            </button>
          </div>

          {/* Privacy */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  Privacy
                </p>

                <p className="text-xs text-muted-foreground">
                  Your data stays on your device. We never
                  sell your data.
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade */}
          <div className="gradient-accent rounded-xl p-6 text-center shadow-elevated">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-accent-foreground" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-accent-foreground mb-1">
              Upgrade to Pro
            </h3>

            <p className="text-sm text-accent-foreground/80 mb-5">
              Unlimited goals, advanced analytics,
              professional booking, cloud sync, and more.
            </p>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-card text-foreground text-sm font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-60"
            >
              {loading
                ? 'Processing...'
                : 'Pay ₦10,000/month'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
