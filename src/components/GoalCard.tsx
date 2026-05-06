import { Goal, CATEGORY_CONFIG } from '@/lib/types';
import { Check, Trash2, ChevronRight } from 'lucide-react';
import { updateGoal, deleteGoal } from '@/lib/goalStore';
import { Link } from 'react-router-dom';

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
  showCategory?: boolean;
}

export default function GoalCard({ goal, onUpdate, showCategory = true }: GoalCardProps) {
  const cat = CATEGORY_CONFIG[goal.category];
  const progress = goal.target ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : goal.completed ? 100 : 0;

  const handleToggle = () => {
    if (goal.trackingType === 'binary') {
      updateGoal(goal.id, { completed: !goal.completed, current: goal.completed ? 0 : 1 });
    } else if (goal.target && goal.current >= goal.target) {
      updateGoal(goal.id, { completed: true });
    }
    onUpdate();
  };

  const handleIncrement = () => {
    const next = goal.current + 1;
    updateGoal(goal.id, { current: next, completed: goal.target ? next >= goal.target : false });
    onUpdate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteGoal(goal.id);
    onUpdate();
  };

  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 shadow-soft hover:shadow-elevated transition-all animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Toggle */}
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
            goal.completed
              ? 'bg-success border-success'
              : 'border-border hover:border-accent'
          }`}
        >
          {goal.completed && <Check className="w-3 h-3 text-success-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {showCategory && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {cat.icon} {cat.label}
              </span>
            )}
            <span className="text-xs text-muted-foreground capitalize">{goal.level}</span>
          </div>
          <p className={`text-sm font-medium ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {goal.title}
          </p>

          {/* Progress */}
          {goal.target && goal.trackingType !== 'binary' && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{goal.current} / {goal.target} {goal.unit}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 gradient-accent"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Increment for numeric */}
          {goal.trackingType === 'numeric' && !goal.completed && (
            <button
              onClick={handleIncrement}
              className="mt-2 text-xs font-medium text-accent hover:underline"
            >
              + Add progress
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleDelete} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Link to={`/goals/${goal.id}`} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
