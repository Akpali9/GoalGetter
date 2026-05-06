import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Flame, CalendarCheck, Plus, Target } from 'lucide-react';

const ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/daily', icon: Flame, label: 'Daily' },
  { to: '/new', icon: Plus, label: 'New' },
  { to: '/weekly', icon: CalendarCheck, label: 'Weekly' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 pb-safe">
      <div className="flex justify-around py-2">
        {ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                active ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${to === '/new' ? 'p-0.5 rounded-full gradient-accent text-accent-foreground' : ''}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
