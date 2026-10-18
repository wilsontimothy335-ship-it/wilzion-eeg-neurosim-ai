import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Search, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activity";
import { STATE_META } from "./neuro/lib/neuro-utils";

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DatabaseSection() {
  const [tab, setTab] = useState("reports");
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function load() {
    const me = await base44.auth.me();
    setMyId(me.id);
    setIsAdmin(me.role === "admin");
    setLoading(true);
    const s = await base44.entities.AnalysisSession.list("-created_date", 500);
    setSessions(s);
    try {
      const u = await base44.entities.User.list();
      setUsers(u);
    } catch {
      setUsersError("Only admins can view the full registered-user list.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const q = search.trim().toLowerCase();
  const filteredSessions = sessions.filter(
    (s) =>
      !q ||
      [s.session_date, s.session_time, s.patient_name, s.state]
        .join(" ")
        .toLowerCase()
        .includes(q)
  );
  const filteredUsers = (users ?? []).filter(
    (u) => !q || `${u.full_name ?? ""} ${u.email ?? ""} ${u.role ?? ""}`.toLowerCase().includes(q)
  );

  async function deleteReport(id, name) {
    await base44.entities.AnalysisSession.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    logActivity("report_delete", `Deleted report of ${name || "Anonymous"}`);
  }

  async function deleteAllReports() {
    if (!window.confirm(`Delete all ${sessions.length} report(s)? This cannot be undone.`)) return;
    await base44.entities.AnalysisSession.deleteMany({});
    setSessions([]);
    logActivity("report_delete_all", `Deleted all ${sessions.length} report(s)`);
  }

  async function deleteUser(u) {
    if (u.id === myId) {
      window.alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete user "${u.email}"? This cannot be undone.`)) return;
    await base44.entities.User.delete(u.id);
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    logActivity("user_delete", `Deleted user account: ${u.email}`);
  }

  function downloadAllData() {
    logActivity("data_export", "Exported the full database as JSON");
    downloadJSON(
      {
        exported_at: new Date().toISOString(),
        app: "WILZION EEG NeuroSim AI",
        registered_users: (users ?? []).map((u) => ({
          full_name: u.full_name,
          email: u.email,
          role: u.role,
          created_date: u.created_date,
        })),
        analysis_reports: sessions,
      },
      `NeuroSim_Database_${Date.now()}.json`
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 88% 80%,rgba(139,92,246,0.06) 0%,transparent 60%)",
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
            to="/neurosim"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            ⚡ Detector
          </Link>
          <Link
            to="/profile"
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          >
            👤 Profile
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-300 border border-indigo-400/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
            >
              🛡️ Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">🗄️ Database</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Registered users & stored analysis reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white cursor-pointer disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
            >
              <Download size={13} />
              Download All Data
            </button>
            {tab === "reports" && sessions.length > 0 && (
              <button
                onClick={deleteAllReports}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-red-300 border border-red-500/30 bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={13} />
                Delete All
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by date (e.g. Sep 06), patient name, or state…"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400/50 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-white/[0.07] rounded-2xl p-1 mb-5">
          {[
            { id: "reports", label: `📊 Reports (${sessions.length})` },
            { id: "users", label: `👥 Registered Users${users ? ` (${users.length})` : ""}` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              style={{
                background:
                  tab === id
                    ? "linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.18))"
                    : "transparent",
                border: tab === id ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                color: tab === id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : tab === "reports" ? (
          filteredSessions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-mono text-sm">
              <div className="text-5xl mb-4 opacity-30">📭</div>
              {sessions.length === 0 ? "No reports stored yet." : "No reports match your search."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((s) => {
                const m = STATE_META[s.state] ?? STATE_META.neutral;
                const top = Math.max(...Object.values(s.confidence ?? { n: 0 }));
                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-white/[0.07] bg-card p-4 flex items-start gap-4"
                  >
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-purple-300 text-sm">
                          {s.patient_name || "Anonymous"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {s.session_date} · {s.session_time}
                        </span>
                        <span
                          className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                          style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                        >
                          {s.state} · {top}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.summary}</p>
                    </div>
                    <button
                      onClick={() => deleteReport(s.id, s.patient_name)}
                      title="Delete report"
                      className="p-2 rounded-lg border border-red-500/25 bg-red-500/10 text-red-300 cursor-pointer hover:bg-red-500/20 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div>
            {usersError && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 mb-4">
                ⚠️ {usersError}
              </div>
            )}
            {users && filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-mono text-sm">
                <div className="text-5xl mb-4 opacity-30">👥</div>
                No users match your search.
              </div>
            ) : users ? (
              <div className="rounded-2xl border border-white/[0.07] bg-card overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      {["Name", "Email", "Role", "Joined", ""].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-white/[0.07]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-white/[0.04]">
                        <td className="px-4 py-3 font-semibold text-xs">{u.full_name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 text-indigo-300"
                          >
                            {u.role ?? "user"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {new Date(u.created_date).toLocaleDateString([], {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteUser(u)}
                            title="Delete user"
                            disabled={u.id === myId}
                            className="p-2 rounded-lg border border-red-500/25 bg-red-500/10 text-red-300 cursor-pointer hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}