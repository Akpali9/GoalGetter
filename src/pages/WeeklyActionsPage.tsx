import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { getGoalsByLevel, updateGoal } from '@/lib/goalStore';
import { CATEGORY_CONFIG, GoalCategory, Goal, TrackingType } from '@/lib/types';
import { Check, Plus, Minus, ChevronRight, ListChecks, Trophy, Clock, Pencil, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function EditActionModal({ goal, open, onClose, onSave }: {
  goal: Goal;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || '');
  const [category, setCategory] = useState<GoalCategory>(goal.category);
  const [trackingType, setTrackingType] = useState<TrackingType>(goal.trackingType);
  const [target, setTarget] = useState(goal.target?.toString() || '');
  const [unit, setUnit] = useState(goal.unit || '');
  const [current, setCurrent] = useState(goal.current.toString());

  const categories: GoalCategory[] = ['mental', 'emotional', 'financial', 'physical', 'professional'];

  const handleSave = () => {
    if (!title.trim()) return;
    const targetNum = Number(target) || undefined;
    const currentNum = Number(current) || 0;
    updateGoal(goal.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      trackingType,
      target: trackingType === 'binary' ? undefined : targetNum,
      unit: trackingType === 'binary' ? undefined : unit || undefined,
      current: currentNum,
      completed: trackingType === 'binary' ? goal.completed : targetNum ? currentNum >= targetNum : goal.completed,
    });
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Action</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Notes / Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Add notes, timing details..."
              className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    category === cat ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tracking</label>
            <div className="flex gap-2">
              {(['binary', 'numeric', 'time'] as TrackingType[]).map(tt => (
                <button
                  key={tt}
                  onClick={() => setTrackingType(tt)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    trackingType === tt ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tt === 'binary' ? '✓ Yes/No' : tt === 'numeric' ? '# Count' : '⏱ Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Target, unit, current for non-binary */}
          {trackingType !== 'binary' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Current</label>
                <input
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  type="number"
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Target</label>
                <input
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  type="number"
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Unit</label>
                <input
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="mins, reps..."
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl gradient-accent text-accent-foreground text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WeeklyActionsPage() {
  const [, setTick] = useState(0);
  const [activeFilter, setActiveFilter] = useState<GoalCategory | 'all'>('all');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  let weeklyGoals = getGoalsByLevel('weekly');
  if (activeFilter !== 'all') {
    weeklyGoals = weeklyGoals.filter(g => g.category === activeFilter);
  }

  const allWeekly = getGoalsByLevel('weekly');
  const completed = allWeekly.filter(g => g.completed).length;
  const total = allWeekly.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

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
                      onEdit={() => setEditingGoal(goal)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 animate-slide-up">
            {weeklyGoals.map(goal => (
              <ActionRow
                key={goal.id}
                goal={goal}
                onTap={handleTap}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onEdit={() => setEditingGoal(goal)}
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

        {/* Edit modal */}
        {editingGoal && (
          <EditActionModal
            goal={editingGoal}
            open={!!editingGoal}
            onClose={() => setEditingGoal(null)}
            onSave={refresh}
          />
        )}
      </div>
    </Layout>
  );
}

function ActionRow({ goal, onTap, onIncrement, onDecrement, onEdit }: {
  goal: ReturnType<typeof getGoalsByLevel>[0];
  onTap: (id: string, completed: boolean) => void;
  onIncrement: (id: string, current: number, target?: number) => void;
  onDecrement: (id: string, current: number) => void;
  onEdit: () => void;
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
          {goal.description && (
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{goal.description}</p>
          )}
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

        <button onClick={onEdit} className="p-1 text-muted-foreground hover:text-accent transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <Link to={`/goals/${goal.id}`} className="p-1 text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
