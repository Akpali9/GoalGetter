import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Download, Smartphone, Share2, Check } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
        <img src={logoImg} alt="GoalGetter" width={80} height={80} className="mx-auto mb-6 rounded-2xl shadow-elevated" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Install GoalGetter</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Get the full app experience on your phone — fast, offline-ready, and always in your pocket.
        </p>

        {installed ? (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6">
            <Check className="w-10 h-10 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">GoalGetter is installed!</p>
            <p className="text-xs text-muted-foreground mt-1">Find it on your home screen.</p>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
        ) : isIOS ? (
          <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
            <p className="text-sm font-medium text-foreground">Install on iPhone / iPad:</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground">1. Tap the <strong>Share</strong> button in Safari</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground">2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6">
            <Smartphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium mb-1">Open in your browser</p>
            <p className="text-xs text-muted-foreground">Visit this page on your phone's browser and use the menu to "Add to Home Screen".</p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '⚡', label: 'Fast & Smooth' },
            { icon: '📱', label: 'Works Offline' },
            { icon: '🔔', label: 'Home Screen' },
          ].map(f => (
            <div key={f.label} className="bg-card border border-border rounded-xl p-3">
              <span className="text-xl">{f.icon}</span>
              <p className="text-xs text-muted-foreground mt-1">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
