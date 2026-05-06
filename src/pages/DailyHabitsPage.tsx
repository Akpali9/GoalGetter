import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { getGoalsByLevel, updateGoal, addGoal } from '@/lib/goalStore';
import { CATEGORY_CONFIG, GoalCategory } from '@/lib/types';
import { Check, Plus, Flame, TrendingUp, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DailyHabitsPage() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const dailyGoals = getGoalsByLevel('daily');
  const completed = dailyGoals.filter(g => g.completed).length;
  const total = dailyGoals.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Simulated 7-day history based on goal order
  const dayOfWeek = new Date().getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

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

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with progress ring */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-foreground">Today's Habits</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="3"
                strokeDasharray={`${pct * 0.974} 97.4`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">{pct}%</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Check className="w-4 h-4 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{completed}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{total - completed}</p>
            <p className="text-[10px] text-muted-foreground">Remaining</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Flame className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Week dots */}
        <div className="flex justify-between mb-6 px-2 animate-slide-up">
          {DAYS.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-medium ${i === todayIdx ? 'text-accent' : 'text-muted-foreground'}`}>{day}</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i === todayIdx
                  ? 'gradient-accent text-accent-foreground'
                  : i < todayIdx
                    ? 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {i < todayIdx ? <Check className="w-3 h-3" /> : i === todayIdx ? new Date().getDate() : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Habit list */}
        {dailyGoals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Flame className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No daily habits yet</p>
            <p className="text-xs text-muted-foreground mb-4">Start small — add 1-3 habits you want to do every day.</p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-sm font-medium text-accent-foreground"
            >
              <Plus className="w-4 h-4" /> Add Habit
            </Link>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {dailyGoals.map(goal => {
              const cat = CATEGORY_CONFIG[goal.category];
              const progress = goal.target ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : goal.completed ? 100 : 0;

              return (
                <div
                  key={goal.id}
                  className={`bg-card border rounded-2xl p-4 transition-all active:scale-[0.98] ${
                    goal.completed ? 'border-success/30 bg-success/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* One-tap check */}
                    <button
                      onClick={() => handleTap(goal.id, goal.completed)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                        goal.completed
                          ? 'bg-success text-success-foreground shadow-md'
                          : 'border-2 border-border hover:border-accent'
                      }`}
                    >
                      {goal.completed && <Check className="w-5 h-5" strokeWidth={3} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs">{cat.icon}</span>
                        <span className={`text-sm font-medium ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {goal.title}
                        </span>
                      </div>

                      {/* Progress bar for numeric/time */}
                      {goal.target && goal.trackingType !== 'binary' && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full gradient-accent transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {goal.current}/{goal.target} {goal.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stepper for numeric goals */}
                    {goal.trackingType === 'numeric' && !goal.completed && goal.target && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDecrement(goal.id, goal.current)}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleIncrement(goal.id, goal.current, goal.target)}
                          className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-accent-foreground active:scale-90 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add more */}
            <Link
              to="/new"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Habit
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
