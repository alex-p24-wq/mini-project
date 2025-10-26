import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, AlertCircle, User, Mail, Phone, Lock, FileText, MapPin, Building, Shield } from "lucide-react";
import "../css/RegisterPage.css";
import { registerUser, sendEmailOtp, verifyEmailOtp, loginWithGoogle } from "../services/api";
import { signInWithGoogle } from "../services/googleAuth";
import { 
  validateUsername, 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  validateConfirm, 
  roleFieldValidators,
  sanitizeObject
} from "../utils/validation";

const roleMeta = {
  customer: { 
    label: "Customer", 
    image: "/images/img 1.jpeg", 
    tagline: "Shop and trade with ease",
    icon: User,
    color: "#3B82F6"
  },
  farmer: { 
    label: "Farmer", 
    image: "/images/img 3.jpeg", 
    tagline: "Grow. Grade. Get better prices",
    icon: MapPin,
    color: "#10B981"
  },
  agricare: { 
    label: "AgriCare", 
    image: "/images/img 11.jpg", 
    tagline: "Supply quality. Serve farmers",
    icon: Building,
    color: "#F59E0B"
  },
  hub: { 
    label: "Hub Manager", 
    image: "/images/img 5.jpeg", 
    tagline: "Run operations smoothly",
    icon: Shield,
    color: "#8B5CF6"
  },
  admin: { 
    label: "Admin", 
    image: "/images/img 6.jpeg", 
    tagline: "Securely manage access",
    icon: Shield,
    color: "#EF4444"
  },
};

const roles = Object.keys(roleMeta).filter((k) => k !== "admin");

