ALTER TABLE public.ai_coach_feedback
  ADD COLUMN ai_reply_id UUID;

CREATE INDEX idx_ai_coach_feedback_reply ON public.ai_coach_feedback(ai_reply_id);