import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
import EmailOTP from "../models/EmailOTP.js";
import dotenv from "dotenv";
// Ensure environment variables are loaded before configuring mailer
dotenv.config();

const router = express.Router();

// Email transporter setup with robust logging and Gmail support
function buildMailerConfig() {
  const env = process.env;
  // Force dev mode to bypass SMTP entirely and log/return OTPs
  if (String(env.FORCE_DEV_EMAIL || '').toLowerCase() === 'true') {
    return { jsonTransport: true, reason: 'FORCE_DEV_EMAIL enabled (bypass SMTP)' };
  }
  const useGmail = String(env.SMTP_SERVICE || env.GMAIL || "").toLowerCase() === "gmail" || String(env.USE_GMAIL || "").toLowerCase() === "true";
  const smtpUser = (env.SMTP_USER || env.GMAIL_USER || "").trim();
  const seemsGmail = /@gmail\.com$/i.test(smtpUser) || /@googlemail\.com$/i.test(smtpUser);

  // Gmail (App Password) path
  if (useGmail || (!env.SMTP_HOST && smtpUser && seemsGmail)) {
    const user = smtpUser;
    const pass = (env.SMTP_PASS || env.GMAIL_PASS || "").trim();
    const secure = String(env.SMTP_SECURE ?? "true").toLowerCase() === "true"; // default to 465
    const port = Number(env.SMTP_PORT || (secure ? 465 : 587));

    if (!user || !pass) {
      // Explicitly expose why we're not using SMTP to avoid silent failures
      return { jsonTransport: true, reason: 'Missing SMTP_USER or SMTP_PASS for Gmail (App Password required)' };
    }

    return {
      host: "smtp.gmail.com",
      port,
      secure,
      // Enable connection pooling for better reliability
      pool: true,
      auth: { user, pass },
      // Ensure modern TLS
      tls: { minVersion: 'TLSv1.2' }
    };
  }

  // Generic SMTP path
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: String(process.env.SMTP_IGNORE_TLS || "false").toLowerCase() === "true" ? { rejectUnauthorized: false } : undefined
    };
  }

  // Dev fallback: log emails to console as JSON
  return { jsonTransport: true, reason: 'No SMTP configured; using jsonTransport (dev mode)' };
}

function mask(value) {
  if (!value) return "";
  const str = String(value);
  if (str.length <= 4) return "****";
  return `${str.slice(0, 2)}****${str.slice(-2)}`;
}

const mailerConfig = buildMailerConfig();
const transporter = nodemailer.createTransport(mailerConfig);
const isDevJsonMode = mailerConfig.jsonTransport && (process.env.NODE_ENV || 'development') !== 'production';
// In-memory OTP store for dev when jsonTransport is used
const devOtpStore = new Map(); // key: lowercased email, value: { otp, expiresAt }

// Verify transporter on boot (non-fatal)
(async () => {
  try {
    const info = {
      host: mailerConfig.host || "jsonTransport",
      port: mailerConfig.port,
      secure: mailerConfig.secure,
      service: (process.env.SMTP_SERVICE || process.env.GMAIL || process.env.USE_GMAIL || "").toString(),
      user: mask((mailerConfig.auth && mailerConfig.auth.user) || "")
    };
    console.log("[Mailer] Config:", info);
    if (!mailerConfig.jsonTransport) {
      await transporter.verify();
      console.log("[Mailer] Transporter verified successfully");
    } else {
      console.log("[Mailer] Using jsonTransport (dev mode). Emails will be logged, not sent.");
    }
  } catch (err) {
    console.error("[Mailer] Transporter verification failed:", err && err.stack ? err.stack : err);
  }
})();

// Validation middleware
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[A-Za-z0-9_.-]+$/).withMessage('Username can contain letters, numbers, dot, dash, underscore only'),
  body('email')
    .isEmail().withMessage('Enter a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/).withMessage('Enter a valid phone number (e.g., +12345678901)'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
  body('role')
    .isIn(['customer', 'farmer', 'agricare', 'hub', 'admin']).withMessage('Invalid role')
];

