import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FUNCTION_VERSION = '1.0.0';

interface FeedbackBody {
  ai_reply_id?: string | null;
  rating?: number;
  user_message?: string | null;
  assistant_message?: string;
  session_id?: string | null;
  goals_snapshot?: unknown;
  model_name?: string | null;
  function_version?: string | null;
  prompt_hash?: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: FeedbackBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const errors: Record<string, string> = {};
  if (!body.ai_reply_id || typeof body.ai_reply_id !== 'string' || !UUID_RE.test(body.ai_reply_id)) {
    errors.ai_reply_id = 'Required UUID';
  }
  if (body.rating !== 1 && body.rating !== -1) {
    errors.rating = 'Must be 1 or -1';
  }
  if (!body.assistant_message || typeof body.assistant_message !== 'string') {
    errors.assistant_message = 'Required string';
  }
  if (Object.keys(errors).length) {
    return new Response(JSON.stringify({ error: errors }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Resolve user from JWT (optional)
  let userId: string | null = null;
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    userId = data.user?.id ?? null;
  }

  const aiReplyId = body.ai_reply_id as string;

  // Idempotency: check existing row first
  const { data: existing, error: fetchErr } = await supabase
    .from('ai_coach_feedback')
    .select('*')
    .eq('ai_reply_id', aiReplyId)
    .maybeSingle();

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (existing) {
    return new Response(JSON.stringify({ data: existing, idempotent: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'x-function-version': FUNCTION_VERSION,
        'x-idempotent-replay': 'true',
      },
    });
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('ai_coach_feedback')
    .insert({
      user_id: userId,
      rating: body.rating!,
      user_message: body.user_message ?? null,
      assistant_message: body.assistant_message!,
      session_id: body.session_id ?? null,
      goals_snapshot: body.goals_snapshot ?? null,
      model_name: body.model_name ?? null,
      function_version: body.function_version ?? null,
      prompt_hash: body.prompt_hash ?? null,
      ai_reply_id: aiReplyId,
    })
    .select()
    .single();

  if (insertErr) {
    // Race: unique violation → fetch and return existing row
    if ((insertErr as any).code === '23505' || /duplicate key|unique constraint/i.test(insertErr.message)) {
      const { data: race } = await supabase
        .from('ai_coach_feedback')
        .select('*')
        .eq('ai_reply_id', aiReplyId)
        .maybeSingle();
      if (race) {
        return new Response(JSON.stringify({ data: race, idempotent: true }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'x-function-version': FUNCTION_VERSION,
            'x-idempotent-replay': 'true',
          },
        });
      }
    }
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: inserted, idempotent: false }), {
    status: 201,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'x-function-version': FUNCTION_VERSION,
      'x-idempotent-replay': 'false',
    },
  });
});
