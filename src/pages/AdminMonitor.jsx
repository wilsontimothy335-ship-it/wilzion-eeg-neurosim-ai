import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Download, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ACTION_META = {
  login: { icon: "🔑", label: "Signed in", color: "#34D399" },
  analysis: { icon: "⚡", label: "Ran analysis", color: "#60A5FA" },
  report_delete: { icon: "🗑️", label: "Deleted a report", color: "#F87171" },
  report_delete_all: { icon: "🗑️", label: "Deleted all reports", color: "#EF4444" },
  user_delete: { icon: "🚫", label: "Deleted a user account", color: "#EF4444" },
  data_export: { icon: "⬇️", label: "Exported data", color: "#FBBF24" },
  profile_update: { icon: "👤", label: "Updated profile", color: "#A78BFA" },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${Math.max(diff, 0)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-card p-4">
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-3xl font-extrabold tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export default function AdminMonitor() {
  const [me, setMe] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meRes = await base44.auth.me();
      setMe(meRes);
      if (meRes.role === "admin") {
        const [l, u] = await Promise.all([
          base44.entities.ActivityLog.list("-created_date", 500),
          base44.entities.User.list(),
        ]);
        setLogs(l);
        setUsers(u);
      }
      setLoading(false);
    })();
  }, []);

  const q = search.trim().toLowerCase();
  const filteredLogs = useMemo(
    () =>
      logs.filter(
        (l) =>
          (actionFilter === "all" || l.action === actionFilter) &&
          (!q ||
            `${l.user_email} ${l.user_name} ${l.details ?? ""}`.toLowerCase().includes(q))
      ),
    [logs, q, actionFilter]
  );

  const perUser = useMemo(() => {
    const map = {};
    logs.forEach((l) => {
      const email = l.user_email || "unknown";
      if (!map[email]) map[email] = { email, name: l.user_name, lastLogin: null, count: 0 };
      map[email].count += 1;
      if (l.action === "login" && (!map[email].lastLogin || new Date(l.created_date) > new Date(map[email].lastLogin))) {
        map[email].lastLogin = l.created_date;
      }
    });
    return map;
  }, [logs]);

  function downloadLog(l) {
    const blob = new Blob([JSON.stringify(l, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Log_${l.action}_${l.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function deleteLog(id) {
    await base44.entities.ActivityLog.delete(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const loginsToday = logs.filter(
    (l) => l.action === "login" && new Date(l.created_date) >= startOfToday
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (me?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-8 max-w-md text-center">
          <div className="text-4xl mb-3">🚫</div>
          <h1 className="text-xl font-extrabold mb-2">Admin access only</h1>
          <p className="text-xs text-muted-foreground font-mono">
            This monitoring section is restricted to administrator accounts.
          </p>
          <Link
            to="/"
            className="inline-block mt-5 px-5 py-2.5 rounded-xl font-bold text-xs text-white"
            style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}
          >
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 10% 20%,rgba(59,130,246,0.06) 0%,transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-16">
        <nav className="flex items-center gap-3 py-5 border-b border-white/[0.07] mb-6 flex-wrap">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            ← Home
          </Link>
          <div className="flex-1" />
          <Link
            to="/database"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            🗄️ Database
          </Link>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">🛡️ Admin Monitor</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Logins &amp; activities across all registered accounts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Registered users" value={users.length} color="#60A5FA" />
          <StatCard label="Logins today" value={loginsToday} color="#34D399" />
          <StatCard label="Logged activities" value={logs.length} color="#A78BFA" />
          <StatCard
            label="Analyses run"
            value={logs.filter((l) => l.action === "analysis").length}
            color="#FBBF24"
          />
        </div>

        {/* Per-user overview */}
        <div className="rounded-2xl border border-white/[0.07] bg-card overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-white/[0.07] text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Account overview
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.02]">
                {["User", "Role", "Last login", "Activities"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-white/[0.07]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const stats = perUser[u.email] ?? { count: 0, lastLogin: null };
                return (
                  <tr key={u.id} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-xs">{u.full_name || "—"}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
                        {u.role ?? "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {stats.lastLogin ? timeAgo(stats.lastLogin) : "Never"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{stats.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-white/[0.07] bg-card p-4">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">
            Activity feed
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user email, name, or details…"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400/50 transition-colors"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm outline-none cursor-pointer focus:border-indigo-400/50"
            >
              <option value="all">All actions</option>
              {Object.entries(ACTION_META).map(([id, m]) => (
                <option key={id} value={id}>
                  {m.icon} {m.label}
                </option>
              ))}
            </select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              <div className="text-4xl mb-3 opacity-30">📝</div>
              No activities match your filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((l) => {
                const m = ACTION_META[l.action] ?? { icon: "•", label: l.action, color: "#94A3B8" };
                return (
                  <div
                    key={l.id}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
                  >
                    <span className="text-lg shrink-0">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs" style={{ color: m.color }}>
                          {m.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {l.user_email || "unknown"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {timeAgo(l.created_date)}
                        </span>
                      </div>
                      {l.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">{l.details}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => downloadLog(l)}
                        title="Download log"
                        className="p-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={() => deleteLog(l.id)}
                        title="Delete log"
                        className="p-2 rounded-lg border border-red-500/25 bg-red-500/10 text-red-300 cursor-pointer hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}