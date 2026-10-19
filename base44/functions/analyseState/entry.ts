import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const BAND_NAMES = ["Delta", "Theta", "Alpha", "Beta", "Gamma"];
const BAND_FREQ = ["0.5–4 Hz", "4–8 Hz", "8–12 Hz", "13–30 Hz", "30–100 Hz"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bands, profile } = body ?? {};

    if (!Array.isArray(bands) || bands.length !== 5 || !bands.every((v) => typeof v === "number")) {
      return Response.json({ error: "Invalid EEG bands (expected 5 numbers)." }, { status: 400 });
    }
    const p = profile ?? {};
    const hasProfile = p.name || p.age != null || p.gender || p.occupation;

    const eegDesc = bands
      .map((v, i) => `${BAND_NAMES[i]} (${BAND_FREQ[i]}): ${Math.round(v)} μV²/Hz`)
      .join("\n");

    const profileDesc = hasProfile
      ? `Name: ${p.name ?? "Anonymous"}\n` +
        `Age: ${p.age ?? "N/A"}\n` +
        `Gender: ${p.gender ?? "N/A"}\n` +
        `Occupation: ${p.occupation ?? "N/A"}`
      : "Not provided";

    const prompt = `You are a clinical EEG analysis AI for the WILZION EEG NeuroSim system, a simulated EEG mental-state classifier used for HCI research at Garden City University.

You are given simulated EEG band power readings (in μV²/Hz) across the five standard frequency bands, plus an optional brief subject profile.

EEG BAND POWER:
${eegDesc}

SUBJECT PROFILE:
${profileDesc}

EEG interpretation guidance:
- Stress: elevated Beta (13–30 Hz) and Gamma (30–100 Hz), suppressed Alpha (8–12 Hz).
- Focus: strong Alpha with moderate Beta — optimal cognitive engagement.
- Fatigue: dominant Delta (0.5–4 Hz) and Theta (4–8 Hz), suppressed higher frequencies.
- Neutral: balanced band power across all ranges.
- If a subject profile is provided, use it only as light contextual interpretation (e.g. occupation-related cognitive load, age-related alertness patterns). Never diagnose any condition.

Classify the subject's current dominant mental state as exactly one of: stress, focus, fatigue, or neutral.
Provide a confidence percentage for EACH of the four states (they should roughly sum to 100 but are independent estimates).
Write a concise clinical summary (1–2 sentences), a single actionable recommendation, and a short note on how the subject profile influenced the result (profile_impact — or state that no profile was provided).

Return ONLY the JSON object matching the requested schema.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          state: { type: "string", enum: ["stress", "focus", "fatigue", "neutral"] },
          confidence: {
            type: "object",
            properties: {
              stress: { type: "number" },
              focus: { type: "number" },
              fatigue: { type: "number" },
              neutral: { type: "number" },
            },
            required: ["stress", "focus", "fatigue", "neutral"],
          },
          summary: { type: "string" },
          recommendation: { type: "string" },
          profile_impact: { type: "string" },
        },
        required: ["state", "confidence", "summary", "recommendation", "profile_impact"],
      },
    });

    return Response.json(res);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
