import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Moon, Sun, Download, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('goalgetter_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

        <div className="space-y-4">
          {/* Theme */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dark ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-accent" />}
              <div>
                <p className="text-sm font-medium text-foreground">Appearance</p>
                <p className="text-xs text-muted-foreground">{dark ? 'Dark' : 'Light'} mode</p>
              </div>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-accent' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${dark ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Export */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Export Data</p>
                <p className="text-xs text-muted-foreground">Download your goals as CSV</p>
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
                <p className="text-sm font-medium text-foreground">Privacy</p>
                <p className="text-xs text-muted-foreground">Your data stays on your device. We never sell your data.</p>
              </div>
            </div>
          </div>

          {/* Upgrade */}
          <div className="gradient-accent rounded-xl p-6 text-center">
            <h3 className="text-base font-bold text-accent-foreground mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-accent-foreground/70 mb-4">Unlimited goals, pro metrics, professional booking, and more.</p>
            <button className="px-6 py-2.5 rounded-xl bg-card text-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              $9.99/month
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
