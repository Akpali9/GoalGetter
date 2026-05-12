import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FUNCTION_VERSION = '1.1.0';

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

// Ad-hoc in-memory rate limiter (per edge instance — best-effort only)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // max 20 feedback submissions per key per minute
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  // Opportunistic cleanup
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const filtered = v.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (filtered.length === 0) hits.delete(k);
      else hits.set(k, filtered);
    }
  }
  return false;
}

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  // --- Auth: require a valid JWT ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);

  const authClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const userId = claimsData.claims.sub as string;

  // --- Rate limit per user + IP ---
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rlKey = `${userId}:${ip}`;
  if (isRateLimited(rlKey)) {
    return jsonResponse(
      { error: 'Too many requests. Please slow down.' },
      429,
      { 'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) },
    );
  }

  // --- Parse + validate body ---
  let body: FeedbackBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const errors: Record<string, string> = {};
  if (!body.ai_reply_id || typeof body.ai_reply_id !== 'string' || !UUID_RE.test(body.ai_reply_id)) {
    errors.ai_reply_id = 'Required UUID';
  }
  if (body.rating !== 1 && body.rating !== -1) errors.rating = 'Must be 1 or -1';
  if (!body.assistant_message || typeof body.assistant_message !== 'string') {
    errors.assistant_message = 'Required string';
  }
  if (Object.keys(errors).length) return jsonResponse({ error: errors }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const aiReplyId = body.ai_reply_id as string;

  // --- Idempotency: existing row check ---
  const { data: existing, error: fetchErr } = await supabase
    .from('ai_coach_feedback')
    .select('*')
    .eq('ai_reply_id', aiReplyId)
    .maybeSingle();
  if (fetchErr) return jsonResponse({ error: fetchErr.message }, 500);

  if (existing) {
    // Authorization: only the original submitter (or an anonymous original) can replay
    if (existing.user_id && existing.user_id !== userId) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }
    return jsonResponse({ data: existing, idempotent: true }, 200, {
      'x-function-version': FUNCTION_VERSION,
      'x-idempotent-replay': 'true',
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
    if ((insertErr as any).code === '23505' || /duplicate key|unique constraint/i.test(insertErr.message)) {
      const { data: race } = await supabase
        .from('ai_coach_feedback')
        .select('*')
        .eq('ai_reply_id', aiReplyId)
        .maybeSingle();
      if (race) {
        if (race.user_id && race.user_id !== userId) {
          return jsonResponse({ error: 'Forbidden' }, 403);
        }
        return jsonResponse({ data: race, idempotent: true }, 200, {
          'x-function-version': FUNCTION_VERSION,
          'x-idempotent-replay': 'true',
        });
      }
    }
    return jsonResponse({ error: insertErr.message }, 500);
  }

  return jsonResponse({ data: inserted, idempotent: false }, 201, {
    'x-function-version': FUNCTION_VERSION,
    'x-idempotent-replay': 'false',
  });
});
