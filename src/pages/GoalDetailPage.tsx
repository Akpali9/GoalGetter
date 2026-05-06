import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import GoalCard from '@/components/GoalCard';
import { getGoals, getGoalsByParent, updateGoal } from '@/lib/goalStore';
import { CATEGORY_CONFIG } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

export default function GoalDetailPage() {
  const { id } = useParams();
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const goal = getGoals().find(g => g.id === id);
  if (!goal) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Goal not found</p>
          <Link to="/goals" className="text-accent text-sm hover:underline mt-2 inline-block">Back to goals</Link>
        </div>
      </Layout>
    );
  }

  const cat = CATEGORY_CONFIG[goal.category];
  const children = getGoalsByParent(goal.id);
  const progress = goal.target ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : goal.completed ? 100 : 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/goals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to goals
        </Link>

        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat.icon} {cat.label}</span>
            <span className="text-xs text-muted-foreground capitalize">{goal.level}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">{goal.title}</h1>
          {goal.description && <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>}

          {goal.target && goal.trackingType !== 'binary' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{goal.current} / {goal.target} {goal.unit}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full gradient-accent transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Quick update */}
          {goal.trackingType === 'numeric' && !goal.completed && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={goal.current}
                onBlur={e => { updateGoal(goal.id, { current: Number(e.target.value) }); refresh(); }}
                className="w-24 px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">{goal.unit}</span>
            </div>
          )}
        </div>

        {children.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Sub-goals</h2>
            <div className="space-y-2">
              {children.map(child => (
                <GoalCard key={child.id} goal={child} onUpdate={refresh} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
