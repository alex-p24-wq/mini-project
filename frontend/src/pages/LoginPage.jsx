import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../services/api";
import "../css/LoginPage.css";
import { validateUsername, validatePassword } from "../utils/validation";
import { signInWithGoogle } from "../services/googleAuth";


function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const e = {};
    const u = validateUsername(formData.username);
    if (u) e.username = u;
    const p = validatePassword(formData.password);
    if (p) e.password = p;
    return e;
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // client-side validation
    const allTouched = { username: true, password: true };
    setTouched((t) => ({ ...t, ...allTouched }));
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser(formData);
      
      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      
      // Redirect back to intended page if provided, else dashboard
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect");
      navigate(redirectTo || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left Side - Image */}
        <div className="login-image">
          <img src="/images/cardooo1.jpg" alt="Cardamom" />
          <h2 className="image-text">Welcome to Nature 🌱</h2>
        </div>

        {/* Right Side - Form */}
        <div className="login-form">
          <h2 className="title">Welcome Back 👋</h2>
          <p className="subtitle">Login to continue your journey</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="text" 
                name="username"
                placeholder="Username" 
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                required 
              />
              {touched.username && errors.username && (
                <div className="error-message" style={{ marginTop: 6 }}>{errors.username}</div>
              )}
            </div>

            <div className="input-group">
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required 
              />
              {touched.password && errors.password && (
                <div className="error-message" style={{ marginTop: 6 }}>{errors.password}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="divider"><span>or continue with</span></div>

          {/* Social Logins */}
          <div className="social-login">
            <button 
              type="button"
              className="social-btn google-btn" 
              disabled={loading}
              onClick={async () => {
                setError("");
                setLoading(true);
                try {
                  const { user, idToken } = await signInWithGoogle();
                  // Exchange Google ID token for app JWT (matches registered email and role on server)
                  const resp = await loginWithGoogle(idToken);

                  // Store server-issued JWT and user
                  localStorage.setItem("user", JSON.stringify(resp.user));
                  localStorage.setItem("token", resp.token);

                  const params = new URLSearchParams(window.location.search);
                  const redirectTo = params.get("redirect");
                  navigate(redirectTo || "/dashboard", { replace: true });
                } catch (err) {
                  console.error("Google sign-in failed:", err);
                  setError(err?.message || "Google sign-in failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
              />
              Google
            </button>
            <button className="social-btn facebook-btn" disabled={loading}>
              <img
                src="/images/fb.svg"
                alt="Facebook"
              />
              Facebook
            </button>
          </div>

          <p className="footer-text">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;