const SECTIONS = [
  {
    n: "1",
    t: "Introduction",
    b: "WILZION EEG NeuroSim AI is a software EEG simulation and mental state classification system built as a final-year HCI project at Garden City University. It detects stress, focus, and fatigue using Claude AI, enriched with a personalised medical profile for improved accuracy.",
  },
  {
    n: "2",
    t: "User Accounts & Personalised Profile",
    b: "Each user registers an account and completes a personal profile (name, age, gender, occupation, photo). This context is combined with raw EEG data in the AI prompt, and every session is saved to the cloud database against the user's account — so history follows them across devices.",
  },
  {
    n: "3",
    t: "EEG Signal Theory",
    b: "Five frequency bands are analysed: Delta (0.5–4 Hz), Theta (4–8 Hz), Alpha (8–12 Hz), Beta (13–30 Hz), Gamma (30–100 Hz). Medical context adjusts thresholds — e.g. anxiety raises the baseline Beta level, requiring upward recalibration of stress thresholds.",
  },
  {
    n: "4",
    t: "System Architecture",
    b: "React single-page application with three layers: (1) Signal simulation — physiological band power generator with Canvas waveform rendering; (2) Classification — Claude AI via secure backend with clinical prompt engineering; (3) Presentation — interactive dashboard, session history, and per-session downloadable HTML reports.",
  },
  {
    n: "5",
    t: "Download & Reporting",
    b: "Each analysis generates a downloadable HTML report containing the subject name, classified mental state, confidence scores, EEG band readings, subject profile, AI summary, and personalised recommendation. Reports open in any browser and can be printed to PDF.",
  },
  {
    n: "6",
    t: "Limitations & Future Work",
    b: "Simulation cannot replicate real inter-individual EEG variability. Future versions should integrate real EEG hardware (e.g. Muse, OpenBCI). The medical profile could expand to include heart rate variability, medication history, and circadian rhythm data for even greater personalisation.",
  },
  {
    n: "7",
    t: "Ethical Considerations",
    b: "This system is strictly for educational and HCI research purposes. It is not a medical diagnostic tool. All analysis should be interpreted as simulation output only. Users are advised to consult qualified healthcare professionals for any health concerns.",
  },
];

export default function HCITab({ sessions }) {
  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-purple-500/5 p-5">
        <h2 className="font-extrabold text-lg tracking-tight mb-1">HCI Project Documentation</h2>
        <p className="text-xs text-muted-foreground font-mono">
          Garden City University · WILZION · Final Year HCI Project
        </p>
      </div>

      {SECTIONS.map(({ n, t, b }) => (
        <div key={n}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono text-indigo-300 shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.25))",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              {n}
            </div>
            <h3 className="font-bold text-base">{t}</h3>
          </div>
          <div className="h-px bg-white/[0.06] mb-2" />
          <p className="text-sm text-muted-foreground leading-relaxed font-light">{b}</p>
        </div>
      ))}

      {sessions.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h4 className="font-bold text-sm text-emerald-400 mb-1">Live Session Data</h4>
          <p className="text-xs font-mono text-muted-foreground">
            {sessions.length} session{sessions.length > 1 ? "s" : ""} recorded. Latest state:{" "}
            <span className="uppercase font-bold">
              {sessions[sessions.length - 1].state}
            </span>
            . Patient:{" "}
            {sessions[sessions.length - 1].patientName || "Anonymous"}.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/70 leading-relaxed">
        ⚠️ <strong>Disclaimer:</strong> WILZION EEG NeuroSim AI is a simulated EEG analysis tool for
        educational purposes only. It does not constitute medical advice or diagnosis.
        Always consult a qualified healthcare professional for health-related concerns.
      </div>
    </div>
  );
}