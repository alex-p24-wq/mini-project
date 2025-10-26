// Firebase initialization and Google sign-in helper
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// TODO: Move these to environment variables for production
const firebaseConfig = {
  apiKey: "AIzaSyBThNEq2wzP1ybF0A1DtLxB-Fn44XDg0Yc",
  authDomain: "cardo-6cd15.firebaseapp.com",
  projectId: "cardo-6cd15",
  storageBucket: "cardo-6cd15.firebasestorage.app",
  messagingSenderId: "730278224394",
  appId: "1:730278224394:web:bced3ccd89785923fd35f3",
  measurementId: "G-KTQY1206SC"
};

// Ensure we initialize only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Analytics is optional; enable only if supported in the environment
try {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
} catch (_) {
  // ignore analytics errors (e.g., in non-browser contexts)
}

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('openid');
provider.addScope('email');
provider.addScope('profile');
provider.setCustomParameters({ prompt: 'select_account' });

// Opens Google popup and returns user + Google OAuth ID token
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const googleIdToken = credential && credential.idToken;
  if (!googleIdToken) {
    const error = new Error('Google sign-in did not return an ID token');
    error.code = 'NO_GOOGLE_ID_TOKEN';
    throw error;
  }
  return { user, idToken: googleIdToken };
}

export { app, auth };