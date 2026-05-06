export type GoalCategory = 'mental' | 'emotional' | 'financial' | 'physical' | 'professional';

export type TrackingType = 'numeric' | 'binary' | 'time' | 'rating';

export type GoalLevel = 'yearly' | 'quarterly' | 'monthly' | 'weekly' | 'daily';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  trackingType: TrackingType;
  level: GoalLevel;
  parentId?: string;
  target?: number;
  current: number;
  unit?: string;
  completed: boolean;
  createdAt: string;
  order: number;
}

export interface GoalTemplate {
  id: string;
  title: string;
  category: GoalCategory;
  description: string;
  trackingType: TrackingType;
  yearlyTarget: number;
  unit: string;
  breakdown: string;
}

export const CATEGORY_CONFIG: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  mental: { label: 'Mental', icon: '🧠', color: 'hsl(280 50% 55%)' },
  emotional: { label: 'Emotional', icon: '💛', color: 'hsl(38 92% 55%)' },
  financial: { label: 'Financial', icon: '💰', color: 'hsl(152 60% 42%)' },
  physical: { label: 'Physical', icon: '💪', color: 'hsl(195 70% 50%)' },
  professional: { label: 'Professional', icon: '🎯', color: 'hsl(215 20% 25%)' },
};

export const TEMPLATES: GoalTemplate[] = [
  { id: 't1', title: 'Read 12 Books', category: 'mental', description: '1 book/month ≈ 25 pages/week', trackingType: 'numeric', yearlyTarget: 12, unit: 'books', breakdown: '1/month → ~25 pages/week' },
  { id: 't2', title: 'Save $10,000', category: 'financial', description: '$833/month → $192/week', trackingType: 'numeric', yearlyTarget: 10000, unit: 'dollars', breakdown: '$833/month → $192/week' },
  { id: 't3', title: 'Meditate Daily', category: 'emotional', description: '30 min/day meditation practice', trackingType: 'time', yearlyTarget: 365, unit: 'sessions', breakdown: '30 min/day' },
  { id: 't4', title: 'Exercise 4x/Week', category: 'physical', description: '208 sessions per year', trackingType: 'numeric', yearlyTarget: 208, unit: 'sessions', breakdown: '4 sessions/week' },
  { id: 't5', title: 'Complete Certification', category: 'professional', description: 'Finish a professional certification', trackingType: 'binary', yearlyTarget: 1, unit: 'certification', breakdown: 'Q1: Research → Q2: Study → Q3: Exam' },
  { id: 't6', title: 'Journal Weekly', category: 'emotional', description: 'Weekly reflective journaling practice', trackingType: 'numeric', yearlyTarget: 52, unit: 'entries', breakdown: '1 entry/week' },
];
