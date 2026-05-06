import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Plus, BookTemplate, Users, Settings } from 'lucide-react';
import logoImg from '@/assets/logo.png';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/new', icon: Plus, label: 'New Goal' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-4">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <img src={logoImg} alt="GoalGetter" width={36} height={36} className="rounded-lg" />
        <span className="text-lg font-semibold text-foreground tracking-tight">GoalGetter</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 py-3 rounded-lg bg-muted">
        <p className="text-xs text-muted-foreground">Free Plan</p>
        <p className="text-xs text-muted-foreground mt-1">3 of 5 goals used</p>
        <button className="mt-2 text-xs font-medium text-accent hover:underline">Upgrade to Pro</button>
      </div>
    </aside>
  );
}
