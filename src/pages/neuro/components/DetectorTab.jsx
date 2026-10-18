import { Download } from "lucide-react";
import {
  BANDS,
  SCENARIOS,
  STATE_META,
  buildReportHTML,
  downloadReportHTML,
} from "../lib/neuro-utils";
import BandCard from "./BandCard";

const SCENARIO_COLORS = {
  stress: ["rgba(239,68,68,0.15)", "#FCA5A5", "rgba(239,68,68,0.35)"],
  focus: ["rgba(52,211,153,0.15)", "#6EE7B7", "rgba(52,211,153,0.35)"],
  fatigue: ["rgba(251,191,36,0.15)", "#FDE68A", "rgba(251,191,36,0.35)"],
  random: ["rgba(99,102,241,0.15)", "#A5B4FC", "rgba(99,102,241,0.35)"],
};

function SectionLabel({ children }) {
  return (
    <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2.5">
      {children}
    </div>
  );
}

export default function DetectorTab({
  scenario,
  setScenario,
  bandVals,
  analysing,
  result,
  logMsg,
  lastSession,
  onAnalyse,
  waveRef,
}) {
  const meta = result ? (STATE_META[result.state] ?? STATE_META.neutral) : null;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* State banner */}
      <div
        className="relative overflow-hidden rounded-2xl border p-5 transition-[border-color] duration-500"
        style={{
          borderColor: meta?.border ?? "rgba(255,255,255,0.07)",
          background: meta
            ? `linear-gradient(135deg,${meta.bg},transparent)`
            : "hsl(var(--card))",
        }}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl shrink-0">{meta?.icon ?? "🧠"}</span>
          <div className="flex-1 min-w-0">
            <h2
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: meta?.color ?? "hsl(var(--foreground))" }}
            >
              {result
                ? result.state.charAt(0).toUpperCase() + result.state.slice(1)
                : "Awaiting Analysis"}
            </h2>
            {result && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {result.summary}
              </p>
            )}
            {result?.recommendation && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                💡 {result.recommendation}
              </p>
            )}
            {result?.profile_impact && (
              <span className="inline-block mt-2 text-[11px] font-mono text-muted-foreground px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
                🩺 {result.profile_impact}
              </span>
            )}
            {result && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(result.confidence).map(([k, v]) => {
                  const sm = STATE_META[k] ?? STATE_META.neutral;
                  return (
                    <span
                      key={k}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-full"
                      style={{
                        background: sm.bg,
                        color: sm.color,
                        border: `1px solid ${sm.border}`,
                      }}
                    >
                      {k}: {v}%
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Band cards */}
      <div>
        <SectionLabel>EEG Band Power — μV²/Hz</SectionLabel>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {BANDS.map((_, i) => (
            <BandCard key={i} index={i} val={bandVals[i] ?? 0} />
          ))}
        </div>
      </div>

      {/* Waveform */}
      <div className="rounded-2xl border border-white/[0.07] bg-card p-4">
        <SectionLabel>Simulated Raw EEG Waveform</SectionLabel>
        <canvas ref={waveRef} className="w-full block" style={{ height: 80 }} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">SCENARIO:</span>
        {Object.keys(SCENARIOS).map((s) => {
          const active = scenario === s;
          const [bg, col, border] = active
            ? (SCENARIO_COLORS[s] ?? SCENARIO_COLORS.random)
            : ["transparent", "#64748B", "rgba(255,255,255,0.1)"];
          return (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer capitalize"
              style={{ border: `1px solid ${border}`, background: bg, color: col }}
            >
              {s === "random" ? "Live Random" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
        <button
          onClick={onAnalyse}
          disabled={analysing}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
            boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
          }}
        >
          <span
            className={analysing ? "inline-block animate-spin" : ""}
            style={{ display: "inline-block" }}
          >
            {analysing ? "⟳" : "⚡"}
          </span>
          {analysing ? "Analysing..." : "Analyse State"}
        </button>
      </div>

      {/* Log */}
      <div>
        <SectionLabel>AI Analysis Log</SectionLabel>
        <div className="relative rounded-xl border border-white/[0.07] bg-[#0C1221] p-4 font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[80px]">
          <span className="absolute top-3 right-4 text-[10px] text-muted-foreground/30">
            // log
          </span>
          {logMsg}
        </div>
      </div>

      {/* Download button */}
      {lastSession && (
        <div className="flex justify-end">
          <button
            onClick={() =>
              downloadReportHTML(
                buildReportHTML(lastSession, lastSession.patientName),
                `NeuroSim_${(lastSession.patientName || "report").replace(/\s+/g, "_")}_${Date.now()}.html`
              )
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#10B981,#059669)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}
          >
            <Download size={15} />
            Download Report
          </button>
        </div>
      )}
    </div>
  );
}