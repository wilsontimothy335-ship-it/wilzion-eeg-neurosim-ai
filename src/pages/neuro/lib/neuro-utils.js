// EEG constants shared across the NeuroSim app
export const BANDS = ["Delta", "Theta", "Alpha", "Beta", "Gamma"];
export const BAND_FREQ = ["0.5–4 Hz", "4–8 Hz", "8–12 Hz", "13–30 Hz", "30–100 Hz"];
export const BAND_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

export const STATE_META = {
  stress: {
    icon: "😰",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    label: "Stress",
    description: "Elevated Beta and Gamma activity with suppressed Alpha waves.",
  },
  focus: {
    icon: "🎯",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
    label: "Focus",
    description: "Strong Alpha waves with moderate Beta — optimal cognitive engagement.",
  },
  fatigue: {
    icon: "😴",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    label: "Fatigue",
    description: "Dominant Delta and Theta with suppressed higher-frequency activity.",
  },
  neutral: {
    icon: "🧠",
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.06)",
    border: "rgba(148,163,184,0.18)",
    label: "Neutral",
    description: "Balanced band power across all frequency ranges.",
  },
};

function r(n) {
  return (Math.random() - 0.5) * n;
}

export const SCENARIOS = {
  random: () => BANDS.map(() => Math.random() * 75 + 10),
  stress: () => [12 + r(5), 18 + r(5), 14 + r(4), 72 + r(8), 55 + r(8)],
  focus: () => [10 + r(4), 14 + r(4), 40 + r(6), 58 + r(8), 18 + r(5)],
  fatigue: () => [55 + r(8), 48 + r(7), 20 + r(5), 16 + r(5), 7 + r(4)],
};

