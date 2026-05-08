
-- Community groups table
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💬',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community memberships table
CREATE TABLE public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- Member count view
CREATE OR REPLACE VIEW public.community_groups_with_counts AS
SELECT g.*, COALESCE(m.member_count, 0) AS member_count
FROM public.community_groups g
LEFT JOIN (
  SELECT group_id, COUNT(*) AS member_count
  FROM public.community_memberships
  GROUP BY group_id
) m ON m.group_id = g.id;

-- Enable RLS
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read groups
CREATE POLICY "Anyone can view groups" ON public.community_groups FOR SELECT USING (true);
-- RLS: authenticated users can create groups
CREATE POLICY "Authenticated users can create groups" ON public.community_groups FOR INSERT TO authenticated WITH CHECK (true);

-- RLS: anyone can read memberships
CREATE POLICY "Anyone can view memberships" ON public.community_memberships FOR SELECT USING (true);
-- RLS: authenticated users can join groups
CREATE POLICY "Users can join groups" ON public.community_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- RLS: users can leave groups
CREATE POLICY "Users can leave groups" ON public.community_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_memberships;
