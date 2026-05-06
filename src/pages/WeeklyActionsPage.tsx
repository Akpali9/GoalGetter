import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { getGoalsByLevel, updateGoal } from '@/lib/goalStore';
import { CATEGORY_CONFIG, GoalCategory } from '@/lib/types';
import { Check, Plus, Minus, ChevronRight, ListChecks, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WeeklyActionsPage() {
  const [, setTick] = useState(0);
  const [activeFilter, setActiveFilter] = useState<GoalCategory | 'all'>('all');
  const refresh = useCallback(() => setTick(t => t + 1), []);

  let weeklyGoals = getGoalsByLevel('weekly');
  if (activeFilter !== 'all') {
    weeklyGoals = weeklyGoals.filter(g => g.category === activeFilter);
  }

  const allWeekly = getGoalsByLevel('weekly');
  const completed = allWeekly.filter(g => g.completed).length;
  const total = allWeekly.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Days remaining in the week
  const dayOfWeek = new Date().getDay();
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const handleTap = (goalId: string, isCompleted: boolean) => {
    updateGoal(goalId, { completed: !isCompleted, current: isCompleted ? 0 : 1 });
    refresh();
  };

  const handleIncrement = (goalId: string, current: number, target?: number) => {
    const next = current + 1;
    updateGoal(goalId, { current: next, completed: target ? next >= target : false });
    refresh();
  };

  const handleDecrement = (goalId: string, current: number) => {
    const next = Math.max(0, current - 1);
    updateGoal(goalId, { current: next, completed: false });
    refresh();
  };

  const categories: GoalCategory[] = ['mental', 'emotional', 'financial', 'physical', 'professional'];

  // Group by category
  const grouped = categories
    .map(cat => ({
      cat,
      config: CATEGORY_CONFIG[cat],
      goals: weeklyGoals.filter(g => g.category === cat),
    }))
    .filter(g => g.goals.length > 0);

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5 animate-fade-in">
          <h1 className="text-xl font-bold text-foreground">Weekly Actions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {daysLeft === 0 ? 'Last day of the week!' : `${daysLeft} days remaining this week`}
          </p>
        </div>

        {/* Progress banner */}
        <div className="gradient-accent rounded-2xl p-4 mb-5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-accent-foreground">{completed} of {total} complete</p>
              <p className="text-xs text-accent-foreground/70">
                {pct >= 100 ? '🎉 All done! Amazing week!' : pct >= 60 ? '🔥 Great momentum!' : 'Keep going!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent-foreground">{pct}%</p>
            </div>
          </div>
          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 animate-slide-up">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <ListChecks className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-base font-bold text-foreground">{total}</p>
            <p className="text-[10px] text-muted-foreground">Actions</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Trophy className="w-4 h-4 text-success mx-auto mb-1" />
            <p className="text-base font-bold text-foreground">{completed}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-base font-bold text-foreground">{daysLeft}</p>
            <p className="text-[10px] text-muted-foreground">Days Left</p>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide animate-slide-up">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all' ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            All
          </button>
          {categories.map(cat => {
            const count = allWeekly.filter(g => g.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === cat ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Actions list */}
        {weeklyGoals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {activeFilter !== 'all' ? `No ${CATEGORY_CONFIG[activeFilter].label} actions` : 'No weekly actions yet'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">Set 3-6 key actions to tackle this week.</p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-sm font-medium text-accent-foreground"
            >
              <Plus className="w-4 h-4" /> Add Action
            </Link>
          </div>
        ) : activeFilter === 'all' ? (
          /* Grouped view */
          <div className="space-y-4 animate-slide-up">
            {grouped.map(({ cat, config, goals }) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-xs font-semibold text-foreground">{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {goals.filter(g => g.completed).length}/{goals.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {goals.map(goal => (
                    <ActionRow
                      key={goal.id}
                      goal={goal}
                      onTap={handleTap}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flat view */
          <div className="space-y-1.5 animate-slide-up">
            {weeklyGoals.map(goal => (
              <ActionRow
                key={goal.id}
                goal={goal}
                onTap={handleTap}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))}
          </div>
        )}

        {weeklyGoals.length > 0 && (
          <Link
            to="/new"
            className="flex items-center justify-center gap-2 py-3 mt-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Action
          </Link>
        )}
      </div>
    </Layout>
  );
}

function ActionRow({ goal, onTap, onIncrement, onDecrement }: {
  goal: ReturnType<typeof getGoalsByLevel>[0];
  onTap: (id: string, completed: boolean) => void;
  onIncrement: (id: string, current: number, target?: number) => void;
  onDecrement: (id: string, current: number) => void;
}) {
  const cat = CATEGORY_CONFIG[goal.category];
  const progress = goal.target ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : goal.completed ? 100 : 0;

  return (
    <div className={`bg-card border rounded-2xl p-3.5 transition-all active:scale-[0.98] ${
      goal.completed ? 'border-success/30 bg-success/5' : 'border-border'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTap(goal.id, goal.completed)}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
            goal.completed
              ? 'bg-success text-success-foreground shadow-md'
              : 'border-2 border-border hover:border-accent'
          }`}
        >
          {goal.completed && <Check className="w-5 h-5" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {goal.title}
          </p>
          {goal.target && goal.trackingType !== 'binary' && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full gradient-accent transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{goal.current}/{goal.target}</span>
            </div>
          )}
        </div>

        {goal.trackingType === 'numeric' && !goal.completed && goal.target && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onDecrement(goal.id, goal.current)}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground active:scale-90"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onIncrement(goal.id, goal.current, goal.target)}
              className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-accent-foreground active:scale-90"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}

        <Link to={`/goals/${goal.id}`} className="p-1 text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
