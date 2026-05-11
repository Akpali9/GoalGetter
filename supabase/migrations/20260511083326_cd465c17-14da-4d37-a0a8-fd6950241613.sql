ALTER TABLE public.ai_coach_feedback
  ADD COLUMN session_id UUID,
  ADD COLUMN goals_snapshot JSONB;

CREATE INDEX idx_ai_coach_feedback_session ON public.ai_coach_feedback(session_id);