export default function RegisterPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("customer");
  const [step, setStep] = useState(1); // 1: Account, 2: Details, 3: Review
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", confirm: "" });
  const [roleData, setRoleData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [touched, setTouched] = useState({});
  const [roleTouched, setRoleTouched] = useState({});
  const [emailVerified, setEmailVerified] = useState(false);

  const { image, label, tagline, icon: RoleIcon, color } = roleMeta[activeRole];

  // Disable page scroll while on the registration page; only the right pane scrolls
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const strength = useMemo(() => {
    const p = form.password || "";
    let s = 0; if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }, [form.password]);
  const strengthLabel = useMemo(() => ["Weak", "Fair", "Good", "Strong"][Math.max(0, strength - 1)] || "" , [strength]);
  const errors = useMemo(() => {
    const e = {};
    const u = validateUsername(form.username);
    if (u) e.username = u;
    const em = validateEmail(form.email);
    if (em) e.email = em;
    const ph = validatePhone(form.phone);
    if (ph) e.phone = ph;
    const pw = validatePassword(form.password);
    if (pw) e.password = pw;
    const cf = validateConfirm(form.password, form.confirm);
    if (cf) e.confirm = cf;
    return e;
  }, [form]);

  const roleErrors = useMemo(() => {
    const vmap = roleFieldValidators[activeRole] || {};
    const out = {};
    Object.keys(vmap).forEach((key) => {
      const message = vmap[key](roleData[key]);
      if (message) out[key] = message;
    });
    return out;
  }, [activeRole, roleData]);

  const roleFields = useMemo(() => ({
    customer: [
      { name: "fullName", label: "Full Name", type: "text", col: 2 },
      { name: "address", label: "Address", type: "textarea", col: 2 },
    ],
    farmer: [
      { name: "fullName", label: "Full Name", type: "text", col: 2 },
      { name: "farmLocation", label: "Farm Location", type: "text", col: 2 },
      { name: "farmSize", label: "Farm Size (acres)", type: "number" },
      { name: "idProof", label: "ID Proof (PDF/Image)", type: "file", accept: ".pdf,.png,.jpg,.jpeg", required: true },
      { name: "notes", label: "Notes (optional)", type: "textarea", col: 2 },
    ],
    agricare: [
      { name: "businessName", label: "Business Name", type: "text", col: 2 },
      { name: "licenseNo", label: "License No.", type: "text" },
      { name: "gstNo", label: "GST No.", type: "text" },
      { name: "address", label: "Business Address", type: "textarea", col: 2 },
    ],
    hub: [
      { name: "managerName", label: "Manager Name", type: "text" },
      { name: "hubLocation", label: "Hub Location", type: "text", col: 2 },
      { name: "capacity", label: "Capacity (tons)", type: "number" },
      { name: "idProof", label: "ID Proof (PDF/Image)", type: "file", accept: ".pdf,.png,.jpg,.jpeg" },
    ],
    admin: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "roleKey", label: "Admin Role", type: "select", options: ["SuperAdmin", "Ops", "Support"] },
    ],
  }), []);

  const fields = roleFields[activeRole];

  const next = () => {
    setApiError(null);
    setTouched((t) => ({ ...t, username: true, email: true, phone: true, password: true, confirm: true }));
    if (step === 1) {
      // For step 1, only require a valid email and verified OTP to proceed
      if (errors.email) return;
      if (!emailVerified) { setApiError('Please verify your email first.'); return; }
      setStep(2);
      return;
    }
    if (step === 2) {
      // mark role fields touched to show errors
      const vmap = roleFieldValidators[activeRole] || {};
      const allTouched = Object.keys(vmap).reduce((acc, k) => { acc[k] = true; return acc; }, {});
      setRoleTouched((rt) => ({ ...rt, ...allTouched }));
      if (Object.keys(roleErrors).length > 0) return;
      setStep(3);
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNext = useMemo(() => {
    if (step === 1) {
      // Only require a valid email and verified OTP to advance from step 1
      return !errors.email && !!form.email && emailVerified;
    }
    return true;
  }, [step, errors, emailVerified, form.email]);

  const onInput = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));
  const onRoleInput = (e) => {
    const { name, type, value, files } = e.target;
    setRoleData((d) => ({ ...d, [name]: type === "file" ? (files && files[0]) : value }));
  };
  const onRoleBlur = (e) => setRoleTouched((rt) => ({ ...rt, [e.target.name]: true }));

  // Handle form submission to MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    setApiError(null);
    
    // Validate form before submission
    if (!canNext) {
      // Mark all fields as touched to show validation errors
      const allTouched = Object.keys(errors).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      return;
    }
    
    // Check if passwords match
    if (form.password !== form.confirm) {
      setApiError("Passwords do not match");
      return;
    }
    // Validate role-specific data on submit as well
    const vmap = roleFieldValidators[activeRole] || {};
    const allRoleTouched = Object.keys(vmap).reduce((acc, k) => { acc[k] = true; return acc; }, {});
    setRoleTouched((rt) => ({ ...rt, ...allRoleTouched }));
    if (Object.keys(roleErrors).length > 0 && step !== 3) {
      setStep(2);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare user data for submission
      // Coerce some numeric fields
      const normalizedRoleData = { ...roleData };
      ["farmSize", "capacity"].forEach((k) => {
        if (normalizedRoleData[k] !== undefined && normalizedRoleData[k] !== null && normalizedRoleData[k] !== "") {
          const n = Number(normalizedRoleData[k]);
          if (!Number.isNaN(n)) normalizedRoleData[k] = n;
        }
      });

      const userData = {
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: activeRole,
        profileData: sanitizeObject(normalizedRoleData)
      };
      
      // Submit to API
      const response = await registerUser(userData);
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect to dashboard or home page
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <motion.div 
      className="register-wrapper theme-v2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Left media area changes with role */}
        <motion.div 
          className="register-image"
          key={activeRole}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src={image} alt={label} />
          <motion.div 
            className="image-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <RoleIcon size={24} style={{ marginRight: '8px', display: 'inline-block' }} />
            {label}: {tagline}
          </motion.div>
        </motion.div>

        {/* Right form */}
        <motion.form 
          className="register-form" 
          onSubmit={(e) => e.preventDefault()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="form-header">
            <img className="form-logo" src="/images/cardooo1.jpg" alt="Cardo logo" loading="lazy" />
            <motion.h2 
              className="title"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Create Account
            </motion.h2>
            <motion.p 
              className="subtitle"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Join Cardo — tailored experience for your role
            </motion.p>


            {showRoleModal && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Choose your role"
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                onClick={() => !isLoading && setShowRoleModal(false)}
              >
                <div
                  style={{ background: '#fff', borderRadius: 12, width: 'min(440px, 92vw)', padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ margin: 0, marginBottom: 12, color: '#2e7d32', fontSize: 20, fontWeight: 800 }}>Continue as</h3>
                  <p style={{ marginTop: 0, color: '#37474f', marginBottom: 16, fontSize: 14 }}>Choose your role to personalize your dashboard.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {roles.map((key) => (
                      <button
                        key={key}
                        disabled={isLoading}
                        onClick={async () => {
                          setApiError(null);
                          try {
                            // Clear any existing session first
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');

                            setActiveRole(key);
                            const { idToken } = await signInWithGoogle();
                            const resp = await loginWithGoogle(idToken, key);
                            if (resp && resp.token) {
                              localStorage.setItem('token', resp.token);
                              localStorage.setItem('user', JSON.stringify(resp.user));
                              setShowRoleModal(false);
                              navigate('/dashboard', { replace: true });
                            }
                          } catch (err) {
                            setApiError(err?.message || 'Google sign-up failed');
                          }
                        }}
                        style={{ padding: 12, borderRadius: 10, border: '1px solid #cfd8dc', background: '#fff', cursor: 'pointer', color: '#1f2937', fontWeight: 700, textAlign: 'center' }}
                      >
                        {roleMeta[key].label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    <button
                      disabled={isLoading}
                      onClick={() => setShowRoleModal(false)}
                      style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cfd8dc', background: '#fff', cursor: 'pointer', color: '#1f2937', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <AnimatePresence>
              {apiError && (
                <motion.div 
                  className="api-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <AlertCircle size={16} style={{ marginRight: '8px', display: 'inline-block' }} />
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="role-tabs" 
              role="tablist" 
              aria-label="Select user type"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {roles.map((key, index) => {
                const IconComponent = roleMeta[key].icon;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    className={`role-tab ${activeRole === key ? "active" : ""}`}
                    onClick={() => setActiveRole(key)}
                    aria-selected={activeRole === key}
                    title={roleMeta[key].tagline}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + index * 0.06, duration: 0.25 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      borderColor: activeRole === key ? roleMeta[key].color : undefined,
                      backgroundColor: activeRole === key ? `${roleMeta[key].color}15` : undefined
                    }}
                  >
                    <IconComponent size={16} style={{ marginRight: '6px' }} />
                    {roleMeta[key].label}
                  </motion.button>
                );
              })}
            </motion.div>

            <div className="divider" style={{ marginTop: 8 }}><span>or continue with</span></div>
            <div className="social-login" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="social-btn google-btn"
                disabled={isLoading}
                onClick={() => setShowRoleModal(true)}
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
                Sign up with Google
              </button>
            </div>

            <motion.div 
              className="progress" 
              aria-label="Registration progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <motion.div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              <div className="steps-labels">
                <motion.span 
                  className={step >= 1 ? "active" : ""}
                  animate={{ color: step >= 1 ? color : undefined }}
                  transition={{ duration: 0.2 }}
                >
                  Account
                </motion.span>
                <motion.span 
                  className={step >= 2 ? "active" : ""}
                  animate={{ color: step >= 2 ? color : undefined }}
                  transition={{ duration: 0.2 }}
                >
                  Details
                </motion.span>
                <motion.span 
                  className={step >= 3 ? "active" : ""}
                  animate={{ color: step >= 3 ? color : undefined }}
                  transition={{ duration: 0.2 }}
                >
                  Review
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
            {step === 1 && (
              <div className="form-grid">
                <motion.div 
                  className="input-group" 
                  style={{ gridColumn: "span 2" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <label htmlFor="username">
                    <User size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                    Username
                  </label>
                  <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    placeholder="Enter username" 
                    value={form.username} 
                    onChange={onInput} 
                    onBlur={onBlur} 
                    required 
                    className={touched.username && errors.username ? "error" : ""}
                  />
                  <AnimatePresence>
                    {touched.username && errors.username && (
                      <motion.div 
                        className="error-text"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle size={12} style={{ marginRight: '4px', display: 'inline-block' }} />
                        {errors.username}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="input-group" 
                  style={{ gridColumn: "span 2" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label htmlFor="email">
                    <Mail size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                    Email
                  </label>
                  <div className="email-otp-row">
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="Enter email" 
                      value={form.email} 
                      onChange={onInput} 
                      onBlur={onBlur} 
                      required 
                      className={touched.email && errors.email ? "error" : ""}
                    />
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={async () => {
                        setTouched((t) => ({ ...t, email: true }));
                        const em = validateEmail(form.email);
                        if (em) return;
                        try {
                          setIsLoading(true);
                          const resp = await sendEmailOtp(form.email);
                          if (resp) {
                            if (resp.mode === 'smtp') {
                              setApiError('OTP sent to your email! Please check your inbox.');
                            } else if (resp.mode === 'jsonTransport' && resp.otp) {
                              // Dev mode: show and prefill OTP since emails aren't delivered
                              setRoleData((d) => ({ ...d, emailOtp: resp.otp }));
                              setApiError('Dev mode: OTP generated and shown below. Emails are not delivered.');
                            } else if (resp.mode === 'smtp-fallback' && resp.otp) {
                              // SMTP error fallback in development: show OTP with hint
                              setRoleData((d) => ({ ...d, emailOtp: resp.otp }));
                              setApiError(`Email delivery failed (${resp.hint || 'check SMTP settings'}). Using dev fallback: OTP shown below.`);
                            } else if (resp.delivered === false && resp.otp) {
                              // Generic fallback if mode is missing
                              setRoleData((d) => ({ ...d, emailOtp: resp.otp }));
                              setApiError('OTP generated and shown below.');
                            } else {
                              setApiError('OTP request processed.');
                            }
                          } else {
                            setApiError('Failed to send OTP');
                          }
                        } catch (err) {
                          setApiError(err.message || 'Failed to send OTP');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={!!errors.email || !form.email || isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                  <div className="input-group" style={{ marginTop: 8 }}>
                    <label htmlFor="emailOtp">
                      <FileText size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                      Email OTP
                    </label>
                    <input
                      id="emailOtp"
                      name="emailOtp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit code"
                      value={roleData.emailOtp || ''}
                      onBlur={() => setTouched((t) => ({ ...t, emailOtp: true }))}
                      onChange={(e) => setRoleData((d) => ({ ...d, emailOtp: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={async () => {
                        const code = String(roleData.emailOtp || '').trim();
                        if (code.length < 4) { setApiError('Enter OTP'); return; }
                        try {
                          setIsLoading(true);
                          await verifyEmailOtp(form.email, code);
                          setEmailVerified(true);
                          setApiError(null);
                        } catch (err) {
                          setEmailVerified(false);
                          setApiError(err.message || 'Invalid OTP');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={!form.email || isLoading}
                      style={{ marginTop: 6 }}
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                  <AnimatePresence>
                    {touched.email && errors.email && (
                      <motion.div 
                        className="error-text"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle size={12} style={{ marginRight: '4px', display: 'inline-block' }} />
                        {errors.email}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="input-group" 
                  style={{ gridColumn: "span 2" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <label htmlFor="phone">
                    <Phone size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                    Phone
                  </label>
                  <input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="Enter phone" 
                    value={form.phone} 
                    onChange={onInput} 
                    onBlur={onBlur} 
                    required
                    className={touched.phone && errors.phone ? "error" : ""}
                  />
                  <AnimatePresence>
                    {touched.phone && errors.phone && (
                      <motion.div 
                        className="error-text"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle size={12} style={{ marginRight: '4px', display: 'inline-block' }} />
                        {errors.phone}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="password-row input-group" 
                  style={{ gridColumn: "span 2" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label htmlFor="password">
                    <Lock size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                    Password
                  </label>
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password" 
                    value={form.password} 
                    onChange={onInput} 
                    onBlur={onBlur} 
                    required 
                    className={touched.password && errors.password ? "error" : ""}
                  />
                  <motion.button
                    type="button"
                    className="toggle-visibility icon"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                    title={showPassword ? "Hide password" : "Show password"}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                  <motion.div 
                    className="strength" 
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.span 
                      style={{ width: `${(strength / 4) * 100}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </motion.div>
                  <div className="help">
                    <CheckCircle size={12} style={{ marginRight: '4px', display: 'inline-block', color: strength >= 3 ? '#10B981' : '#6B7280' }} />
                    Strength: {strengthLabel || ""} • Use 8+ chars with upper, number, symbol.
                  </div>
                </motion.div>

                <motion.div 
                  className="password-row input-group" 
                  style={{ gridColumn: "span 2" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label htmlFor="confirm">
                    <Lock size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                    Confirm Password
                  </label>
                  <input 
                    id="confirm" 
                    name="confirm" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Re-enter password" 
                    value={form.confirm} 
                    onChange={onInput} 
                    onBlur={onBlur} 
                    required 
                    className={touched.confirm && errors.confirm ? "error" : ""}
                  />
                  <AnimatePresence>
                    {touched.confirm && errors.confirm && (
                      <motion.div 
                        className="error-text"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle size={12} style={{ marginRight: '4px', display: 'inline-block' }} />
                        {errors.confirm}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

          {step === 2 && (
            <div className="form-grid">
              {fields.map((f) => (
                <div 
                  className={`input-group ${f.type === 'password' ? 'password-row' : ''}`}
                  key={f.name} 
                  style={{ gridColumn: f.col ? `span ${f.col}` : "span 1" }}
                >
                  <label htmlFor={f.name}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea id={f.name} name={f.name} placeholder={`Enter ${f.label.toLowerCase()}`} value={roleData[f.name] || ""} onChange={onRoleInput} onBlur={onRoleBlur} />
                  ) : f.type === "select" ? (
                    <select id={f.name} name={f.name} value={roleData[f.name] || ""} onChange={onRoleInput} onBlur={onRoleBlur}>
                      <option value="" disabled>Select {f.label.toLowerCase()}</option>
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input id={f.name} name={f.name} type={f.type} accept={f.accept} placeholder={`Enter ${f.label.toLowerCase()}`} value={f.type === "file" ? undefined : (roleData[f.name] ?? "")} onChange={onRoleInput} onBlur={onRoleBlur} required={Boolean(f.required)} />
                  )}
                  {f.type === "file" && <div className="file-note">Accepted: PDF/PNG/JPG. Max 5MB.</div>}
                  <AnimatePresence>
                    {roleTouched[f.name] && roleErrors[f.name] && (
                      <motion.div 
                        className="error-text"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle size={12} style={{ marginRight: '4px', display: 'inline-block' }} />
                        {roleErrors[f.name]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="review">
              <div className="review-row"><strong>Role</strong><span>{label}</span></div>
              <div className="review-row"><strong>Username</strong><span>{form.username || "—"}</span></div>
              <div className="review-row"><strong>Email</strong><span>{form.email || "—"}</span></div>
              <div className="review-row"><strong>Phone</strong><span>{form.phone || "—"}</span></div>
              {/* Simple summary of role fields */}
              {fields?.length ? (
                <div style={{ marginTop: 8 }}>
                  {fields.map((f) => (
                    <div key={f.name} className="review-row"><strong>{f.label}</strong><span>{(typeof roleData[f.name] === 'object' && roleData[f.name]?.name) ? roleData[f.name].name : (String(roleData[f.name] ?? "—"))}</span></div>
                  ))}
                </div>
              ) : null}
              <p className="help">You can edit details by going back before submitting.</p>
            </div>
          )}
            </motion.div>
        </AnimatePresence>

        {/* Sticky actions footer inside the form pane */}
        <div className="actions form-footer">
          <div className="nav-buttons">
            {step > 1 && (
              <button type="button" className="ghost-btn" onClick={back}>Back</button>
            )}
            {step < 3 ? (
              <button type="button" className="submit-btn" onClick={next} disabled={!canNext}>Next{step === 1 && !emailVerified ? ' (verify email first)' : ''}</button>
            ) : (
              <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create account"}
              </button>
            )}
          </div>
          <div className="alt">Already have an account? <a href="/login">Login</a></div>
        </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
} 