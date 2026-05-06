import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import CategoryRing from '@/components/CategoryRing';
import GoalCard from '@/components/GoalCard';
import { getGoals, getGoalsByLevel, getCompletionRate, getStreak } from '@/lib/goalStore';
import { GoalCategory, CATEGORY_CONFIG } from '@/lib/types';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const allGoals = getGoals();
  const weeklyGoals = getGoalsByLevel('weekly');
  const quarterlyGoals = getGoalsByLevel('quarterly');
  const completionRate = getCompletionRate('weekly');
  const totalStreak = getStreak();
  const categories: GoalCategory[] = ['mental', 'emotional', 'financial', 'physical', 'professional'];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Good morning 👋</h1>
          <p className="text-muted-foreground mt-1">What's your main growth area this week?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-slide-up">
          <StatCard label="Weekly Progress" value={`${completionRate}%`} sublabel={`${weeklyGoals.filter(g => g.completed).length} of ${weeklyGoals.length} done`} accent />
          <StatCard label="Total Goals" value={allGoals.length} sublabel="Across all levels" />
          <StatCard label="Streak" value={`${totalStreak} wk`} sublabel="Keep it up!" />
          <StatCard label="This Quarter" value={`${quarterlyGoals.length}`} sublabel={`${getCompletionRate('quarterly')}% complete`} />
        </div>

        {/* Category Rings */}
        <div className="bg-card border border-border rounded-xl p-5 mb-8 animate-slide-up">
          <h2 className="text-sm font-semibold text-foreground mb-4">Growth Areas</h2>
          <div className="flex justify-around flex-wrap gap-4">
            {categories.map(cat => (
              <CategoryRing key={cat} category={cat} progress={getCompletionRate(undefined, cat)} />
            ))}
          </div>
        </div>

        {/* Weekly Priorities */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Weekly Priorities</h2>
            <Link to="/goals" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {weeklyGoals.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm mb-3">No weekly goals yet</p>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-sm font-medium text-accent-foreground"
              >
                <Plus className="w-4 h-4" /> Add your first goal
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {weeklyGoals.slice(0, 3).map(goal => (
                <GoalCard key={goal.id} goal={goal} onUpdate={refresh} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Categories */}
        <div className="animate-slide-up">
          <h2 className="text-sm font-semibold text-foreground mb-4">Explore by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map(cat => {
              const config = CATEGORY_CONFIG[cat];
              const count = allGoals.filter(g => g.category === cat).length;
              return (
                <Link
                  key={cat}
                  to={`/goals?category=${cat}`}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-elevated transition-all"
                >
                  <span className="text-xl">{config.icon}</span>
                  <p className="text-sm font-medium text-foreground mt-2">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{count} goals</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
