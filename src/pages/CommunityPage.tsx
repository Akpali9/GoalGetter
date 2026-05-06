import Layout from '@/components/Layout';
import { Users, MessageCircle, ExternalLink } from 'lucide-react';

const GROUPS = [
  { name: 'Wealth Builders 2025', members: 248, category: '💰 Financial', desc: 'Weekly savings challenges and accountability' },
  { name: '30 Days of Mindfulness', members: 512, category: '💛 Emotional', desc: 'Daily meditation and journaling prompts' },
  { name: 'Book Club: 12 in 12', members: 185, category: '🧠 Mental', desc: 'Read one book per month together' },
  { name: 'Morning Run Crew', members: 93, category: '💪 Physical', desc: 'Early risers running 3x per week' },
  { name: 'Career Accelerator', members: 341, category: '🎯 Professional', desc: 'Networking, skills, and career growth' },
];

export default function CommunityPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Join WhatsApp groups based on shared goals. Connect with like-minded people on your growth journey.
        </p>

        <div className="space-y-3">
          {GROUPS.map(group => (
            <div key={group.name} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-elevated transition-all animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{group.category}</span>
                </div>
                <p className="text-xs text-muted-foreground">{group.desc}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {group.members} members
                </p>
              </div>
              <button className="shrink-0 px-4 py-2 rounded-lg bg-success text-success-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Join
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="text-sm font-semibold text-foreground mb-2">Start Your Own Journey</h3>
          <p className="text-xs text-muted-foreground mb-4">Create a WhatsApp group around your goal and invite others</p>
          <button className="px-6 py-2.5 rounded-xl gradient-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Create Group
          </button>
        </div>
      </div>
    </Layout>
  );
}
