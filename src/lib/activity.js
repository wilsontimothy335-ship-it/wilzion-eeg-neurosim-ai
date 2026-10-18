import { base44 } from "@/api/base44Client";

let cachedMe = null;

// Records an activity for the admin monitor. Fire-and-forget:
// logging must never break the user's flow.
export async function logActivity(action, details = "") {
  try {
    if (!cachedMe) {
      cachedMe = await base44.auth.me();
    }
    await base44.entities.ActivityLog.create({
      action,
      user_email: cachedMe.email ?? "",
      user_name: cachedMe.full_name ?? "",
      details,
    });
  } catch {
    // silently skip — activity logging is best-effort
  }
}