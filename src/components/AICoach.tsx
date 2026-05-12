import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getGoals } from '@/lib/goalStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down';
  goalsSnapshot?: any;
  modelName?: string;
  functionVersion?: string;
  promptHash?: string;
}

const QUICK_PROMPTS = [
  "Help me plan my week",
  "I'm feeling stuck",
  "Review my progress",
  "Build a morning routine",
];

function renderMarkdown(text: string) {
  // Light markdown: **bold**, *italic*, `code`, line breaks
  const parts: (string | JSX.Element)[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const tok = match[0];
    if (tok.startsWith('**')) parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={key++} className="px-1 py-0.5 rounded bg-background/50 text-xs">{tok.slice(1, -1)}</code>);
    else parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    lastIdx = match.index + tok.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

export default function AICoach() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, isStreaming]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    const goals = getGoals().map(g => ({
      title: g.title, category: g.category, level: g.level,
      completed: g.completed, current: g.current, target: g.target, unit: g.unit,
    }));
    const replyId = crypto.randomUUID();
    setMessages([...nextMessages, { id: replyId, role: 'assistant', content: '', goalsSnapshot: goals }]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ messages: nextMessages, goals }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const modelName = resp.headers.get('x-ai-model') ?? undefined;
      const functionVersion = resp.headers.get('x-function-version') ?? undefined;
      const promptHash = resp.headers.get('x-prompt-hash') ?? undefined;
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = { ...last, modelName, functionVersion, promptHash };
        return copy;
      });

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], role: 'assistant', content: assistantText };
                return copy;
              });
            }
          } catch { /* ignore parse errors on partial chunks */ }
        }
      }

      if (!assistantText) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], role: 'assistant', content: "I didn't catch that — can you rephrase?" };
          return copy;
        });
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      const msg = e?.message || 'Something went wrong.';
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], role: 'assistant', content: `⚠️ ${msg}` };
        return copy;
      });
      toast({ title: 'AI Coach error', description: msg, variant: 'destructive' });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const submitFeedback = async (index: number, rating: 'up' | 'down') => {
    const msg = messages[index];
    if (!msg || msg.role !== 'assistant' || msg.feedback) return;

    // Validate ai_reply_id: must exist and be unique among assistant messages in this session
    const replyId = msg.id;
    if (!replyId) {
      toast({ title: "Can't save feedback", description: 'Missing reply ID for this message.', variant: 'destructive' });
      return;
    }
    const duplicateInSession = messages.some((m, i) => i !== index && m.role === 'assistant' && m.id === replyId);
    if (duplicateInSession) {
      toast({ title: "Can't save feedback", description: 'Duplicate reply ID detected.', variant: 'destructive' });
      return;
    }

    setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedback: rating } : m));
    const prevUser = [...messages.slice(0, index)].reverse().find(m => m.role === 'user');
    try {
      const { data: existing, error: checkError } = await supabase
        .from('ai_coach_feedback')
        .select('id')
        .eq('ai_reply_id', replyId)
        .maybeSingle();
      if (checkError) throw checkError;
      if (existing) {
        setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedback: rating } : m));
        toast({ title: 'Feedback already recorded for this reply.' });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('ai_coach_feedback').insert({
        user_id: user?.id ?? null,
        rating: rating === 'up' ? 1 : -1,
        user_message: prevUser?.content ?? null,
        assistant_message: msg.content,
        session_id: sessionIdRef.current,
        goals_snapshot: msg.goalsSnapshot ?? null,
        model_name: msg.modelName ?? null,
        function_version: msg.functionVersion ?? null,
        prompt_hash: msg.promptHash ?? null,
        ai_reply_id: msg.id ?? null,
      });
      if (error) throw error;
      toast({ title: 'Thanks for the feedback!' });
    } catch (e: any) {
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedback: undefined } : m));
      toast({ title: "Couldn't save feedback", description: e?.message, variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const openCoach = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "👋 Hey! I'm your **GoalGetter AI Coach**. Ask me about planning, motivation, getting unstuck, or your progress. What's on your mind today?",
      }]);
    }
  };

  return (
    <>
      <button
        onClick={openCoach}
        aria-label="Open AI Coach"
        className={`fixed bottom-24 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full gradient-accent shadow-elevated flex items-center justify-center transition-transform hover:scale-110 ${open ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles className="w-6 h-6 text-accent-foreground" />
      </button>

      {open && (
        <div className="fixed bottom-24 md:bottom-6 right-4 z-50 w-[340px] sm:w-[380px] h-[520px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border gradient-accent">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent-foreground" />
              <div>
                <p className="text-sm font-semibold text-accent-foreground">AI Goal Coach</p>
                <p className="text-xs text-accent-foreground/70">Personalized to your goals</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-black/10" aria-label="Close">
              <X className="w-4 h-4 text-accent-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const showCursor = isStreaming && isLast && msg.role === 'assistant';
              return (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-line leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent text-accent-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {msg.content ? renderMarkdown(msg.content) : showCursor ? <span className="text-muted-foreground animate-pulse">Thinking…</span> : null}
                      {showCursor && msg.content && <span className="inline-block w-1 h-3 ml-0.5 bg-current animate-pulse" />}
                    </div>
                    {msg.role === 'assistant' && msg.content && !showCursor && i > 0 && (
                      <div className="flex items-center gap-1 px-1">
                        <button
                          onClick={() => submitFeedback(i, 'up')}
                          disabled={!!msg.feedback}
                          aria-label="Helpful"
                          className={`p-1 rounded hover:bg-muted transition-colors ${msg.feedback === 'up' ? 'text-accent' : 'text-muted-foreground'} disabled:cursor-default`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" fill={msg.feedback === 'up' ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => submitFeedback(i, 'down')}
                          disabled={!!msg.feedback}
                          aria-label="Not helpful"
                          className={`p-1 rounded hover:bg-muted transition-colors ${msg.feedback === 'down' ? 'text-destructive' : 'text-muted-foreground'} disabled:cursor-default`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" fill={msg.feedback === 'down' ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && !isStreaming && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground hover:bg-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-border">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isStreaming ? "Coach is replying…" : "Ask your AI coach..."}
              disabled={isStreaming}
              className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2 rounded-xl gradient-accent text-accent-foreground disabled:opacity-50 transition-opacity"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
