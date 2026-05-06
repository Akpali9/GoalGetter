import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Plus, BookTemplate, Settings } from 'lucide-react';

const ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/new', icon: Plus, label: 'New' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/settings', icon: Settings, label: 'Settings' },
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
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
