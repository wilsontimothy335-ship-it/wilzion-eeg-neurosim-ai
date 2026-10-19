import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activity";
import { localLogout } from "@/lib/auth-env";
import { STATE_META } from "./neuro/lib/neuro-utils";

const QUOTES = [
  "Your mind is your greatest instrument — tune it daily.",
  "Small steps in focus create giant leaps in achievement.",
  "Calm mind, stronger performance.",
  "Every scan of your mind is a step toward knowing yourself.",
  "Rest is not idleness — it is recovery in disguise.",
  "The brain is like a muscle: the more you use it well, the stronger it grows.",
  "Stress is temporary; resilience is built one moment at a time.",
  "You cannot pour from an empty cup — recharge first.",
  "Focus follows the energy you protect.",
  "Progress is the product of a well-rested mind.",
  "A clear mind sees solutions a busy mind misses.",
  "Take a breath — your future self is watching gratefully.",
  "Momentum begins the moment you decide to begin.",
  "Sleep is the best meditation.",
  "Your attention is your currency — spend it wisely.",
  "One positive thought in the morning can change your whole day.",
  "Peak performance starts with peak awareness.",
  "The calmest person in the room is often the most powerful.",
  "Discipline is choosing what you want most over what you want now.",
  "Your only limit is the one you keep re-scanning for.",
  "Rest well, rise sharper.",
  "Little by little, focus becomes flow.",
  "Be patient with your mind — it is learning every day.",
  "Awareness is the first step to change.",
  "Energy flows where attention goes.",
  "Today is a fresh EEG — make it a good one.",
  "Fatigue is a signal, not a sentence.",
  "Great things are done by a series of small states of focus.",
  "Monitor your mind, master your life.",
  "You are one analysis away from a better understanding of yourself.",
  "End the day proud of the mind you carried through it.",
];

const REMINDERS = {
  stress: { minutes: 30, tip: "You were in a stress state — re-run an analysis in 30 minutes to track your recovery." },
  fatigue: { minutes: 60, tip: "You showed fatigue — re-run an analysis in 1 hour to check whether rest has helped." },
  focus: { minutes: 24 * 60, tip: "Excellent focus state — your next analysis is recommended tomorrow to monitor consistency." },
  neutral: { minutes: 12 * 60, tip: "Balanced mental state — your next analysis is recommended in 12 hours." },
};

function greetingFor(date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Welcome() {
  const [displayName, setDisplayName] = useState("");
  const [lastSession, setLastSession] = useState(null);
  const [nextRun, setNextRun] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let timer;
    (async () => {
      const me = await base44.auth.me();
      setIsAdmin(me.role === "admin");
      logActivity("login", "Signed in to the dashboard");
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      const name =
        profiles[0]?.full_name || me.full_name || (me.email || "").split("@")[0];
      setDisplayName(name);

      const saved = await base44.entities.AnalysisSession.filter({ created_by_id: me.id });
      setSessionCount(saved.length);
      if (saved.length > 0) {
        const last = saved.reduce((a, b) =>
          new Date(a.created_date) > new Date(b.created_date) ? a : b
        );
        setLastSession(last);
        const rem = REMINDERS[last.state] ?? REMINDERS.neutral;
        const target = new Date(new Date(last.created_date).getTime() + rem.minutes * 60000);
        setNextRun({ target, tip: rem.tip });
      }
      setLoading(false);
    })();
    timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const dateLine = now.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const quote = QUOTES[(now.getDate() - 1) % QUOTES.length];
  const monthName = now.toLocaleDateString([], { month: "long" });

  const due = nextRun ? nextRun.target <= now : true;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 10% 20%,rgba(59,130,246,0.08) 0%,transparent 60%)," +
            "radial-gradient(ellipse 50% 50% at 88% 80%,rgba(139,92,246,0.06) 0%,transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        {/* Nav */}
        <nav className="flex items-center gap-3 py-5 border-b border-white/[0.07] mb-8 flex-wrap">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}
          >
            🧠
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight">WILZION EEG NeuroSim AI</div>
            <div className="text-[10px] font-mono text-muted-foreground">
              Garden City University · HCI Project · WILZION
            </div>
          </div>
          <div className="flex-1" />
          <button
            onClick={localLogout}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-300 border border-red-500/25 bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors"
          >
            Log out
          </button>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Greeting */}
            <div>
              <div className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
                {dateLine}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {greetingFor(now)},{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#60A5FA,#A78BFA)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {displayName}
                </span>{" "}
                👋
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                Welcome back — your mind is worth monitoring.
              </p>
            </div>

            {/* Quote of the day */}
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.06))",
                borderColor: "rgba(99,102,241,0.25)",
              }}
            >
              <div className="text-[10px] font-mono text-indigo-300 tracking-widest uppercase mb-3">
                ✨ Quote of the day · {monthName} {now.getDate()}
              </div>
              <p className="text-lg font-semibold leading-relaxed">"{quote}"</p>
              <p className="text-xs text-muted-foreground font-mono mt-3">
                Selected for {monthName} {now.getDate()}, {now.getFullYear()}
              </p>
            </div>

            {/* Reminder */}
            <div className="rounded-2xl border border-white/[0.07] bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔔</span>
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                  Analysis Reminder
                </div>
              </div>
              {!lastSession ? (
                <div>
                  <p className="text-sm font-semibold">Run your first analysis to start tracking your mental state.</p>
                  <Link
                    to="/neurosim"
                    className="inline-block mt-4 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                      boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
                    }}
                  >
                    ⚡ Run Analysis
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{nextRun.tip}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-xs font-mono px-3 py-1.5 rounded-full border"
                      style={
                        due
                          ? { background: "rgba(239,68,68,0.1)", color: "#FCA5A5", borderColor: "rgba(239,68,68,0.3)" }
                          : { background: "rgba(16,185,129,0.1)", color: "#34D399", borderColor: "rgba(16,185,129,0.3)" }
                      }
                    >
                      {due ? "⚠ Due now" : "Scheduled"}
                    </span>
                    <span className="text-sm font-bold">
                      Next recommended:{" "}
                      {nextRun.target.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <Link
                    to="/neurosim"
                    className="inline-block px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                      boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
                    }}
                  >
                    ⚡ {due ? "Run Analysis Now" : "Run Analysis"}
                  </Link>
                </div>
              )}
            </div>

            {/* Stats + quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-card p-4">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Sessions Run
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-blue-400">
                  {sessionCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-card p-4">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Last State
                </div>
                <div className="text-2xl font-extrabold tracking-tight" style={{ color: lastSession ? (STATE_META[lastSession.state] ?? STATE_META.neutral).color : "#64748B" }}>
                  {lastSession ? (STATE_META[lastSession.state] ?? STATE_META.neutral).icon + " " + lastSession.state : "—"}
                </div>
              </div>
              <Link
                to="/profile"
                className="rounded-2xl border border-white/[0.07] bg-card p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Account
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-purple-400">👤 Profile</div>
              </Link>
              <Link
                to="/database"
                className="rounded-2xl border border-white/[0.07] bg-card p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Records
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-emerald-400">🗄️ Database</div>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-4 hover:bg-indigo-500/20 transition-colors"
                >
                  <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider mb-2">
                    Admin only
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-indigo-300">🛡️ Monitor</div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}