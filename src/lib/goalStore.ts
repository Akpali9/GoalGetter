import { Goal, GoalCategory, GoalLevel, TrackingType } from './types';

const STORAGE_KEY = 'goalgetter_goals';

function loadGoals(): Goal[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function getGoals(): Goal[] {
  return loadGoals().sort((a, b) => a.order - b.order);
}

export function getGoalsByLevel(level: GoalLevel): Goal[] {
  return getGoals().filter(g => g.level === level);
}

export function getGoalsByParent(parentId: string): Goal[] {
  return getGoals().filter(g => g.parentId === parentId);
}

export function getGoalsByCategory(category: GoalCategory): Goal[] {
  return getGoals().filter(g => g.category === category);
}

export function addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'order'>): Goal {
  const goals = loadGoals();
  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    order: goals.length,
  };
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  const goals = loadGoals();
  const idx = goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    goals[idx] = { ...goals[idx], ...updates };
    saveGoals(goals);
  }
}

export function deleteGoal(id: string): void {
  let goals = loadGoals();
  // Also delete children
  const toDelete = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const g of goals) {
      if (g.parentId && toDelete.has(g.parentId) && !toDelete.has(g.id)) {
        toDelete.add(g.id);
        changed = true;
      }
    }
  }
  goals = goals.filter(g => !toDelete.has(g.id));
  saveGoals(goals);
}

export function getCompletionRate(level?: GoalLevel, category?: GoalCategory): number {
  let goals = getGoals();
  if (level) goals = goals.filter(g => g.level === level);
  if (category) goals = goals.filter(g => g.category === category);
  if (goals.length === 0) return 0;
  const completed = goals.filter(g => g.completed).length;
  return Math.round((completed / goals.length) * 100);
}

export function getStreak(category?: GoalCategory): number {
  // Simplified streak: count consecutive completed weekly goals
  let goals = getGoals().filter(g => g.level === 'weekly');
  if (category) goals = goals.filter(g => g.category === category);
  let streak = 0;
  for (const g of goals.reverse()) {
    if (g.completed) streak++;
    else break;
  }
  return streak;
}
