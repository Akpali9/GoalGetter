import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { addGoal } from '@/lib/goalStore';
import { GoalCategory, GoalLevel, TrackingType, CATEGORY_CONFIG } from '@/lib/types';

const LEVELS: GoalLevel[] = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'];
const TRACKING_TYPES: { value: TrackingType; label: string; desc: string }[] = [
  { value: 'numeric', label: 'Numeric', desc: 'Count towards a target (e.g., books read, $ saved)' },
  { value: 'binary', label: 'Done / Not Done', desc: 'Simple completion check' },
  { value: 'time', label: 'Time-Based', desc: 'Track minutes or hours (e.g., 30 min/day)' },
  { value: 'rating', label: 'Rating (1–10)', desc: 'Self-rate your progress on a scale' },
];

export default function NewGoalPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('mental');
  const [level, setLevel] = useState<GoalLevel>('weekly');
  const [trackingType, setTrackingType] = useState<TrackingType>('numeric');
  const [target, setTarget] = useState<string>('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      level,
      trackingType,
      target: target ? Number(target) : undefined,
      current: 0,
      unit: unit.trim() || undefined,
      completed: false,
    });
    navigate('/goals');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Create New Goal</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Read 12 books this year"
              className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add context or motivation..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as GoalCategory)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === key
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Goal Level</label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-xl border text-xs font-medium capitalize transition-all ${
                    level === l
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">How do you want to track this?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRACKING_TYPES.map(tt => (
                <button
                  key={tt.value}
                  type="button"
                  onClick={() => setTrackingType(tt.value)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    trackingType === tt.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card hover:border-accent/50'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{tt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target & Unit */}
          {trackingType !== 'binary' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Target</label>
                <input
                  type="number"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="e.g., 12"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g., books, dollars, minutes"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl gradient-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Create Goal
          </button>
        </form>
      </div>
    </Layout>
  );
}
