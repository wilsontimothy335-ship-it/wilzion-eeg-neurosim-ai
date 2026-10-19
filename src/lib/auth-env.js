// Base44's hosted Google sign-in and logout only accept redirects back to
// domains registered for the app. GitHub Codespaces preview addresses are not
// registered, so those flows fail with "Invalid redirect domain" there.
const hostname = typeof window !== "undefined" ? window.location.hostname : "";

export const IS_CODESPACES = /\.(app\.github\.dev|githubpreview\.dev)$/.test(hostname);

// Email/password sign-in works everywhere; Google sign-in does not on Codespaces.
export const GOOGLE_LOGIN_SUPPORTED = !IS_CODESPACES;

// Clear the saved session and go back to the app's own login page without
// bouncing through Base44's hosted logout redirect.
export function localLogout() {
  try {
    window.localStorage.removeItem("base44_access_token");
    window.localStorage.removeItem("token");
  } catch {
    // storage unavailable - nothing to clear
  }
  window.location.href = "/login";
}
