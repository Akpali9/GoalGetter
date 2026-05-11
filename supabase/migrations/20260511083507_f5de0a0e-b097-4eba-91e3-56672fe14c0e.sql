ALTER TABLE public.ai_coach_feedback
  ADD COLUMN model_name TEXT,
  ADD COLUMN function_version TEXT,
  ADD COLUMN prompt_hash TEXT;

CREATE INDEX idx_ai_coach_feedback_model ON public.ai_coach_feedback(model_name);
CREATE INDEX idx_ai_coach_feedback_prompt_hash ON public.ai_coach_feedback(prompt_hash);