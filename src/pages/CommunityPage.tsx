import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Users, MessageCircle, Plus, LogIn, LogOut, Loader2, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface GroupWithCount {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  created_by: string | null;
  created_at: string;
  member_count: number;
  whatsapp_link: string | null;
}

const CATEGORY_OPTIONS = [
  { value: '💰 Financial', label: '💰 Financial' },
  { value: '💛 Emotional', label: '💛 Emotional' },
  { value: '🧠 Mental', label: '🧠 Mental' },
  { value: '💪 Physical', label: '💪 Physical' },
  { value: '🎯 Professional', label: '🎯 Professional' },
];

export default function CommunityPage() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: CATEGORY_OPTIONS[0].value, whatsappLink: '' });
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    const { data } = await supabase
      .from('community_groups_with_counts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setGroups(data.map(g => ({
        id: g.id!,
        name: g.name!,
        description: g.description,
        category: g.category!,
        icon: g.icon!,
        created_by: g.created_by,
        created_at: g.created_at!,
        member_count: g.member_count ?? 0,
        whatsapp_link: (g as any).whatsapp_link ?? null,
      })));
    }
    setLoadingGroups(false);
  }, []);

  const fetchMemberships = useCallback(async () => {
    if (!user) { setMyMemberships(new Set()); return; }
    const { data } = await supabase
      .from('community_memberships')
      .select('group_id')
      .eq('user_id', user.id);
    if (data) setMyMemberships(new Set(data.map(m => m.group_id)));
  }, [user]);

  useEffect(() => {
    fetchGroups();
    fetchMemberships();
  }, [fetchGroups, fetchMemberships]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_groups' }, () => fetchGroups())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_memberships' }, () => {
        fetchGroups();
        fetchMemberships();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchGroups, fetchMemberships]);

  const handleJoin = async (groupId: string) => {
    if (!user) { setShowAuth(true); return; }
    setJoiningId(groupId);
    const { error } = await supabase.from('community_memberships').insert({ group_id: groupId, user_id: user.id });
    setJoiningId(null);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Joined!', description: 'You are now a member.' });
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!user) return;
    setJoiningId(groupId);
    await supabase.from('community_memberships').delete().eq('group_id', groupId).eq('user_id', user.id);
    setJoiningId(null);
    toast({ title: 'Left group' });
  };

  const handleCreateGroup = async () => {
    if (!user) { setShowAuth(true); return; }
    if (!newGroup.name.trim()) return;
    const { error } = await supabase.from('community_groups').insert({
      name: newGroup.name.trim(),
      description: newGroup.description.trim() || null,
      category: newGroup.category,
      created_by: user.id,
      whatsapp_link: newGroup.whatsappLink.trim() || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setShowCreate(false);
      setNewGroup({ name: '', description: '', category: CATEGORY_OPTIONS[0].value, whatsappLink: '' });
      toast({ title: 'Group created!' });
    }
  };

  const handleAuth = async () => {
    setAuthSubmitting(true);
    const { error } = authMode === 'login'
      ? await signIn(authEmail, authPassword)
      : await signUp(authEmail, authPassword);
    setAuthSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setShowAuth(false);
      setAuthEmail('');
      setAuthPassword('');
      toast({ title: authMode === 'login' ? 'Welcome back!' : 'Check your email to confirm signup.' });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Create Group
                </Button>
                <Button size="sm" variant="ghost" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowAuth(true)}>
                <LogIn className="w-4 h-4 mr-1" /> Sign In
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Join groups based on shared goals. Connect with like-minded people on your growth journey.
        </p>

        {loadingGroups ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No groups yet. Be the first to create one!</div>
        ) : (
          <div className="space-y-3">
            {groups.map(group => {
              const isMember = myMemberships.has(group.id);
              const busy = joiningId === group.id;
              return (
                <div key={group.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-elevated transition-all animate-fade-in">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                    {group.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{group.category}</span>
                    </div>
                    {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count} members</span>
                      {group.whatsapp_link && (
                        <>
                          <a href={group.whatsapp_link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-success hover:underline font-medium">
                            <ExternalLink className="w-3 h-3" /> WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(group.whatsapp_link!);
                                toast({ title: 'Link copied!', description: 'WhatsApp invite link copied to clipboard.' });
                              } catch {
                                toast({ title: 'Copy failed', description: 'Could not copy link.', variant: 'destructive' });
                              }
                            }}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline font-medium"
                          >
                            <Copy className="w-3 h-3" /> Copy link
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                  {isMember ? (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => handleLeave(group.id)}>
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Leave'}
                    </Button>
                  ) : (
                    <Button size="sm" disabled={busy} onClick={() => handleJoin(group.id)}
                      className="bg-success text-success-foreground hover:bg-success/90">
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Join'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Group Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Group</DialogTitle>
              <DialogDescription>Start a community around a shared goal.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Group name" value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} />
              <Input placeholder="Description (optional)" value={newGroup.description} onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))} />
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={newGroup.category}
                onChange={e => setNewGroup(g => ({ ...g, category: e.target.value }))}
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Input placeholder="WhatsApp invite link (optional)" value={newGroup.whatsappLink} onChange={e => setNewGroup(g => ({ ...g, whatsappLink: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateGroup} disabled={!newGroup.name.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auth Dialog */}
        <Dialog open={showAuth} onOpenChange={setShowAuth}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle>
              <DialogDescription>Sign in to join and create community groups.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
            </div>
            <DialogFooter className="flex-col gap-2">
              <Button onClick={handleAuth} disabled={authSubmitting || !authEmail || !authPassword}>
                {authSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
              <button className="text-xs text-muted-foreground hover:underline" onClick={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