// Register endpoint (requires verified email)
router.post('/register', registerValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, phone, password, role, profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Enforce email verification: require a verified, unexpired OTP record
    const emailLc = email.toLowerCase();
    const verifiedOtp = await EmailOTP.findOne({ email: emailLc, verified: true, expiresAt: { $gt: new Date() } });
    if (!verifiedOtp) {
      return res.status(400).json({ message: 'Please verify your email via OTP before registering' });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      phone,
      password, // Will be hashed by the pre-save middleware
      role,
      profileData
    });

    // Save user to database
    await newUser.save();

    // Cleanup OTP so it cannot be reused
    try { await EmailOTP.deleteMany({ email: emailLc }); } catch (_) {}

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Generate email OTP
router.post('/send-email-otp', [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  try {
    console.log('[OTP] Request to send OTP to:', email);
    if (mailerConfig.jsonTransport) {
      console.warn('[OTP] Mailer is in jsonTransport (dev) mode — emails will NOT be delivered. Configure SMTP env vars.');
    }
    const emailLc = email.toLowerCase();

    // Block sending OTP if email is already registered
    const existingUser = await User.findOne({ email: emailLc });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Rate limit: remove existing OTP for this email
    await EmailOTP.deleteMany({ email: emailLc });

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Dev path: store in-memory and return immediately
    if (isDevJsonMode) {
      devOtpStore.set(emailLc, { otp, expiresAt });
      return res.json({
        message: 'OTP generated (dev mode)',
        delivered: false,
        mode: 'jsonTransport',
        otp,
        appCheckHeader: Boolean(req.headers['x-app-check'])
      });
    }

    await EmailOTP.create({ email: emailLc, otpHash, expiresAt });

    const smtpUser = (mailerConfig && mailerConfig.auth && mailerConfig.auth.user) || process.env.SMTP_USER || '';
    const headerFrom = process.env.MAIL_FROM || smtpUser || 'no-reply@example.com';
    const mailOpts = {
      from: headerFrom, // Header 'From' (can include display name)
      to: email,
      subject: 'Your Cardo verification code',
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your verification code is <b>${otp}</b>. It expires in 5 minutes.</p>`,
      // Ensure SMTP envelope MAIL FROM equals the Gmail account used for auth
      envelope: smtpUser ? { from: smtpUser, to: email } : undefined
    };

    try {
      const info = await transporter.sendMail(mailOpts);
      console.log('[OTP] Mail sent response:', info && (info.messageId || info.envelope || info));
      res.json({ 
        message: 'OTP sent to email',
        delivered: !mailerConfig.jsonTransport,
        mode: mailerConfig.jsonTransport ? 'jsonTransport' : 'smtp',
        // surface basic anti-abuse headers presence for debugging
        appCheckHeader: Boolean(req.headers['x-app-check'])
      });
    } catch (mailErr) {
      console.error('[OTP] Failed to send email via transporter:', mailErr && mailErr.response || mailErr);
      // If it's an auth or TLS error, provide a clearer hint
      const code = mailErr && (mailErr.code || mailErr.responseCode);
      const isAuth = code === 'EAUTH' || (mailErr && /auth/i.test(String(mailErr.message)));
      const isTLS = code === 'ESOCKET' || (mailErr && /self signed certificate|tls/i.test(String(mailErr.message)));

      // Dev fallback: do not break the flow. Return OTP in response for testing
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        // Ensure DB record exists for verify path
        try {
          const existing = await EmailOTP.findOne({ email: emailLc });
          if (!existing) {
            await EmailOTP.create({ email: emailLc, otpHash, expiresAt });
          }
        } catch (_) {}
        return res.json({
          message: 'OTP generated (dev fallback due to SMTP error)',
          delivered: false,
          mode: 'smtp-fallback',
          otp,
          hint: isAuth ? 'Check SMTP user/pass or Gmail App Password.' : (isTLS ? 'Check TLS/port 465/587.' : 'Check SMTP connectivity.'),
          appCheckHeader: Boolean(req.headers['x-app-check'])
        });
      }

      return res.status(500).json({ 
        message: 'Failed to send OTP email',
        hint: isAuth ? 'Check SMTP user/pass or App Password for Gmail.' : (isTLS ? 'Check TLS/port settings.' : undefined)
      });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify email OTP
router.post('/verify-email-otp', [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('otp').isLength({ min: 4, max: 8 }).withMessage('Invalid OTP')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;
  try {
    const emailLc = email.toLowerCase();
    if (isDevJsonMode) {
      const item = devOtpStore.get(emailLc);
      if (!item) return res.status(400).json({ message: 'OTP not found or already used' });
      if (new Date() > item.expiresAt) {
        devOtpStore.delete(emailLc);
        return res.status(400).json({ message: 'OTP expired' });
      }
      if (String(otp) !== String(item.otp)) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      try {
        const bcrypt = await import('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, salt);
        const expiresAt = item.expiresAt || new Date(Date.now() + 10 * 60 * 1000);
        // Persist a verified record so /register can check it
        await EmailOTP.findOneAndUpdate(
          { email: emailLc },
          { email: emailLc, otpHash, verified: true, expiresAt, attempts: 0 },
          { upsert: true, new: true }
        );
      } catch (_) {}
      devOtpStore.delete(emailLc);
      return res.json({ message: 'Email verified (dev mode)' });
    }

    const record = await EmailOTP.findOne({ email: emailLc });
    if (!record) return res.status(400).json({ message: 'OTP not found or already used' });
    if (new Date() > record.expiresAt) {
      await EmailOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    const bcrypt = await import('bcrypt');
    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      // increment attempts and optionally block after N tries
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // success — mark as verified so /register can allow creation
    record.verified = true;
    await record.save();
    return res.json({ message: 'Email verified' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Sign-In: exchange Firebase/Google ID token for app JWT
router.post('/google', [
  body('idToken').notEmpty().withMessage('idToken is required'),
  body('role').optional().isIn(['customer', 'farmer', 'agricare', 'hub']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { idToken, role: requestedRole } = req.body;
  try {
    // Verify Google ID token using Google tokeninfo endpoint (simple, server-side)
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
      try {
        const nf = await import('node-fetch');
        fetchFn = nf.default || nf;
      } catch (e) {
        return res.status(500).json({ message: 'Server missing fetch. Use Node.js 18+ or install node-fetch.' });
      }
    }

    const resp = await fetchFn(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!resp.ok) {
      return res.status(401).json({ message: 'Invalid Google ID token' });
    }
    const info = await resp.json();

    // Optional: enforce audience if set
    const expectedAud = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (expectedAud && info.aud && info.aud !== expectedAud) {
      return res.status(401).json({ message: 'Invalid token audience' });
    }

    const emailVerified = String(info.email_verified || info.emailVerified || '').toLowerCase() === 'true' || info.email_verified === true;
    const email = info.email;
    if (!email || !emailVerified) {
      return res.status(400).json({ message: 'Google account email not verified' });
    }

    // Find or create user by email
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create a unique username from Google name or email local-part
      const base = (info.name || email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').slice(0, 20) || 'user';
      let candidate = base;
      let suffix = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const exists = await User.findOne({ username: candidate });
        if (!exists) break;
        suffix += 1;
        candidate = `${base}${suffix}`.slice(0, 30);
      }

      // Generate random password so schema pre-save can hash it
      const randomPass = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

      user = new User({
        username: candidate,
        email: email.toLowerCase(),
        password: randomPass,
        role: requestedRole || 'customer',
        profileData: {
          name: info.name || undefined,
          picture: info.picture || undefined,
          provider: 'google',
          googleSub: info.sub
        }
      });
      await user.save();
    } else if (requestedRole && user.role !== requestedRole) {
      // Update existing user's role if a different role is selected
      user.role = requestedRole;
      await user.save();
    }

    // Issue app JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

export default router;

// Mailer diagnostics (do not expose in production)
router.get('/mailer-status', (req, res) => {
  try {
    const status = {
      mode: mailerConfig.jsonTransport ? 'jsonTransport' : 'smtp',
      host: mailerConfig.host || null,
      port: mailerConfig.port || null,
      secure: Boolean(mailerConfig.secure),
      userConfigured: Boolean(mailerConfig.auth && mailerConfig.auth.user),
      hints: mailerConfig.jsonTransport ? [
        'Emails are not delivered in jsonTransport mode.',
        'Set USE_GMAIL=true and SMTP_USER/SMTP_PASS to enable Gmail SMTP.',
        'Ensure SMTP_SECURE=true and SMTP_PORT=465 for Gmail.'
      ] : []
    };
    res.json(status);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get mailer status' });
  }
});

// Debug endpoint to check users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email role createdAt').lean();
    res.json({ 
      count: users.length, 
      users: users.map(u => ({ 
        username: u.username, 
        email: u.email, 
        role: u.role, 
        createdAt: u.createdAt 
      }))
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});