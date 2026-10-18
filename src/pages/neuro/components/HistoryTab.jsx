import { Download } from "lucide-react";
import { STATE_META, buildReportHTML, downloadReportHTML } from "../lib/neuro-utils";

export default function HistoryTab({ sessions }) {
  const counts = sessions.reduce(
    (acc, s) => ({ ...acc, [s.state]: (acc[s.state] ?? 0) + 1 }),
    {}
  );

  const metrics = [
    { l: "Total", v: sessions.length, c: "#3B82F6" },
    { l: "Stress", v: counts["stress"] ?? 0, c: "#EF4444" },
    { l: "Focus", v: counts["focus"] ?? 0, c: "#10B981" },
    { l: "Fatigue", v: counts["fatigue"] ?? 0, c: "#F59E0B" },
  ];

  function handleDownloadAll() {
    sessions.forEach((s, i) => {
      setTimeout(
        () =>
          downloadReportHTML(
            buildReportHTML(s, s.patientName),
            `NeuroSim_${(s.patientName || "report").replace(/\s+/g, "_")}_session${i + 1}.html`
          ),
        i * 400
      );
    });
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map(({ l, v, c }) => (
          <div key={l} className="rounded-2xl border border-white/[0.07] bg-card p-4">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              {l}
            </div>
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: c }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-mono text-sm">
          <div className="text-5xl mb-4 opacity-30">📭</div>
          No sessions yet. Run an analysis to see history.
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              }}
            >
              <Download size={13} />
              Download All ({sessions.length})
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-white/[0.07] bg-card overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white/[0.02]">
                  {["#", "Patient", "Time", "Summary", "State", "Top Conf.", ""].map((h) => (
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
                {[...sessions].reverse().map((s, ri) => {
                  const idx = sessions.length - ri;
                  const m = STATE_META[s.state] ?? STATE_META.neutral;
                  const top = Math.max(...Object.values(s.confidence));
                  return (
                    <tr key={ri} className="border-b border-white/[0.04]">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{idx}
                      </td>
                      <td className="px-4 py-3 font-semibold text-purple-300 text-xs">
                        {s.patientName || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {s.date} {s.time}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px]">
                        {s.summary}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-mono px-2.5 py-1 rounded-full"
                          style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                        >
                          {m.icon} {s.state}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {top}%
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            downloadReportHTML(
                              buildReportHTML(s, s.patientName),
                              `NeuroSim_${(s.patientName || "report").replace(/\s+/g, "_")}_${idx}.html`
                            )
                          }
                          className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            color: "#34D399",
                          }}
                        >
                          <Download size={11} />
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {[...sessions].reverse().map((s, ri) => {
              const idx = sessions.length - ri;
              const m = STATE_META[s.state] ?? STATE_META.neutral;
              const top = Math.max(...Object.values(s.confidence));
              return (
                <div
                  key={ri}
                  className="rounded-2xl border border-white/[0.07] bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">#{idx}</span>
                      <span className="font-semibold text-purple-300 text-sm">
                        {s.patientName || "Anonymous"}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-mono px-2.5 py-1 rounded-full"
                      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                    >
                      {m.icon} {s.state}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {s.date} {s.time} · {top}% confidence
                    </span>
                    <button
                      onClick={() =>
                        downloadReportHTML(
                          buildReportHTML(s, s.patientName),
                          `NeuroSim_${(s.patientName || "report").replace(/\s+/g, "_")}_${idx}.html`
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1.5 rounded-lg cursor-pointer"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "#34D399",
                      }}
                    >
                      <Download size={11} /> Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}