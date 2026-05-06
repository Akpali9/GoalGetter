import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { TEMPLATES, CATEGORY_CONFIG } from '@/lib/types';
import { addGoal } from '@/lib/goalStore';

export default function TemplatesPage() {
  const navigate = useNavigate();

  const useTemplate = (templateId: string) => {
    const t = TEMPLATES.find(tpl => tpl.id === templateId);
    if (!t) return;
    addGoal({
      title: t.title,
      description: t.description,
      category: t.category,
      level: 'yearly',
      trackingType: t.trackingType,
      target: t.yearlyTarget,
      current: 0,
      unit: t.unit,
      completed: false,
    });
    navigate('/goals');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Goal Templates</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Start with a proven framework. All templates are fully editable after creation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map(t => {
            const cat = CATEGORY_CONFIG[t.category];
            return (
              <div
                key={t.id}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-elevated transition-all animate-fade-in"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat.label}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{t.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">{t.description}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Breakdown: {t.breakdown}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">{t.trackingType} · {t.yearlyTarget} {t.unit}/year</span>
                  <button
                    onClick={() => useTemplate(t.id)}
                    className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
