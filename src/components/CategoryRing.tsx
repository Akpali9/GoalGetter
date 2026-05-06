import { GoalCategory, CATEGORY_CONFIG } from '@/lib/types';

interface CategoryRingProps {
  category: GoalCategory;
  progress: number;
  size?: number;
}

export default function CategoryRing({ category, progress, size = 72 }: CategoryRingProps) {
  const cat = CATEGORY_CONFIG[category];
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={cat.color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
          {progress}%
        </span>
      </div>
      <span className="text-xs text-muted-foreground">{cat.icon} {cat.label}</span>
    </div>
  );
}
