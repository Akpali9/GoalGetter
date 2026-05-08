
-- Fix view to use security invoker
DROP VIEW IF EXISTS public.community_groups_with_counts;
CREATE VIEW public.community_groups_with_counts
WITH (security_invoker = true)
AS
SELECT g.*, COALESCE(m.member_count, 0) AS member_count
FROM public.community_groups g
LEFT JOIN (
  SELECT group_id, COUNT(*) AS member_count
  FROM public.community_memberships
  GROUP BY group_id
) m ON m.group_id = g.id;

-- Tighten insert policy on groups
DROP POLICY "Authenticated users can create groups" ON public.community_groups;
CREATE POLICY "Authenticated users can create groups" ON public.community_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
