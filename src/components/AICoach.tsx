import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';
import { getGoals } from '@/lib/goalStore';
import { CATEGORY_CONFIG } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const COACHING_PROMPTS: Record<string, string[]> = {
  stuck: [
    "I'm feeling stuck on my goals",
    "Help me break through a plateau",
  ],
  plan: [
    "Help me plan my week",
    "Create a morning routine",
  ],
  motivate: [
    "I need motivation today",
    "Remind me why I started",
  ],
};

function generateCoachResponse(userMessage: string, goals: ReturnType<typeof getGoals>): string {
  const msg = userMessage.toLowerCase();
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;
  const weeklyGoals = goals.filter(g => g.level === 'weekly');
  const weeklyDone = weeklyGoals.filter(g => g.completed).length;
  const categories = [...new Set(goals.map(g => g.category))];

  if (msg.includes('plan') || msg.includes('week') || msg.includes('schedule')) {
    const pending = weeklyGoals.filter(g => !g.completed);
    if (pending.length === 0) {
      return "🎯 You don't have any weekly goals set yet! Let me suggest a framework:\n\n**Monday-Wednesday:** Focus on your hardest goals early in the week\n**Thursday-Friday:** Review progress and adjust\n**Weekend:** Reflect and plan next week\n\nTry adding 3-5 weekly goals across different categories to keep growth balanced.";
    }
    const plan = pending.map((g, i) => `${i + 1}. **${g.title}** (${CATEGORY_CONFIG[g.category].icon} ${CATEGORY_CONFIG[g.category].label})`).join('\n');
    return `📋 Here's your weekly focus plan:\n\n${plan}\n\n**Strategy:** Tackle the hardest one first thing in the morning when your willpower is highest. Try to complete at least one goal per day.\n\nYou've done ${weeklyDone} of ${weeklyGoals.length} this week — ${weeklyDone > 0 ? 'great momentum!' : 'let\'s get started!'}`;
  }

  if (msg.includes('motivat') || msg.includes('inspire') || msg.includes('why')) {
    const motivations = [
      "💪 Remember: **Every expert was once a beginner.** You're building habits that compound over time.",
      "🔥 The fact that you're here, tracking your goals, puts you ahead of 90% of people. **Consistency beats intensity.**",
      "⭐ Think about where you were 3 months ago vs now. Even small progress is still progress. **Trust the process.**",
      "🚀 You're not just setting goals — you're **designing your future self.** Each small action is a vote for who you want to become.",
    ];
    const extra = completedGoals > 0 ? `\n\nYou've already completed **${completedGoals} goals** — that's proof you can do this!` : '';
    return motivations[Math.floor(Math.random() * motivations.length)] + extra;
  }

  if (msg.includes('stuck') || msg.includes('plateau') || msg.includes('hard') || msg.includes('difficult')) {
    return "🤔 Feeling stuck is actually a **sign of growth** — it means you've outgrown your comfort zone.\n\n**Here's my 3-step unstuck formula:**\n\n1. **Shrink the goal** — Make it so small it feels almost silly. Instead of \"read a chapter,\" try \"read 1 page.\"\n2. **Change the environment** — Work from a different spot, try a new time of day.\n3. **Find an accountability partner** — Check out the Community tab for support groups.\n\nWhich area feels the most stuck? I can give you category-specific tips.";
  }

  if (msg.includes('routine') || msg.includes('morning') || msg.includes('habit')) {
    return "🌅 **Build a Winning Morning Routine:**\n\n1. **5:30-6:00** — Wake up, hydrate, 5-min meditation (🧠 Mental)\n2. **6:00-6:30** — Exercise or stretch (💪 Physical)\n3. **6:30-7:00** — Journal 3 gratitudes (💛 Emotional)\n4. **7:00-7:15** — Review today's goals in GoalGetter\n5. **7:15-7:30** — Work on your #1 priority\n\n**Pro tip:** Start with just 2-3 items and build up over 2 weeks. Consistency > complexity.";
  }

  if (msg.includes('progress') || msg.includes('how am i') || msg.includes('status') || msg.includes('report')) {
    const rate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const catBreakdown = categories.map(cat => {
      const catGoals = goals.filter(g => g.category === cat);
      const catDone = catGoals.filter(g => g.completed).length;
      return `${CATEGORY_CONFIG[cat].icon} **${CATEGORY_CONFIG[cat].label}**: ${catDone}/${catGoals.length} complete`;
    }).join('\n');

    return `📊 **Your Progress Report:**\n\nOverall: **${rate}%** (${completedGoals}/${totalGoals} goals)\n\n${catBreakdown || 'No goals yet — time to start!'}\n\n${rate >= 70 ? '🎉 Amazing work! You\'re crushing it!' : rate >= 40 ? '👍 Good progress! Keep pushing forward.' : rate > 0 ? '🌱 You\'re growing! Focus on one goal at a time.' : '🚀 Ready to start your journey? Add your first goal!'}`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('start')) {
    return `👋 Hey there! I'm your **GoalGetter AI Coach**.\n\nI can help you with:\n• 📋 **Planning** your week and setting priorities\n• 💪 **Motivation** when you need a boost\n• 📊 **Progress review** across all your goals\n• 🧠 **Strategy** for breaking through plateaus\n• 🌅 **Routines** and habit-building tips\n\n${totalGoals > 0 ? `I can see you have **${totalGoals} goals** set up. Want me to review your progress?` : 'You haven\'t added any goals yet — want me to help you get started?'}`;
  }

  // Default helpful response
  return `Great question! Here are some thoughts:\n\n${totalGoals > 0 ? `Based on your **${totalGoals} goals** across ${categories.length} categories, I'd recommend focusing on the area with the least progress first.` : 'Start by setting 1-2 goals in the area that matters most to you right now.'}\n\n**Quick tips:**\n• Break big goals into weekly actions\n• Track progress daily, even if it's small\n• Celebrate wins — they fuel momentum\n\nTry asking me about your progress, planning your week, or getting motivation!`;
}

export default function AICoach() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const goals = getGoals();
    const response = generateCoachResponse(text, goals);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => {
          setOpen(true);
          if (messages.length === 0) {
            sendMessage('hello');
          }
        }}
        className={`fixed bottom-24 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full gradient-accent shadow-elevated flex items-center justify-center transition-transform hover:scale-110 ${open ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles className="w-6 h-6 text-accent-foreground" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 md:bottom-6 right-4 z-50 w-[340px] sm:w-[380px] h-[500px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border gradient-accent">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent-foreground" />
              <div>
                <p className="text-sm font-semibold text-accent-foreground">AI Goal Coach</p>
                <p className="text-xs text-accent-foreground/70">Your personal growth guide</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-black/10">
              <X className="w-4 h-4 text-accent-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-accent-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-accent text-accent-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-xl text-sm text-muted-foreground">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {Object.values(COACHING_PROMPTS).flat().slice(0, 3).map(prompt => (
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

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-border">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your AI coach..."
              className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl gradient-accent text-accent-foreground disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
