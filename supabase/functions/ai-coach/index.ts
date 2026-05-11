// AI Coach edge function — streams responses via Lovable AI Gateway
const FUNCTION_VERSION = "2026-05-11.1";
const MODEL_NAME = "google/gemini-2.5-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-ai-model, x-function-version, x-prompt-hash",
};

interface Goal {
  title: string;
  category: string;
  level: string;
  completed: boolean;
  current?: number;
  target?: number;
  unit?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, goals } = await req.json() as { messages: ChatMessage[]; goals: Goal[] };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const goalSummary = goals && goals.length
      ? goals.map((g) => {
          const progress = g.target ? ` (${g.current ?? 0}/${g.target}${g.unit ? " " + g.unit : ""})` : "";
          return `- [${g.completed ? "x" : " "}] ${g.level}/${g.category}: ${g.title}${progress}`;
        }).join("\n")
      : "No goals set yet.";

    const systemPrompt = `You are GoalGetter AI Coach — a warm, sharp personal-growth coach inside the GoalGetter app.

Voice: encouraging, concrete, never preachy. Short paragraphs. Use **bold** for key ideas and emoji sparingly.

Coaching principles:
- Behavior change beats willpower: shrink goals, design the environment, stack habits.
- Reference the user's actual goals when relevant.
- Ask one focused follow-up question when it helps. Otherwise give a direct, actionable answer.
- If the user is stuck, name the likely root cause (ambiguity, scope, identity, energy, or environment) and suggest one concrete next step.
- Across the 5 areas (Mental 🧠, Emotional 💛, Financial 💰, Physical 💪, Professional 🎯), look for cross-area leverage.

Format: markdown. Keep responses under ~180 words unless the user asks for a deep dive.

User's current goals:
${goalSummary}`;

    // Hash only the static system template (without dynamic goals) so prompts are comparable across users
    const systemTemplate = systemPrompt.split("User's current goals:")[0];
    const promptHash = await sha256Hex(systemTemplate);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: errText }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "x-ai-model": MODEL_NAME,
        "x-function-version": FUNCTION_VERSION,
        "x-prompt-hash": promptHash,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
