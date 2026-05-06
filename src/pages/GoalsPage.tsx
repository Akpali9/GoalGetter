import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import GoalCard from '@/components/GoalCard';
import { getGoals } from '@/lib/goalStore';
import { GoalCategory, GoalLevel, CATEGORY_CONFIG } from '@/lib/types';

const LEVELS: GoalLevel[] = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'];

export default function GoalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const activeCategory = (searchParams.get('category') as GoalCategory) || undefined;
  const activeLevel = (searchParams.get('level') as GoalLevel) || undefined;

  let goals = getGoals();
  if (activeCategory) goals = goals.filter(g => g.category === activeCategory);
  if (activeLevel) goals = goals.filter(g => g.level === activeLevel);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Goals</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { searchParams.set('category', key); setSearchParams(searchParams); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>

        {/* Level tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => { searchParams.delete('level'); setSearchParams(searchParams); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              !activeLevel ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Levels
          </button>
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => { searchParams.set('level', level); setSearchParams(searchParams); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                activeLevel === level ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Goal list */}
        {goals.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No goals found. Start by creating one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onUpdate={refresh} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