export function buildReportHTML(session, name) {
  const m = STATE_META[session.state] ?? STATE_META.neutral;
  const p = session.profile ?? {};

  const confRows = Object.entries(session.confidence)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;text-transform:capitalize">${k}</td>
         <td style="padding:6px 12px;font-weight:700;color:${(STATE_META[k] ?? STATE_META.neutral).color}">${v}%</td>
         <td style="padding:6px 12px"><div style="height:8px;width:${Math.max(v, 2)}%;background:${(STATE_META[k] ?? STATE_META.neutral).color};border-radius:4px"></div></td></tr>`
    )
    .join("");

  const bandRows = BANDS.map(
    (b, i) =>
      `<tr><td style="padding:6px 12px">${b}</td>
       <td style="padding:6px 12px;color:#64748B;font-size:12px">${BAND_FREQ[i]}</td>
       <td style="padding:6px 12px;font-weight:700;color:${BAND_COLORS[i]}">${Math.round(session.bands[i] ?? 0)} μV²/Hz</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>WILZION EEG NeuroSim AI Report — ${name}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F8FAFC;color:#1E293B;margin:0;padding:0}
  .page{max-width:780px;margin:0 auto;padding:40px 48px}
  @media(max-width:600px){.page{padding:24px 16px}}
  .header{background:linear-gradient(135deg,#0D1B2A,#1B4F72);color:#fff;padding:32px 40px;border-radius:16px;margin-bottom:28px}
  .header h1{font-size:26px;margin:0 0 4px;letter-spacing:-0.03em}
  .header p{font-size:13px;color:#94A3B8;margin:0}
  .state-box{background:#fff;border:2px solid ${m.color};border-radius:14px;padding:24px;margin-bottom:24px;display:flex;align-items:center;gap:20px}
  .state-icon{font-size:48px;flex-shrink:0}
  .state-name{font-size:28px;font-weight:800;color:${m.color};margin:0 0 6px}
  .state-summary{font-size:14px;color:#475569;margin:0 0 6px;line-height:1.6}
  .state-rec{font-size:13px;color:#64748B;font-style:italic}
  .profile-impact{margin-top:10px;font-size:12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:8px;padding:8px 12px;color:#4F46E5}
  .section{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin-bottom:20px}
  .section h2{font-size:14px;font-weight:700;color:#0F172A;margin:0 0 14px;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #F1F5F9;padding-bottom:8px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td{border-bottom:1px solid #F1F5F9;color:#334155}
  .footer{text-align:center;font-size:11px;color:#94A3B8;margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0}
  .disclaimer{background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:12px;color:#92400E;line-height:1.6}
</style></head><body><div class="page">
<div class="header">
  <h1>🧠 WILZION EEG NeuroSim AI — Analysis Report</h1>
  <p>Patient: <strong style="color:#fff">${name || "Anonymous"}</strong> &nbsp;|&nbsp; ${session.date} ${session.time} &nbsp;|&nbsp; Scenario: ${session.scenario}</p>
  <p style="margin-top:6px">Garden City University · HCI Project · WILZION</p>
</div>
<div class="state-box">
  <div class="state-icon">${m.icon}</div>
  <div>
    <div class="state-name">${session.state.toUpperCase()}</div>
    <div class="state-summary">${session.summary}</div>
    <div class="state-rec">💡 ${session.recommendation}</div>
    ${session.profile_impact ? `<div class="profile-impact">🩺 ${session.profile_impact}</div>` : ""}
  </div>
</div>
<div class="section"><h2>Confidence Scores</h2><table>${confRows}</table></div>
<div class="section"><h2>EEG Band Power</h2><table>${bandRows}</table></div>
<div class="section"><h2>Subject Profile</h2><table>${
    p.name || p.age != null || p.gender || p.occupation
      ? [
          p.name ? `<tr><td style="padding:6px 12px">Name</td><td style="padding:6px 12px;font-weight:600">${p.name}</td></tr>` : "",
          p.age != null ? `<tr><td style="padding:6px 12px">Age</td><td style="padding:6px 12px;font-weight:600">${p.age}</td></tr>` : "",
          p.gender ? `<tr><td style="padding:6px 12px">Gender</td><td style="padding:6px 12px;font-weight:600">${p.gender}</td></tr>` : "",
          p.occupation ? `<tr><td style="padding:6px 12px">Occupation</td><td style="padding:6px 12px;font-weight:600">${p.occupation}</td></tr>` : "",
        ]
          .filter(Boolean)
          .join("")
      : `<tr><td style="padding:6px 12px;color:#94A3B8">No profile provided</td></tr>`
  }</table></div>
<div class="disclaimer">⚠️ <strong>Disclaimer:</strong> This report is generated by a simulated EEG system for educational and HCI research purposes only. It is not a medical diagnosis and should not be used for clinical decision-making. Consult a qualified healthcare professional for any health concerns.</div>
<div class="footer">Generated by WILZION EEG NeuroSim AI · WILZIONONLINE · Garden City University HCI Project</div>
</div></body></html>`;
}

export function downloadReportHTML(html, filename) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function drawWave(vals, phase, scenario, canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth || 640;
  const h = 80;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  const [c1, c2] =
    scenario === "stress"
      ? ["#F87171", "#EF4444"]
      : scenario === "focus"
        ? ["#34D399", "#10B981"]
        : scenario === "fatigue"
          ? ["#FBBF24", "#F59E0B"]
          : ["#60A5FA", "#8B5CF6"];
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = c1;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  for (let x = 0; x < w; x++) {
    const t = (x / w) * Math.PI * 12 + phase;
    const y =
      h / 2 +
      (vals[0] / 100) * 8 * Math.sin(0.3 * t) +
      (vals[1] / 100) * 5 * Math.sin(0.7 * t + 1) +
      (vals[2] / 100) * 6 * Math.sin(1.2 * t + 2) +
      (vals[3] / 100) * 7 * Math.sin(2.5 * t + 0.5) +
      (vals[4] / 100) * 3 * Math.sin(5 * t + 1.2);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}