// Simple auth helpers to manage app auth state and Firebase sign-out
import { signOut } from "firebase/auth";
import { auth } from "./googleAuth";

export function isAuthenticated() {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return Boolean(user && token);
  } catch (_) {
    return false;
  }
}

export async function logout() {
  // Clear local session
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  } catch (_) { /* ignore storage errors */ }

  // Best-effort Firebase sign-out (if initialized)
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (_) { /* ignore firebase errors */ }
}