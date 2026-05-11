CREATE TABLE public.ai_coach_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
  user_message TEXT,
  assistant_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_coach_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.ai_coach_feedback
FOR INSERT
TO public
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.ai_coach_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);