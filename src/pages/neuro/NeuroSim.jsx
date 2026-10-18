import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activity";
import { SCENARIOS, drawWave } from "./lib/neuro-utils";
import DetectorTab from "./components/DetectorTab";
import HistoryTab from "./components/HistoryTab";
import HCITab from "./components/HCITab";

const TABS = [
  { id: "detector", label: "⚡ Detector" },
  { id: "history", label: "📊 History" },
  { id: "hci", label: "📄 HCI" },
];

function mapSession(r) {
  return {
    ...r,
    patientName: r.patient_name,
    date: r.session_date,
    time: r.session_time,
  };
}

export default function NeuroSim() {
  const [tab, setTab] = useState("detector");
  const [scenario, setScenario] = useState("random");
  const [bandVals, setBandVals] = useState([30, 30, 30, 30, 30]);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState(null);
  const [logMsg, setLogMsg] = useState("Press Analyse State to run an AI analysis.");
  const [sessions, setSessions] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [subjectProfile, setSubjectProfile] = useState(null);

  const waveRef = useRef(null);
  const phaseRef = useRef(0);
  const bandRef = useRef([30, 30, 30, 30, 30]);
  const animRef = useRef(0);
  const scenRef = useRef("random");
  const profRef = useRef(null);
  const nameRef = useRef("");

  scenRef.current = scenario;
  profRef.current = subjectProfile;
  nameRef.current = patientName;

  // Load the user's profile + saved sessions from the database
  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: me.id });
      if (profiles.length > 0) {
        setSubjectProfile(profiles[0]);
        setPatientName(profiles[0].full_name || "");
      }
      const saved = await base44.entities.AnalysisSession.filter({ created_by_id: me.id });
      setSessions(saved.map(mapSession));
    })();
  }, []);

  // Waveform animation
  useEffect(() => {
    const tick = () => {
      const target = SCENARIOS[scenRef.current]();
      const next = bandRef.current.map(
        (v, i) => v + (target[i] - v) * 0.07 + (Math.random() - 0.5) * 1.2
      );
      bandRef.current = next;
      setBandVals([...next]);
      phaseRef.current += 0.035;
      if (waveRef.current) {
        drawWave(next, phaseRef.current, scenRef.current, waveRef.current);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const analyse = useCallback(async () => {
    if (analysing) return;
    setAnalysing(true);
    const snap = bandRef.current
      .map((v, i) => `${["Delta", "Theta", "Alpha", "Beta", "Gamma"][i]}: ${Math.round(v)} μV²/Hz`)
      .join(", ");
    setLogMsg(`Sending to Claude AI...\n\nEEG: ${snap}`);

    try {
      const p = profRef.current;
      const subject = p
        ? { name: p.full_name, age: p.age, gender: p.gender, occupation: p.occupation }
        : {};
      const response = await base44.functions.invoke("analyseState", {
        bands: bandRef.current,
        profile: subject,
      });
      const res = response.data;

      setResult(res);
      const date = new Date();
      const record = await base44.entities.AnalysisSession.create({
        state: res.state,
        summary: res.summary,
        recommendation: res.recommendation,
        profile_impact: res.profile_impact,
        confidence: { ...res.confidence },
        bands: [...bandRef.current],
        scenario: scenRef.current,
        patient_name: nameRef.current || "Anonymous",
        session_date: date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }),
        session_time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        profile: subject,
      });
      const sess = mapSession(record);
      setSessions((prev) => [...prev, sess]);
      logActivity("analysis", `State: ${res.state} · Patient: ${nameRef.current || "Anonymous"}`);
      setLogMsg(
        `[Done]\n\nState: ${res.state.toUpperCase()}\nSummary: ${res.summary}\nTip: ${res.recommendation}\nSaved to your account.\n\nConfidence:\n${Object.entries(res.confidence)
          .map(([k, v]) => `  ${k}: ${v}%`)
          .join("\n")}`
      );
    } catch (e) {
      const msg = e?.response?.data?.error || (e instanceof Error ? e.message : "Unknown error");
      if (msg.includes("reached the limit")) {
        setLogMsg(
          "[Paused]\n\nThe app's monthly AI allowance has run out, so analyses are temporarily unavailable.\n\nYou can upgrade your Base44 plan or wait for the allowance to reset at the start of next month."
        );
      } else {
        setLogMsg("[Error]\n" + msg);
      }
    }
    setAnalysing(false);
  }, [analysing]);

  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background gradients */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 10% 20%,rgba(59,130,246,0.06) 0%,transparent 60%)," +
            "radial-gradient(ellipse 50% 50% at 88% 80%,rgba(139,92,246,0.05) 0%,transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-16">
        {/* Nav */}
        <nav className="flex items-center gap-3 py-5 border-b border-white/[0.07] mb-6 flex-wrap">
          <Link to="/" className="flex items-center gap-3">
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
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/profile"
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
            >
              👤 Profile
            </Link>
            <Link
              to="/database"
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
            >
              🗄️ Database
            </Link>
            {patientName && (
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-purple-300 border border-purple-500/25 bg-purple-500/10">
                👤 {patientName}
              </div>
            )}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono"
              style={{
                background: analysing ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.07)",
                border: analysing
                  ? "1px solid rgba(16,185,129,0.25)"
                  : "1px solid rgba(148,163,184,0.12)",
                color: analysing ? "#34D399" : "#475569",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: analysing ? "#34D399" : "#475569",
                  animation: analysing ? "pulse 1.4s ease-in-out infinite" : undefined,
                }}
              />
              {analysing ? "LIVE" : "IDLE"}
            </div>
          </div>
        </nav>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-white/[0.07] rounded-2xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="relative flex-1 min-w-max px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap"
              style={{
                background:
                  tab === id
                    ? "linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.18))"
                    : "transparent",
                border:
                  tab === id
                    ? "1px solid rgba(99,102,241,0.3)"
                    : "1px solid transparent",
                color: tab === id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "detector" && (
          <DetectorTab
            scenario={scenario}
            setScenario={setScenario}
            bandVals={bandVals}
            analysing={analysing}
            result={result}
            logMsg={logMsg}
            lastSession={lastSession}
            onAnalyse={analyse}
            waveRef={waveRef}
          />
        )}

        {tab === "history" && <HistoryTab sessions={sessions} />}

        {tab === "hci" && <HCITab sessions={sessions} />}
      </div>
    </div>
  );
}
