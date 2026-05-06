interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sublabel, accent }: StatCardProps) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'gradient-accent border-transparent' : 'bg-card border-border shadow-soft'}`}>
      <p className={`text-xs font-medium uppercase tracking-wider ${accent ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${accent ? 'text-accent-foreground' : 'text-foreground'}`}>
        {value}
      </p>
      {sublabel && (
        <p className={`text-xs mt-1 ${accent ? 'text-accent-foreground/60' : 'text-muted-foreground'}`}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
